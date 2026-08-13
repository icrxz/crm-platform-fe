# Dropdown Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the shared `Dropdown` component to support `disabled` and `error` states (matching `TextInput`), then replace duplicated raw `<select>` fields with it across the 3 entity forms that have selects (customer, partner, case).

**Architecture:** One component change (`Dropdown`) followed by three independent, per-file migration tasks. Each migration task only touches its own form file and is independently shippable/revertable.

**Tech Stack:** Next.js 16 (App Router, Server Actions via `useActionState`), React 18.3.1, Tailwind CSS, Jest + `@testing-library/react` + `@testing-library/jest-dom`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-15-dropdown-consolidation-design.md` — follow it exactly for scope decisions.
- `contractor-form.tsx` has no `<select>` fields — no task touches it.
- Out of scope: any `Dropdown` usage outside the 4 entity forms (`panel/search.tsx`, `cases/filter-modal.tsx`, `partners/filter-modal.tsx`) — do not touch them.
- Disabled style standardizes on `disabled:bg-gray-100` / `disabled:cursor-not-allowed`, matching `TextInput`.
- No automated render tests for the 3 form files — `useActionState` (React 19 API) is not available in the installed React 18.3.1 in the Jest environment (confirmed during the `TextInput` consolidation work). This is pre-existing and out of scope to fix. Verification for migration tasks is: TypeScript compiles, ESLint passes, and manual browser testing (documented per task).
- The `Dropdown` component itself has no dependency on `useActionState`, so it gets full automated test coverage.
- The `case-form.tsx` "state" select currently has a pre-existing bug: `value={customer?.shipping.state}` with no `onChange` (controlled input without a handler, triggers a React warning). Task 4 fixes this by switching to `defaultValue`, matching the uncontrolled pattern already used by the form's other fields.

---

## Task 1: Refine the `Dropdown` component

**Files:**

- Modify: `src/app/components/common/dropdown/dropdown.tsx`
- Test: `src/app/components/common/dropdown/dropdown.test.tsx` (new)

**Interfaces:**

- Produces: `Dropdown(props: DropdownProps)` where

  ```ts
  interface DropdownOption {
    id: string;
    value: string;
    label: string;
  }

  interface DropdownProps {
    name: string;
    label: string;
    options: Array<DropdownOption>;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    optional?: boolean;
    error?: string;
  }
  ```

  Later tasks (2-4) import `{ Dropdown }` from `../common/dropdown/dropdown` and pass `name`, `label`, `options`, `required`, `disabled`, `defaultValue`.

- Consumes: `ErrorMessage` from `src/app/components/common/error-message/index.tsx` — `ErrorMessage({ message: string })`.

- [ ] **Step 1: Write failing tests for the new props**

Create `src/app/components/common/dropdown/dropdown.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Dropdown } from './dropdown';

const options = [
  { id: 'SP', value: 'SP', label: 'SP' },
  { id: 'RJ', value: 'RJ', label: 'RJ' },
];

