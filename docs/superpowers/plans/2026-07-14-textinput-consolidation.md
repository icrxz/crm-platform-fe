# TextInput Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the shared `TextInput` component to match the app's real input pattern, then replace duplicated raw `<input>` fields with it across the 4 entity forms (customer, contractor, partner, case) — for plain, non-masked text fields only.

**Architecture:** One component change (`TextInput`) followed by four independent, per-file migration tasks. Each migration task only touches its own form file and is independently shippable/revertable.

**Tech Stack:** Next.js 16 (App Router, Server Actions via `useActionState`), React 18.3.1, Tailwind CSS, Jest + `@testing-library/react` + `@testing-library/jest-dom`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-14-textinput-consolidation-design.md` — follow it exactly for scope decisions.
- `TextInput` covers only plain text/email inputs. `InputMask` (CPF/CNPJ/phone/CEP) and `InputNumberFormat` (currency) fields are **out of scope** — do not touch them.
- `<select>`/`Dropdown` fields are **out of scope** — do not touch them.
- Disabled background color standardizes on `disabled:bg-gray-100` (not the old `disabled:bg-gray-300`).
- No automated render tests for the 4 form files — `useActionState` (used by all 4 forms) is not available in the installed React 18.3.1 in the Jest environment (confirmed by a spike: rendering `CustomerForm` in a test throws `useActionState is not a function`). This is pre-existing and out of scope to fix. Verification for migration tasks is: TypeScript compiles, ESLint passes, and manual browser testing (documented per task).
- The `TextInput` component itself has no dependency on `useActionState`, so it gets full automated test coverage.

---

## Task 1: Refine the `TextInput` component

**Files:**

- Modify: `src/app/components/common/text-input/text-input.tsx`
- Test: `src/app/components/common/text-input/text-input.test.tsx` (new)

**Interfaces:**

- Produces: `TextInput(props: TextInputProps)` where
  ```ts
  interface TextInputProps {
    name: string;
    label: string;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    defaultValue?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
  }
  ```
  Later tasks (2-5) import `{ TextInput }` from `../common/text-input/text-input` (or `../../common/text-input/text-input` depending on file depth) and pass `name`, `label`, `type`, `placeholder`, `required`, `disabled`, `defaultValue`.
- Consumes: `ErrorMessage` from `src/app/components/common/error-message/index.tsx` — `ErrorMessage({ message: string })`.

- [ ] **Step 1: Write failing tests for the new props**

Create `src/app/components/common/text-input/text-input.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from './text-input';

