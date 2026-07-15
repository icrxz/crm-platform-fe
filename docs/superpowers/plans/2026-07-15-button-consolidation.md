# Button Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix a pre-existing `disabled`-override bug in the shared `Button` component, create a new `IconButton` primitive for the icon-only action buttons duplicated across 5 tables, and migrate the remaining raw `<button>` usages (the "Buscar" button in 2 case forms, and the view/edit/delete icons in 5 tables) onto these two primitives.

**Architecture:** Two component tasks (`Button` fix, new `IconButton`) followed by seven independent, per-file migration tasks. Each migration task only touches its own file and is independently shippable/revertable.

**Tech Stack:** Next.js 16 (App Router, Server Actions via `useActionState`), React 18.3.1, Tailwind CSS, `@heroicons/react`, Jest + `@testing-library/react` + `@testing-library/jest-dom`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-15-button-consolidation-design.md` — follow it exactly for scope decisions.
- Out of scope: `dashboards/*.tsx` (link-style/toggle buttons), `sidebar/sidenav.tsx` (logout button), and any button that already uses the `Button` component. Do not touch them.
- Out of scope: `cases/form-details/ongoing_case.tsx` — it has no "Buscar" button.
- `IconButton`'s icon sizing is standardized to `h-5 w-5 md:h-6 md:w-6`, applied by the caller directly on the icon element passed as the `icon` prop (e.g. `icon={<EyeIcon className="h-5 w-5 md:h-6 md:w-6" />}`). This deviates slightly from the illustrative code in the spec (which wrapped the icon in a `<span>` with arbitrary Tailwind variants) — the spec explicitly marks that sample as non-binding ("a forma final exata" is left to the plan). Sizing at the call site matches how icons are already sized today in every table file, keeps `IconButton` a plain pass-through with no `cloneElement`/wrapper-`span` complexity, and is simpler to test.
- No automated render tests for the 2 case-form files or the 5 table files — `useActionState` (React 19 API) is not available in the installed React 18.3.1 in the Jest environment (confirmed during the `TextInput`/`Dropdown` consolidation work); the table files additionally depend on extensive mocked search/pagination data. This is pre-existing and out of scope to fix. Verification for migration tasks is: TypeScript compiles, ESLint passes, and manual browser testing (documented per task).
- `Button` and `IconButton` themselves have no dependency on `useActionState`, so they get full automated test coverage.
- The `Button` fix must not change behavior for any existing caller: today no caller passes `disabled` directly (they all use `isLoading`/`aria-disabled`), so `disabled={isLoading || rest.disabled}` is a strict superset of the current `disabled={isLoading}` behavior.

---

## Task 1: Fix the `disabled` override bug in `Button`

**Files:**

- Modify: `src/app/components/common/button/index.tsx`
- Test: `src/app/components/common/button/index.test.tsx` (new)

**Interfaces:**

- Produces: `Button(props: ButtonProps)` where

  ```ts
  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    color?: 'success' | 'error' | 'warning' | 'info';
  }
  ```

  Unchanged from today. The only behavioral change: passing `disabled` now actually disables the button when `isLoading` is falsy. Later tasks (3, 4) rely on this to pass `disabled={pending || searchingUser}` (and similar) to `Button`.

- [ ] **Step 1: Write failing tests for the `disabled` fix**

Create `src/app/components/common/button/index.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './index';

describe('Button', () => {
  it('renders children when not loading', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });

  it('shows a spinner and hides children when isLoading is true', () => {
    render(<Button isLoading>Salvar</Button>);

    expect(screen.queryByText('Salvar')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toContainHTML('svg');
  });

  it('disables the button when isLoading is true, even without an explicit disabled prop', () => {
    render(<Button isLoading>Salvar</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('respects an explicit disabled prop when isLoading is false', () => {
    render(<Button disabled>Salvar</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is not disabled when neither isLoading nor disabled is set', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('stays disabled when both isLoading and disabled are true', () => {
    render(
      <Button isLoading disabled>
        Salvar
      </Button>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not fire onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Salvar
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies the color class for the given color variant', () => {
    render(<Button color="error">Excluir</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });

  it('defaults to the info color when no color is given', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');
  });
});
```

- [ ] **Step 2: Run the tests to verify the disabled-prop tests fail**

Run: `npx jest src/app/components/common/button/index.test.tsx`

Expected: FAIL — specifically "respects an explicit disabled prop when isLoading is false" and "does not fire onClick when disabled" fail, because `disabled={isLoading}` currently ignores any `disabled` passed by the caller (`isLoading` is `undefined` there, so the button is never disabled and the click fires). The other tests pass against the current implementation.

- [ ] **Step 3: Fix the `disabled` override**

In `src/app/components/common/button/index.tsx`, change:

```tsx
export function Button({ children, className, size = 'lg', color = 'info', isLoading, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={isLoading}
      className={clsx(
```

To:

```tsx
export function Button({ children, className, size = 'lg', color = 'info', isLoading, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={isLoading || rest.disabled}
      className={clsx(
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/app/components/common/button/index.test.tsx`

Expected: PASS — all 9 tests green.

- [ ] **Step 5: Verify no regression for existing `Button` callers**

Run:

```bash
npx tsc --noEmit
```

Expected: no new type errors. No existing caller passes `disabled` today (confirmed by the spec's audit), so this is additive-only.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/common/button/index.tsx src/app/components/common/button/index.test.tsx
git commit -m "fix: respect caller-provided disabled prop on Button"
```

---

## Task 2: Create the `IconButton` component

**Files:**

- Create: `src/app/components/common/icon-button/index.tsx`
- Test: `src/app/components/common/icon-button/index.test.tsx` (new)

**Interfaces:**

- Produces: `IconButton(props: IconButtonProps)` where

  ```ts
  interface IconButtonProps {
    icon: React.ReactNode;
    color: 'success' | 'info' | 'error';
    onClick: () => void;
    disabled?: boolean;
    title?: string;
  }
  ```

  Later tasks (5-9) import `{ IconButton }` from `../common/icon-button` and pass `icon` (a sized `@heroicons/react` element, e.g. `<EyeIcon className="h-5 w-5 md:h-6 md:w-6" />`), `color`, `onClick`, and optionally `disabled`.

- [ ] **Step 1: Write failing tests for `IconButton`**

Create `src/app/components/common/icon-button/index.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from './index';

describe('IconButton', () => {
  it('renders the icon passed in', () => {
    render(
      <IconButton
        icon={<svg data-testid="my-icon" />}
        color="info"
        onClick={jest.fn()}
      />
    );

    expect(screen.getByTestId('my-icon')).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<IconButton icon={<svg />} color="info" onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <IconButton icon={<svg />} color="info" onClick={handleClick} disabled />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies the success color classes', () => {
    render(<IconButton icon={<svg />} color="success" onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('text-green-500');
  });

  it('applies the info color classes', () => {
    render(<IconButton icon={<svg />} color="info" onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('text-blue-600');
  });

  it('applies the error color classes', () => {
    render(<IconButton icon={<svg />} color="error" onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('text-red-600');
  });

  it('applies the title attribute when given', () => {
    render(
      <IconButton
        icon={<svg />}
        color="info"
        onClick={jest.fn()}
        title="Editar"
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute('title', 'Editar');
  });

  it('renders as a type="button" element', () => {
    render(<IconButton icon={<svg />} color="info" onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/app/components/common/icon-button/index.test.tsx`

Expected: FAIL with "Cannot find module './index'" (the component doesn't exist yet).

- [ ] **Step 3: Implement `IconButton`**

Create `src/app/components/common/icon-button/index.tsx`:

```tsx
'use client';

interface IconButtonProps {
  icon: React.ReactNode;
  color: 'success' | 'info' | 'error';
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

const iconButtonColors = {
  success: 'text-green-500 hover:text-green-700',
  info: 'text-blue-600 hover:text-blue-900',
  error: 'text-red-600 hover:text-red-900',
};

export function IconButton({
  icon,
  color,
  onClick,
  disabled,
  title,
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={iconButtonColors[color]}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon}
    </button>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/app/components/common/icon-button/index.test.tsx`

Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/common/icon-button/index.tsx src/app/components/common/icon-button/index.test.tsx
git commit -m "feat: add IconButton component for table row actions"
```

---

## Task 3: Migrate the "Buscar" button in `case-form.tsx`

**Files:**

- Modify: `src/app/components/cases/case-form.tsx`

**Interfaces:**

- Consumes: `Button` from Task 1 (already imported in this file as `import { Button } from '../common/button';`), specifically the fixed `disabled` behavior.

Only the "Buscar" button changes. No other button in this file is touched (the "Criar"/"Cancelar" buttons already use `Button`).

- [ ] **Step 1: Replace the "Buscar" button**

In `src/app/components/cases/case-form.tsx`, replace:

```tsx
<button
  type="button"
  disabled={pending || searchingUser}
  className="ml-2 rounded-md bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  onClick={handleSearchUser}
>
  Buscar
</button>
```

With:

```tsx
<Button
  type="button"
  size="md"
  color="info"
  className="ml-2"
  disabled={pending || searchingUser}
  onClick={handleSearchUser}
>
  Buscar
</Button>
```

- [ ] **Step 2: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 3: Manual browser verification**

Run `npm run dev`, open the cases page, and:

- Open "Criar caso", type a document into "Documento", and confirm the "Buscar" button is enabled and triggers the search on click.
- While the search is in flight, confirm the button becomes disabled (matches the previous `searchingUser` behavior).
- Confirm the button's visual style (blue, rounded) still reads as a primary action, consistent with the rest of the form.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/cases/case-form.tsx
git commit -m "refactor: migrate case-form Buscar button to Button"
```

---

## Task 4: Migrate the "Buscar" button in `form-details/draft_case.tsx`

**Files:**

- Modify: `src/app/components/cases/form-details/draft_case.tsx`

**Interfaces:**

- Consumes: `Button` from Task 1 (already imported in this file as `import { Button } from '../../common/button';`), specifically the fixed `disabled` behavior.

Only the "Buscar" button changes. The "Salvar" button in this file already uses `Button` and is not touched.

- [ ] **Step 1: Replace the "Buscar" button**

In `src/app/components/cases/form-details/draft_case.tsx`, replace:

```tsx
<button
  type="button"
  disabled={pending || searchingUser || hasSearchedCustomer}
  className="ml-2 rounded-md bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-200"
  onClick={handleSearchUser}
>
  Buscar
</button>
```

With:

```tsx
<Button
  type="button"
  size="md"
  color="info"
  className="ml-2"
  disabled={pending || searchingUser || hasSearchedCustomer}
  onClick={handleSearchUser}
>
  Buscar
</Button>
```

- [ ] **Step 2: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 3: Manual browser verification**

Run `npm run dev`, open an existing case in "rascunho" (draft) status, and:

- If the case has no customer document yet, confirm "Buscar" is enabled, searches on click, and becomes disabled once a customer is found (matches the previous `hasSearchedCustomer` behavior).
- If the case already has a customer document, confirm "Buscar" renders disabled immediately (matches the previous behavior, since `hasSearchedCustomer` starts `true` in that case).

- [ ] **Step 4: Commit**

```bash
git add src/app/components/cases/form-details/draft_case.tsx
git commit -m "refactor: migrate draft_case Buscar button to Button"
```

---

## Task 5: Migrate icon buttons in `customers/table.tsx`

**Files:**

- Modify: `src/app/components/customers/table.tsx`

**Interfaces:**

- Consumes: `IconButton` from Task 2, imported as `import { IconButton } from '../common/icon-button';`

Three buttons migrated: view (`EyeIcon`, always rendered), edit (`PencilIcon`, always rendered), delete (`TrashIcon`, only when `customer.active`).

- [ ] **Step 1: Add the `IconButton` import**

In `src/app/components/customers/table.tsx`, add to the imports (alongside the existing `Modal` import):

```tsx
import { IconButton } from '../common/icon-button';
```

- [ ] **Step 2: Replace the row-actions block**

Replace:

```tsx
<div className="flex gap-2">
  <button
    className="text-green-500 hover:text-green-700"
    onClick={() => handleRowClick(customer.customer_id)}
  >
    <EyeIcon className="h-5 w-5" />
  </button>

  <button
    className="text-blue-600 hover:text-blue-900"
    onClick={() => handleEdit(customer.customer_id)}
  >
    <PencilIcon className="w-5 md:w-6" />
  </button>

  {customer.active && (
    <button
      className="text-red-600 hover:text-red-900"
      onClick={() => handleDelete(customer.customer_id)}
    >
      <TrashIcon className="w-5 md:w-6" />
    </button>
  )}
</div>
```

With:

```tsx
<div className="flex gap-2">
  <IconButton
    color="success"
    icon={<EyeIcon className="h-5 w-5 md:h-6 md:w-6" />}
    onClick={() => handleRowClick(customer.customer_id)}
  />

  <IconButton
    color="info"
    icon={<PencilIcon className="h-5 w-5 md:h-6 md:w-6" />}
    onClick={() => handleEdit(customer.customer_id)}
  />

  {customer.active && (
    <IconButton
      color="error"
      icon={<TrashIcon className="h-5 w-5 md:h-6 md:w-6" />}
      onClick={() => handleDelete(customer.customer_id)}
    />
  )}
</div>
```

- [ ] **Step 3: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 4: Manual browser verification**

Run `npm run dev`, open the customers page, and confirm: the view/edit icons render for every row, delete only renders for active customers, all three still navigate/open the same modals as before, and the icons render at a consistent size across rows.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/customers/table.tsx
git commit -m "refactor: migrate customers table row actions to IconButton"
```

---

## Task 6: Migrate icon buttons in `partners/table.tsx`

**Files:**

- Modify: `src/app/components/partners/table.tsx`

**Interfaces:**

- Consumes: `IconButton` from Task 2, imported as `import { IconButton } from '../common/icon-button';`

Three buttons migrated: view (`EyeIcon`, always rendered, calls `handleRowClick`), edit (`PencilIcon`, always rendered, calls `handlePartnerEdit`), delete (`TrashIcon`, only when `partner.active`, calls `handlePartnerDelete`).

- [ ] **Step 1: Add the `IconButton` import**

In `src/app/components/partners/table.tsx`, add to the imports:

```tsx
import { IconButton } from '../common/icon-button';
```

- [ ] **Step 2: Replace the row-actions block**

Replace:

```tsx
                          <button
                            className="text-green-500 hover:text-green-700"
                            onClick={() => handleRowClick(partner.partner_id)}
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() =>
                              handlePartnerEdit(partner.partner_id)
                            }
                          >
                            <PencilIcon className="w-5 md:w-6" />
                          </button>

                          {partner.active && (
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() =>
                                handlePartnerDelete(partner.partner_id)
                              }
                            >
                              <TrashIcon className="w-5 md:w-6" />
                            </button>
                          )}
```

With:

```tsx
                          <IconButton
                            color="success"
                            icon={<EyeIcon className="h-5 w-5 md:h-6 md:w-6" />}
                            onClick={() => handleRowClick(partner.partner_id)}
                          />

                          <IconButton
                            color="info"
                            icon={<PencilIcon className="h-5 w-5 md:h-6 md:w-6" />}
                            onClick={() =>
                              handlePartnerEdit(partner.partner_id)
                            }
                          />

                          {partner.active && (
                            <IconButton
                              color="error"
                              icon={<TrashIcon className="h-5 w-5 md:h-6 md:w-6" />}
                              onClick={() =>
                                handlePartnerDelete(partner.partner_id)
                              }
                            />
                          )}
```

- [ ] **Step 3: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 4: Manual browser verification**

Run `npm run dev`, open the partners ("técnicos") page, and confirm: view/edit icons render for every row, delete only renders for active partners, all three still open the same modals/routes as before.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/partners/table.tsx
git commit -m "refactor: migrate partners table row actions to IconButton"
```

---

## Task 7: Migrate icon buttons in `contractors/table.tsx`

**Files:**

- Modify: `src/app/components/contractors/table.tsx`

**Interfaces:**

- Consumes: `IconButton` from Task 2, imported as `import { IconButton } from '../../components/common/icon-button';` (this file already imports `Modal` via the `../../components/common/modal` relative path, so `IconButton` follows the same relative depth).

Three buttons migrated: view (`EyeIcon`, always rendered, calls `handleRowClick`), edit (`PencilIcon`, always rendered, calls `handleEdit`), delete (`TrashIcon`, only when `contractor.active`, calls `handleDelete`).

- [ ] **Step 1: Add the `IconButton` import**

In `src/app/components/contractors/table.tsx`, add to the imports:

```tsx
import { IconButton } from '../../components/common/icon-button';
```

- [ ] **Step 2: Replace the row-actions block**

Replace:

```tsx
<div className="flex items-center gap-3">
  <button
    className="text-green-500 hover:text-green-700"
    onClick={() => handleRowClick(contractor.contractor_id)}
  >
    <EyeIcon className="h-5 w-5" />
  </button>

  <button
    className="text-blue-500 hover:text-blue-700"
    onClick={() => handleEdit(contractor.contractor_id)}
  >
    <PencilIcon className="h-5 w-5" />
  </button>

  {contractor.active && (
    <button
      className="text-red-600 hover:text-red-900"
      onClick={() => handleDelete(contractor.contractor_id)}
    >
      <TrashIcon className="w-5 md:w-6" />
    </button>
  )}
</div>
```

With:

```tsx
<div className="flex items-center gap-3">
  <IconButton
    color="success"
    icon={<EyeIcon className="h-5 w-5 md:h-6 md:w-6" />}
    onClick={() => handleRowClick(contractor.contractor_id)}
  />

  <IconButton
    color="info"
    icon={<PencilIcon className="h-5 w-5 md:h-6 md:w-6" />}
    onClick={() => handleEdit(contractor.contractor_id)}
  />

  {contractor.active && (
    <IconButton
      color="error"
      icon={<TrashIcon className="h-5 w-5 md:h-6 md:w-6" />}
      onClick={() => handleDelete(contractor.contractor_id)}
    />
  )}
</div>
```

Note: the "edit" icon color changes from the ad hoc `text-blue-500 hover:text-blue-700` (unique to this file) to the standardized `info` mapping (`text-blue-600 hover:text-blue-900`, matching customers/partners) — this is the intended cross-file style standardization called out in the spec.

- [ ] **Step 3: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 4: Manual browser verification**

Run `npm run dev`, open the contractors ("seguradoras") page, and confirm: view/edit icons render for every row, delete only renders for active contractors, all three still open the same modals as before.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/contractors/table.tsx
git commit -m "refactor: migrate contractors table row actions to IconButton"
```

---

## Task 8: Migrate icon buttons in `payments/table.tsx`

**Files:**

- Modify: `src/app/components/payments/table.tsx`

**Interfaces:**

- Consumes: `IconButton` from Task 2, imported as `import { IconButton } from '../common/icon-button';`

Two buttons migrated: confirm (`CheckIcon`, calls `handleConfirmPayment`), edit (`PencilIcon`, calls `handleEditPayment`). Both only render when `transaction.status == TransactionStatus.PENDING`.

- [ ] **Step 1: Add the `IconButton` import**

In `src/app/components/payments/table.tsx`, add to the imports:

```tsx
import { IconButton } from '../common/icon-button';
```

- [ ] **Step 2: Replace the row-actions block**

Replace:

```tsx
<div className="flex gap-2">
  {transaction.status == TransactionStatus.PENDING && (
    <>
      <button
        className="text-green-500 hover:text-green-700"
        onClick={() => handleConfirmPayment(transaction)}
      >
        <CheckIcon className="w-5 md:w-6" />
      </button>

      <button
        className="text-blue-600 hover:text-blue-900"
        onClick={() => handleEditPayment(transaction)}
      >
        <PencilIcon className="w-5 md:w-6" />
      </button>
    </>
  )}
</div>
```

With:

```tsx
<div className="flex gap-2">
  {transaction.status == TransactionStatus.PENDING && (
    <>
      <IconButton
        color="success"
        icon={<CheckIcon className="h-5 w-5 md:h-6 md:w-6" />}
        onClick={() => handleConfirmPayment(transaction)}
      />

      <IconButton
        color="info"
        icon={<PencilIcon className="h-5 w-5 md:h-6 md:w-6" />}
        onClick={() => handleEditPayment(transaction)}
      />
    </>
  )}
</div>
```

- [ ] **Step 3: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 4: Manual browser verification**

Run `npm run dev`, open the payments page, and confirm: confirm/edit icons only render for pending transactions, both still open the same modals as before.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/payments/table.tsx
git commit -m "refactor: migrate payments table row actions to IconButton"
```

---

## Task 9: Migrate the icon button in `users/table.tsx`

**Files:**

- Modify: `src/app/components/users/table.tsx`

**Interfaces:**

- Consumes: `IconButton` from Task 2, imported as `import { IconButton } from '../common/icon-button';`

One button migrated: view (`EyeIcon`, calls `handleRowClick`, disabled when `!user.active`).

- [ ] **Step 1: Add the `IconButton` import**

In `src/app/components/users/table.tsx`, add to the imports:

```tsx
import { IconButton } from '../common/icon-button';
```

- [ ] **Step 2: Replace the row-actions block**

Replace:

```tsx
<div className="flex gap-2">
  <button
    disabled={!user.active}
    className="text-blue-500 hover:text-blue-700"
    onClick={() => handleRowClick(user.user_id)}
  >
    <EyeIcon className="h-5 w-5" />
  </button>
</div>
```

With:

```tsx
<div className="flex gap-2">
  <IconButton
    color="info"
    disabled={!user.active}
    icon={<EyeIcon className="h-5 w-5 md:h-6 md:w-6" />}
    onClick={() => handleRowClick(user.user_id)}
  />
</div>
```

Note: the color changes from the ad hoc `text-blue-500 hover:text-blue-700` (unique to this file) to the standardized `info` mapping (`text-blue-600 hover:text-blue-900`) — same intended standardization as Task 7.

- [ ] **Step 3: Verify types and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: no new errors.

- [ ] **Step 4: Manual browser verification**

Run `npm run dev`, open the users page, and confirm: the view icon is disabled (not clickable) for inactive users, and enabled/clickable for active users, navigating to the same user detail route as before.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/users/table.tsx
git commit -m "refactor: migrate users table row action to IconButton"
```

---

## Final verification (after all 9 tasks)

- [ ] Run the full test suite: `npm run test:ci` — expect all tests passing, including the 9 new `Button` tests and 8 new `IconButton` tests.
- [ ] Run `npx tsc --noEmit` and `npm run lint` at the repo root — expect zero errors.
- [ ] Manually re-check both "Buscar" buttons and all 5 tables' row actions in the browser one more time end-to-end, per the steps in Tasks 3-9.
- [ ] Confirm `docs/design-system-audit.md`'s "Botão" row reflects the new adoption if this plan is later revisited as a reference.