describe('Dropdown', () => {
  it('renders the label associated with the select via htmlFor/id', () => {
    render(<Dropdown name="state" label="Estado" options={options} />);

    const select = screen.getByLabelText('Estado');
    expect(select).toHaveAttribute('id', 'state');
    expect(select).toHaveAttribute('name', 'state');
  });

  it('wraps the select in a relative-positioned div, matching the app pattern', () => {
    render(<Dropdown name="state" label="Estado" options={options} />);

    const select = screen.getByLabelText('Estado');
    expect(select.parentElement).toHaveClass('relative');
  });

  it('renders one option per entry plus an optional placeholder', () => {
    render(
      <Dropdown
        name="state"
        label="Estado"
        options={options}
        placeholder="Selecione"
      />
    );

    expect(screen.getByText('Selecione')).toBeInTheDocument();
    expect(screen.getByText('SP')).toBeInTheDocument();
    expect(screen.getByText('RJ')).toBeInTheDocument();
  });

  it('supports uncontrolled usage via defaultValue', () => {
    render(
      <Dropdown
        name="state"
        label="Estado"
        options={options}
        defaultValue="RJ"
      />
    );

    const select = screen.getByLabelText('Estado') as HTMLSelectElement;
    expect(select.value).toBe('RJ');
  });

  it('supports controlled usage via value/onChange', () => {
    const handleChange = jest.fn();
    render(
      <Dropdown
        name="state"
        label="Estado"
        options={options}
        value="SP"
        onChange={handleChange}
      />
    );

    const select = screen.getByLabelText('Estado') as HTMLSelectElement;
    expect(select.value).toBe('SP');

    fireEvent.change(select, { target: { value: 'RJ' } });
    expect(handleChange).toHaveBeenCalledWith('RJ');
  });

  it('applies the disabled style and attribute', () => {
    render(<Dropdown name="state" label="Estado" options={options} disabled />);

    const select = screen.getByLabelText('Estado');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:bg-gray-100');
    expect(select).toHaveClass('disabled:cursor-not-allowed');
  });

  it('renders an ErrorMessage and red border when error is set', () => {
    render(
      <Dropdown
        name="state"
        label="Estado"
        options={options}
        error="Campo obrigatório"
      />
    );

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    const select = screen.getByLabelText('Estado');
    expect(select).toHaveClass('border-red-500');
    expect(select).not.toHaveClass('border-gray-200');
  });

  it('does not render an error message when error is not set', () => {
    render(<Dropdown name="state" label="Estado" options={options} />);

    const select = screen.getByLabelText('Estado');
    expect(select).toHaveClass('border-gray-200');
  });

  it('marks the select required when required is true', () => {
    render(<Dropdown name="state" label="Estado" options={options} required />);

    expect(screen.getByLabelText('Estado')).toBeRequired();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/app/components/common/dropdown/dropdown.test.tsx`

Expected: FAIL — at minimum the "relative wrapper", "disabled style" (`disabled:bg-gray-100`), and "error" tests fail against the current implementation (no `relative` div, no `disabled`/`error` props, no `disabled:*`/`border-red-500` classes).

- [ ] **Step 3: Implement the refined `Dropdown`**

Replace the full contents of `src/app/components/common/dropdown/dropdown.tsx`:

```tsx
'use client';

import { ErrorMessage } from '../error-message';

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
}

interface DropdownProps {
  name: string;
  label: string;
  options: Array<DropdownOption>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  optional?: boolean;
  error?: string;
}

export function Dropdown({
  label,
  name,
  options,
  placeholder,
  required,
  className,
  defaultValue,
  onChange,
  optional,
  value,
  disabled,
  error,
}: DropdownProps) {
  const borderColor = error ? 'border-red-500' : 'border-gray-200';

  return (
    <div className={className}>
      <label
        className="mb-3 block text-xs font-medium text-gray-900"
        htmlFor={name}
      >
        {label}
      </label>

      <div className="relative">
        <select
          className={`peer block w-full rounded-md border ${borderColor} py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100`}
          id={name}
          name={name}
          required={required}
          disabled={disabled}
          {...(value !== undefined
            ? { value, onChange: (e) => onChange && onChange(e.target.value) }
            : {
                defaultValue: defaultValue || '',
                onChange: (e) => onChange && onChange(e.target.value),
              })}
        >
          {placeholder && <option value="">{placeholder}</option>}

          {optional && <option value=""></option>}

          {options.map((opt) => (
            <option key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorMessage message={error} />}
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/app/components/common/dropdown/dropdown.test.tsx`

Expected: PASS — all 9 tests green.

- [ ] **Step 5: Verify no regression for existing `Dropdown` callers**

`Dropdown` is already used in `src/app/components/panel/search.tsx`, `src/app/components/cases/filter-modal.tsx`, and `src/app/components/partners/filter-modal.tsx`, all passing a subset of `name`, `label`, `options`, `placeholder`, `onChange`, `defaultValue` — all still supported unchanged. Run:

```bash
npx tsc --noEmit
```

Expected: no new type errors (the additive `disabled`/`error` props don't break existing call sites).

- [ ] **Step 6: Commit**

```bash
git add src/app/components/common/dropdown/dropdown.tsx src/app/components/common/dropdown/dropdown.test.tsx
git commit -m "feat: add disabled and error-state support to Dropdown"
```

---

## Task 2: Migrate `customer-form.tsx` state select

**Files:**

- Modify: `src/app/components/customers/customer-form.tsx`

**Interfaces:**

- Consumes: `Dropdown` from Task 1, imported as `import { Dropdown } from '../common/dropdown/dropdown';`

Field migrated: `state` (Estado). No other selects in this file.

- [ ] **Step 1: Add the `Dropdown` import**

In `src/app/components/customers/customer-form.tsx`, add to the imports:

```tsx
import { Dropdown } from '../common/dropdown/dropdown';
```

- [ ] **Step 2: Replace the `state` select**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="state"
  >
    Estado
  </label>

  <div className="relative">
    <select
      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
      id="state"
      name="state"
      defaultValue={customer?.shipping.state || ''}
    >
      {brazilStates.map((state) => (
        <option key={`state-${state}`} value={state}>
          {state}
        </option>
      ))}
    </select>
  </div>
</div>
```

With:

```tsx
<Dropdown
  label="Estado"
  name="state"
  options={brazilStates.map((state) => ({
    id: state,
    value: state,
    label: state,
  }))}
  defaultValue={customer?.shipping.state || ''}
/>
```

- [ ] **Step 3: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 4: Manual browser verification**

Run `npm run dev`, open the customers page, and:

- Open "Cadastrar cliente" — confirm the "Estado" dropdown renders the same list of states, in the same order, as before.
- Open "Editar" on an existing customer — confirm the state prefills correctly.
- Submit the form and confirm the selected state reaches the server action.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/customers/customer-form.tsx
git commit -m "refactor: migrate customer-form state select to Dropdown"
```

---

## Task 3: Migrate `partner-form.tsx` selects

**Files:**

- Modify: `src/app/components/partners/partner-form.tsx`

**Interfaces:**

- Consumes: `Dropdown` from Task 1, imported as `import { Dropdown } from '../common/dropdown/dropdown';`

Fields migrated: `partner_type` (Tipo), `payment_key_option` (Tipo da chave), `state` (Estado).
Fields **not** touched: `document` (`InputMask`), `payment_owner`/`payment_key`/`first_name`/`last_name`/`city`/`email` (already `TextInput`), `phone` (`InputMask`).

- [ ] **Step 1: Add the `Dropdown` import**

In `src/app/components/partners/partner-form.tsx`, add to the imports:

```tsx
import { Dropdown } from '../common/dropdown/dropdown';
```

- [ ] **Step 2: Replace the `partner_type` select**

Replace:

```tsx
<div className="mb-4 columns-1">
  <div>
    <label
      className="mb-3 block text-xs font-medium text-gray-900"
      htmlFor="partner_type"
    >
      Tipo
    </label>

    <div className="relative">
      <select
        className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
        id="partner_type"
        name="partner_type"
        defaultValue={partner?.partner_type || ''}
      >
        <option value="Montador">Montador</option>
        <option value="Tapeceiro">Tapeceiro</option>
      </select>
    </div>
  </div>
</div>
```

With:

```tsx
<div className="mb-4 columns-1">
  <Dropdown
    label="Tipo"
    name="partner_type"
    options={[
      { id: 'Montador', value: 'Montador', label: 'Montador' },
      { id: 'Tapeceiro', value: 'Tapeceiro', label: 'Tapeceiro' },
    ]}
    defaultValue={partner?.partner_type || ''}
  />
</div>
```

- [ ] **Step 3: Replace the `payment_key_option` select**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="payment_key_option"
  >
    Tipo da chave
  </label>

  <div className="relative">
    <select
      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
      id="payment_key_option"
      name="payment_key_option"
      defaultValue={partner?.payment_key_option || ''}
    >
      {Object.values(PaymentOptions).map((pOption) => {
        return (
          <option key={pOption} value={pOption}>
            {paymentOptionMap[pOption]}
          </option>
        );
      })}
    </select>
  </div>
</div>
```

With:

```tsx
<Dropdown
  label="Tipo da chave"
  name="payment_key_option"
  options={Object.values(PaymentOptions).map((pOption) => ({
    id: pOption,
    value: pOption,
    label: paymentOptionMap[pOption],
  }))}
  defaultValue={partner?.payment_key_option || ''}
/>
```

- [ ] **Step 4: Replace the `state` select**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="state"
  >
    Estado
  </label>

  <div className="relative">
    <select
      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
      id="state"
      name="state"
      defaultValue={partner?.shipping?.state || ''}
    >
      {brazilStates.map((state) => (
        <option key={`state-${state}`} value={state}>
          {state}
        </option>
      ))}
    </select>
  </div>
</div>
```

With:

```tsx
<Dropdown
  label="Estado"
  name="state"
  options={brazilStates.map((state) => ({
    id: state,
    value: state,
    label: state,
  }))}
  defaultValue={partner?.shipping?.state || ''}
/>
```

- [ ] **Step 5: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 6: Manual browser verification**

Run `npm run dev`, open the partners ("técnicos") page, and:

- Open "Cadastrar técnico" — confirm "Tipo", "Tipo da chave", and "Estado" dropdowns render the same options as before, in the same order.
- Open "Editar" on an existing partner — confirm all 3 fields prefill correctly.
- Submit the form and confirm the selected values reach the server action.

- [ ] **Step 7: Commit**

```bash
git add src/app/components/partners/partner-form.tsx
git commit -m "refactor: migrate partner-form selects to Dropdown"
```

---

## Task 4: Migrate `case-form.tsx` selects (and fix the `state` controlled-input bug)

**Files:**

- Modify: `src/app/components/cases/case-form.tsx`

**Interfaces:**

- Consumes: `Dropdown` from Task 1, imported as `import { Dropdown } from '../common/dropdown/dropdown';`

Fields migrated: `contractor` (Seguradora, dynamic options), `state` (Estado, disabled-driven — also fixes the pre-existing controlled-without-`onChange` bug by switching to `defaultValue`).
Fields **not** touched: `amount` (`InputNumberFormat`), `description` (`<textarea>`), `document` (`InputMask`), and the hidden `customer_id` input.

- [ ] **Step 1: Add the `Dropdown` import**

In `src/app/components/cases/case-form.tsx`, add to the imports:

```tsx
import { Dropdown } from '../common/dropdown/dropdown';
```

- [ ] **Step 2: Replace the `contractor` select**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="contractor"
  >
    Seguradora
  </label>

  <select
    className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
    id="contractor"
    name="contractor"
    required
  >
    <option value="">Selecione a seguradora</option>
    {contractors.map((contractor) => (
      <option key={contractor.contractor_id} value={contractor.contractor_id}>
        {contractor.company_name}
      </option>
    ))}
  </select>
</div>
```

With:

```tsx
<Dropdown
  label="Seguradora"
  name="contractor"
  placeholder="Selecione a seguradora"
  required
  options={contractors.map((contractor) => ({
    id: contractor.contractor_id,
    value: contractor.contractor_id,
    label: contractor.company_name,
  }))}
/>
```

- [ ] **Step 3: Replace the `state` select, fixing the controlled-without-onChange bug**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="state"
  >
    Estado
  </label>

  <div className="relative">
    <select
      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
      id="state"
      name="state"
      value={customer?.shipping.state}
      required
      disabled={!hasSearchedCustomer || !!customer}
    >
      {brazilStates.map((state) => (
        <option key={`state-${state}`} value={state}>
          {state}
        </option>
      ))}
    </select>
  </div>
</div>
```

With:

```tsx
<Dropdown
  label="Estado"
  name="state"
  required
  disabled={!hasSearchedCustomer || !!customer}
  defaultValue={customer?.shipping.state || ''}
  options={brazilStates.map((state) => ({
    id: state,
    value: state,
    label: state,
  }))}
/>
```

- [ ] **Step 4: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 5: Manual browser verification**

Run `npm run dev`, open the cases page, and:

- Open "Criar caso" — confirm the "Seguradora" dropdown renders the fetched contractors, and required-field validation still blocks submit when empty.
- Type a known customer document into "Documento" and click "Buscar" — confirm the "Estado" dropdown becomes enabled/disabled and prefills exactly as before (disabled until search, then populated and disabled again once a customer is found).
- Open the browser console during this flow and confirm no React warning about a component changing from uncontrolled to controlled (or vice versa) is printed for the "Estado" field.
- Submit the form and confirm both `contractor` and `state` values reach the server action.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/cases/case-form.tsx
git commit -m "refactor: migrate case-form selects to Dropdown and fix state controlled-input bug"
```

---

## Final verification (after all 4 tasks)

- [ ] Run the full test suite: `npm run test:ci` — expect all tests passing, including the 9 new `Dropdown` tests.
- [ ] Run `npx tsc --noEmit` and `npm run lint` at the repo root — expect zero errors.
- [ ] Manually re-check all 3 affected forms (create + edit flows) in the browser one more time end-to-end, per the steps in Tasks 2-4.
- [ ] Confirm `docs/design-system-audit.md`'s "Dropdown/Select" row reflects the new adoption if this plan is later revisited as a reference.