describe('TextInput', () => {
  it('renders the label associated with the input via htmlFor/id', () => {
    render(<TextInput name="first_name" label="Nome" />);

    const input = screen.getByLabelText('Nome');
    expect(input).toHaveAttribute('id', 'first_name');
    expect(input).toHaveAttribute('name', 'first_name');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('wraps the input in a relative-positioned div, matching the app pattern', () => {
    render(<TextInput name="first_name" label="Nome" />);

    const input = screen.getByLabelText('Nome');
    expect(input.parentElement).toHaveClass('relative');
  });

  it('supports uncontrolled usage via defaultValue', () => {
    render(<TextInput name="first_name" label="Nome" defaultValue="Ana" />);

    const input = screen.getByLabelText('Nome') as HTMLInputElement;
    expect(input.value).toBe('Ana');
  });

  it('supports controlled usage via value/onChange', () => {
    const handleChange = jest.fn();
    render(
      <TextInput
        name="first_name"
        label="Nome"
        value="Ana"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('Nome') as HTMLInputElement;
    expect(input.value).toBe('Ana');

    fireEvent.change(input, { target: { value: 'Beatriz' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies the disabled style and attribute', () => {
    render(<TextInput name="first_name" label="Nome" disabled />);

    const input = screen.getByLabelText('Nome');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:bg-gray-100');
    expect(input).toHaveClass('disabled:cursor-not-allowed');
  });

  it('renders an ErrorMessage and red border when error is set', () => {
    render(
      <TextInput name="first_name" label="Nome" error="Campo obrigatório" />
    );

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    const input = screen.getByLabelText('Nome');
    expect(input).toHaveClass('border-red-500');
    expect(input).not.toHaveClass('border-gray-200');
  });

  it('does not render an error message when error is not set', () => {
    render(<TextInput name="first_name" label="Nome" />);

    const input = screen.getByLabelText('Nome');
    expect(input).toHaveClass('border-gray-200');
  });

  it('marks the input required when required is true', () => {
    render(<TextInput name="first_name" label="Nome" required />);

    expect(screen.getByLabelText('Nome')).toBeRequired();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/app/components/common/text-input/text-input.test.tsx`

Expected: FAIL — at minimum the "relative wrapper", "controlled usage", "disabled style" (`disabled:bg-gray-100`), and "error" tests fail against the current implementation (no `relative` div, no `value`/`onChange`/`error` props, `disabled:bg-gray-300` instead of `disabled:bg-gray-100`).

- [ ] **Step 3: Implement the refined `TextInput`**

Replace the full contents of `src/app/components/common/text-input/text-input.tsx`:

```tsx
'useClient';

import { HTMLInputTypeAttribute } from 'react';
import { ErrorMessage } from '../error-message';

interface TextInputProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function TextInput({
  label,
  name,
  type,
  placeholder,
  required,
  className,
  defaultValue,
  value,
  onChange,
  disabled,
  error,
}: TextInputProps) {
  const borderColor = error ? 'border-red-500' : 'border-gray-200';

  return (
    <div className={`${className ? className : ''}`}>
      <label
        className="mb-3 block text-xs font-medium text-gray-900"
        htmlFor={name}
      >
        {label}
      </label>

      <div className="relative">
        <input
          className={`peer block w-full rounded-md border ${borderColor} py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100`}
          id={name}
          type={type || 'text'}
          name={name}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          {...(value !== undefined
            ? { value, onChange }
            : { defaultValue, onChange })}
        />
      </div>

      {error && <ErrorMessage message={error} />}
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/app/components/common/text-input/text-input.test.tsx`

Expected: PASS — all 8 tests green.

- [ ] **Step 5: Verify no regression for the existing `partner-form.tsx` usage**

`partner-form.tsx` already imports `TextInput` for the "Nome do titular" field with `label`, `name`, `placeholder`, `defaultValue`, `required` — all still supported unchanged. Run:

```bash
npx tsc --noEmit
```

Expected: no new type errors (the additive props don't break the existing call site).

- [ ] **Step 6: Commit**

```bash
git add src/app/components/common/text-input/text-input.tsx src/app/components/common/text-input/text-input.test.tsx
git commit -m "feat: add controlled and error-state support to TextInput"
```

---

## Task 2: Migrate `customer-form.tsx` text fields

**Files:**

- Modify: `src/app/components/customers/customer-form.tsx`

**Interfaces:**

- Consumes: `TextInput` from Task 1, imported as `import { TextInput } from '../common/text-input/text-input';`

Fields migrated (plain text/email, no mask): `first_name` (Nome), `last_name` (Sobrenome), `address` (Endereço), `number` (Número), `complement` (Complemento), `city` (Cidade), `email` (Email).
Fields **not** touched: `document` (InputMask/CPF), `state` (`<select>`), `zip_code` (InputMask/CEP), `phone` (InputMask), and the hidden `customer_id` input.

- [ ] **Step 1: Add the `TextInput` import**

In `src/app/components/customers/customer-form.tsx`, add to the imports:

```tsx
import { TextInput } from '../common/text-input/text-input';
```

- [ ] **Step 2: Replace the `first_name` and `last_name` fields**

Replace:

```tsx
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="first_name"
              >
                Nome
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="first_name"
                  type="text"
                  name="first_name"
                  placeholder="Digite o nome"
                  required
                  defaultValue={customer?.first_name || ''}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="last_name"
              >
                Sobrenome
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="last_name"
                  type="text"
                  name="last_name"
                  placeholder="Digite o sobrenome"
                  required
                  defaultValue={customer?.last_name || ''}
                />
              </div>
            </div>
```

With:

```tsx
            <TextInput
              label="Nome"
              name="first_name"
              placeholder="Digite o nome"
              required
              defaultValue={customer?.first_name || ''}
            />

            <TextInput
              label="Sobrenome"
              name="last_name"
              placeholder="Digite o sobrenome"
              required
              defaultValue={customer?.last_name || ''}
            />
```

- [ ] **Step 3: Replace the `address`, `number`, and `complement` fields**

Replace:

```tsx
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="address"
              >
                Endereço
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Digite o endereço"
                  defaultValue={getCustomerAddress(customer)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="number"
              >
                Número
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="number"
                  type="text"
                  name="number"
                  placeholder="Digite o número do endereço"
                  defaultValue={getCustomerAddressNumber(customer)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="complement"
              >
                Complemento
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="complement"
                  type="text"
                  name="complement"
                  placeholder="Digite o complemento, se houver"
                  defaultValue={getCustomerAddressComplement(customer)}
                />
              </div>
            </div>
```

With:

```tsx
            <TextInput
              label="Endereço"
              name="address"
              placeholder="Digite o endereço"
              defaultValue={getCustomerAddress(customer)}
              required
            />

            <TextInput
              label="Número"
              name="number"
              placeholder="Digite o número do endereço"
              defaultValue={getCustomerAddressNumber(customer)}
              required
            />

            <TextInput
              label="Complemento"
              name="complement"
              placeholder="Digite o complemento, se houver"
              defaultValue={getCustomerAddressComplement(customer)}
            />
```

- [ ] **Step 4: Replace the `city` field (leave `state` select untouched)**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="city"
  >
    Cidade
  </label>

  <div className="relative">
    <input
      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
      id="city"
      type="text"
      name="city"
      placeholder="Digite a cidade"
      required
      defaultValue={customer?.shipping.city || ''}
    />
  </div>
</div>
```

With:

```tsx
<TextInput
  label="Cidade"
  name="city"
  placeholder="Digite a cidade"
  required
  defaultValue={customer?.shipping.city || ''}
/>
```

- [ ] **Step 5: Replace the `email` field (leave the `phone` `InputMask` untouched)**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="email"
  >
    Email
  </label>

  <div className="relative">
    <input
      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
      id="email"
      type="email"
      name="email"
      placeholder="Digite o email"
      defaultValue={customer?.personal_contact?.email || ''}
    />
  </div>
</div>
```

With:

```tsx
<TextInput
  label="Email"
  name="email"
  type="email"
  placeholder="Digite o email"
  defaultValue={customer?.personal_contact?.email || ''}
/>
```

- [ ] **Step 6: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 7: Manual browser verification**

Run `npm run dev`, open the customers page, and:

- Open "Cadastrar cliente" — confirm Nome, Sobrenome, Endereço, Número, Complemento, Cidade, Email render with the same layout/placeholders as before, `required` fields block submit when empty, and the form still submits successfully with all field values reaching the server action (check network tab or resulting record).
- Open "Editar" on an existing customer — confirm all 7 fields prefill correctly from the existing record.

- [ ] **Step 8: Commit**

```bash
git add src/app/components/customers/customer-form.tsx
git commit -m "refactor: migrate customer-form text fields to TextInput"
```

---

## Task 3: Migrate `contractor-form.tsx` text fields

**Files:**

- Modify: `src/app/components/contractors/contractor-form.tsx`

**Interfaces:**

- Consumes: `TextInput` from Task 1, imported as `import { TextInput } from '../common/text-input/text-input';`

Fields migrated: `company_name` (Nome da empresa), `legal_name` (Razão Social), `phone` (Telefone), `email` (Email).
Fields **not** touched: `document` (InputMask/CNPJ), and the hidden `contractor_id` input.

- [ ] **Step 1: Add the `TextInput` import**

In `src/app/components/contractors/contractor-form.tsx`, add to the imports:

```tsx
import { TextInput } from '../common/text-input/text-input';
```

- [ ] **Step 2: Replace `company_name` and `legal_name`**

Replace:

```tsx
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="company_name"
              >
                Nome da empresa
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="company_name"
                  type="text"
                  name="company_name"
                  placeholder="Digite o nome da empresa"
                  required
                  defaultValue={contractor?.company_name || ''}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="legal_name"
              >
                Razão Social
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="legal_name"
                  type="text"
                  name="legal_name"
                  placeholder="Digite a razão social"
                  required
                  defaultValue={contractor?.legal_name || ''}
                />
              </div>
            </div>
```

With:

```tsx
            <TextInput
              label="Nome da empresa"
              name="company_name"
              placeholder="Digite o nome da empresa"
              required
              defaultValue={contractor?.company_name || ''}
            />

            <TextInput
              label="Razão Social"
              name="legal_name"
              placeholder="Digite a razão social"
              required
              defaultValue={contractor?.legal_name || ''}
            />
```

- [ ] **Step 3: Replace `phone` and `email` (leave `document` `InputMask` untouched)**

Replace:

```tsx
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="phone"
              >
                Telefone
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="phone"
                  type="text"
                  name="phone"
                  placeholder="Digite o telefone do representante"
                  defaultValue={
                    contractor?.business_contact?.phone_number || ''
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="email"
              >
                Email
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Digite o email do representante"
                  defaultValue={contractor?.business_contact?.email || ''}
                />
              </div>
            </div>
```

With:

```tsx
            <TextInput
              label="Telefone"
              name="phone"
              placeholder="Digite o telefone do representante"
              defaultValue={contractor?.business_contact?.phone_number || ''}
            />

            <TextInput
              label="Email"
              name="email"
              type="email"
              placeholder="Digite o email do representante"
              defaultValue={contractor?.business_contact?.email || ''}
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

Run `npm run dev`, open the contractors ("seguradoras") page, and:

- Open "Cadastrar seguradora" — confirm Nome da empresa, Razão Social, Telefone, Email render the same as before and the form submits correctly.
- Open "Editar" on an existing contractor — confirm all 4 fields prefill correctly.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/contractors/contractor-form.tsx
git commit -m "refactor: migrate contractor-form text fields to TextInput"
```

---

## Task 4: Migrate `partner-form.tsx` text fields

**Files:**

- Modify: `src/app/components/partners/partner-form.tsx`

**Interfaces:**

- Consumes: `TextInput`, already imported in this file as `import { TextInput } from '../common/text-input/text-input';` (used for "Nome do titular" — leave that usage as-is).

Fields migrated: `first_name` (Nome), `last_name` (Sobrenome), `payment_key` (Chave PIX), `city` (Cidade), `email` (Email).
Fields **not** touched: `document` (InputMask), `partner_type` (`<select>`), `payment_key_option` (`<select>`), `payment_owner` (already `TextInput`), `state` (`<select>`), `phone` (InputMask).

- [ ] **Step 1: Replace `first_name` and `last_name`**

Replace:

```tsx
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="first_name"
              >
                Nome
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="first_name"
                  type="text"
                  name="first_name"
                  placeholder="Digite o nome"
                  defaultValue={partner?.first_name || ''}
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="last_name"
              >
                Sobrenome
              </label>

              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="last_name"
                  type="text"
                  name="last_name"
                  placeholder="Digite o sobrenome"
                  defaultValue={partner?.last_name || ''}
                  required
                />
              </div>
            </div>
```

With:

```tsx
            <TextInput
              label="Nome"
              name="first_name"
              placeholder="Digite o nome"
              defaultValue={partner?.first_name || ''}
              required
            />

            <TextInput
              label="Sobrenome"
              name="last_name"
              placeholder="Digite o sobrenome"
              defaultValue={partner?.last_name || ''}
              required
            />
```

- [ ] **Step 2: Replace `payment_key` (leave `payment_key_option` `<select>` untouched)**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="payment_key"
  >
    Chave PIX
  </label>

  <div className="relative">
    <input
      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
      id="payment_key"
      type="text"
      name="payment_key"
      placeholder="Digite a chave pix"
      defaultValue={partner?.payment_key || ''}
      required
    />
  </div>
</div>
```

With:

```tsx
<TextInput
  label="Chave PIX"
  name="payment_key"
  placeholder="Digite a chave pix"
  defaultValue={partner?.payment_key || ''}
  required
/>
```

- [ ] **Step 3: Replace `city` (leave `state` `<select>` untouched)**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="city"
  >
    Cidade
  </label>

  <div className="relative">
    <input
      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
      id="city"
      type="text"
      name="city"
      defaultValue={partner?.shipping?.city || ''}
      placeholder="Digite a cidade"
    />
  </div>
</div>
```

With:

```tsx
<TextInput
  label="Cidade"
  name="city"
  defaultValue={partner?.shipping?.city || ''}
  placeholder="Digite a cidade"
/>
```

- [ ] **Step 4: Replace `email` (leave the `phone` `InputMask` untouched)**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="email"
  >
    Email
  </label>

  <div className="relative">
    <input
      className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
      id="email"
      type="email"
      name="email"
      placeholder="Digite o email"
      defaultValue={partner?.personal_contact?.email || ''}
    />
  </div>
</div>
```

With:

```tsx
<TextInput
  label="Email"
  name="email"
  type="email"
  placeholder="Digite o email"
  defaultValue={partner?.personal_contact?.email || ''}
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

- Open "Cadastrar técnico" — confirm Nome, Sobrenome, Chave PIX, Cidade, Email render the same as before, and the "Nome do titular" conditional `TextInput` field (already existing) still behaves correctly when unchecking "É o titular da conta".
- Open "Editar" on an existing partner — confirm all 5 migrated fields prefill correctly.

- [ ] **Step 7: Commit**

```bash
git add src/app/components/partners/partner-form.tsx
git commit -m "refactor: migrate partner-form text fields to TextInput"
```

---

## Task 5: Migrate `case-form.tsx` text fields

**Files:**

- Modify: `src/app/components/cases/case-form.tsx`

**Interfaces:**

- Consumes: `TextInput` from Task 1, imported as `import { TextInput } from '../common/text-input/text-input';`

Fields migrated: `claim` (Sinistro), `brand` (Marca), `model` (Modelo), `first_name` (Nome do cliente, disabled-driven), `last_name` (Sobrenome do cliente, disabled-driven), `city` (Cidade do cliente, disabled-driven).
Fields **not** touched: `contractor` (`<select>`), `amount` (`InputNumberFormat`), `description` (`<textarea>`), `document` (`InputMask`), `state` (`<select>`), and the hidden `customer_id` input.

Note: the current `claim` field has `id="first_name"` while its `name`/`htmlFor` is `claim` — a pre-existing mismatched-id bug. Using `TextInput` (which sets `id={name}`) fixes this automatically as a side effect of the migration; no separate step needed.

- [ ] **Step 1: Add the `TextInput` import**

In `src/app/components/cases/case-form.tsx`, add to the imports:

```tsx
import { TextInput } from '../common/text-input/text-input';
```

- [ ] **Step 2: Replace `claim` (leave the `contractor` `<select>` untouched)**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="claim"
  >
    Sinistro
  </label>

  <input
    className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
    id="first_name"
    type="text"
    name="claim"
    placeholder="Digite o sinistro"
    required
  />
</div>
```

With:

```tsx
<TextInput
  label="Sinistro"
  name="claim"
  placeholder="Digite o sinistro"
  required
/>
```

- [ ] **Step 3: Replace `brand` and `model` (leave `amount` `InputNumberFormat` untouched)**

Replace:

```tsx
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="brand"
              >
                Marca
              </label>

              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                id="brand"
                type="text"
                name="brand"
                placeholder="Digite a marca"
                required
              />
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="model"
              >
                Modelo
              </label>

              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                id="model"
                type="text"
                name="model"
                placeholder="Digite o modelo"
                required
              />
            </div>
```

With:

```tsx
            <TextInput label="Marca" name="brand" placeholder="Digite a marca" required />

            <TextInput
              label="Modelo"
              name="model"
              placeholder="Digite o modelo"
              required
            />
```

- [ ] **Step 4: Replace the disabled-driven `first_name` and `last_name` customer fields**

Replace:

```tsx
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="first_name"
              >
                Nome
              </label>

              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                id="first_name"
                type="text"
                name="first_name"
                placeholder="Digite o nome do cliente"
                required
                disabled={!hasSearchedCustomer || !!customer}
                defaultValue={customer?.first_name || ''}
              />
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="last_name"
              >
                Sobrenome
              </label>

              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                id="last_name"
                type="text"
                name="last_name"
                placeholder="Digite o sobrenome do cliente"
                required
                disabled={!hasSearchedCustomer || !!customer}
                defaultValue={customer?.last_name || ''}
              />
            </div>
```

With:

```tsx
            <TextInput
              label="Nome"
              name="first_name"
              placeholder="Digite o nome do cliente"
              required
              disabled={!hasSearchedCustomer || !!customer}
              defaultValue={customer?.first_name || ''}
            />

            <TextInput
              label="Sobrenome"
              name="last_name"
              placeholder="Digite o sobrenome do cliente"
              required
              disabled={!hasSearchedCustomer || !!customer}
              defaultValue={customer?.last_name || ''}
            />
```

- [ ] **Step 5: Replace the disabled-driven `city` field (leave the `state` `<select>` untouched)**

Replace:

```tsx
<div>
  <label
    className="mb-3 block text-xs font-medium text-gray-900"
    htmlFor="first_name"
  >
    Cidade
  </label>

  <input
    className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
    id="city"
    type="text"
    name="city"
    placeholder="Digite a cidade"
    required
    disabled={!hasSearchedCustomer || !!customer}
    defaultValue={customer?.shipping.city || ''}
  />
</div>
```

With:

```tsx
<TextInput
  label="Cidade"
  name="city"
  placeholder="Digite a cidade"
  required
  disabled={!hasSearchedCustomer || !!customer}
  defaultValue={customer?.shipping.city || ''}
/>
```

(Note: this label's `htmlFor` was also mismatched — `htmlFor="first_name"` on the Cidade label. `TextInput` fixes this too, since `htmlFor`/`id` both derive from `name="city"`.)

- [ ] **Step 6: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 7: Manual browser verification**

Run `npm run dev`, open the cases page, and:

- Open "Criar caso" — confirm Sinistro, Marca, Modelo render the same as before.
- Type a known customer document into the "Documento" field and click "Buscar" — confirm Nome, Sobrenome, and Cidade become enabled/disabled and prefill exactly as before (disabled until search, then populated and disabled again once a customer is found).
- Confirm the label click-to-focus behavior now correctly focuses the Sinistro and Cidade inputs (previously broken by the mismatched `id`/`htmlFor`).
- Submit the form and confirm all field values reach the server action.

- [ ] **Step 8: Commit**

```bash
git add src/app/components/cases/case-form.tsx
git commit -m "refactor: migrate case-form text fields to TextInput"
```

---

## Final verification (after all 5 tasks)

- [ ] Run the full test suite: `npm run test:ci` — expect all tests passing, including the 8 new `TextInput` tests.
- [ ] Run `npx tsc --noEmit` and `npm run lint` at the repo root — expect zero errors.
- [ ] Manually re-check all 4 forms (create + edit flows) in the browser one more time end-to-end, per the steps in Tasks 2-5.
- [ ] Confirm `docs/design-system-audit.md`'s Prioridade 1 table row for "Input de texto" is now accurate (adoption should read as high for these 4 forms) — update it if this plan is later revisited as a reference.
