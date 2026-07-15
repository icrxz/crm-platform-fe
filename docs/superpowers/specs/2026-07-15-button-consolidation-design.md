# Consolidação do componente Button e ícones de ação nas tabelas

## Contexto

Após a consolidação do `TextInput` e do `Dropdown` (branch `feature/design-system-textinput`, PR #95), o próximo item do design system é o `Button` (`src/app/components/common/button/index.tsx`).

Auditoria do estado atual:

- Diferente do `TextInput`/`Dropdown`, a adoção do `Button` já é alta: todos os botões de ação em formulários e modais de entidade (`customer-form.tsx`, `contractor-form.tsx`, `partner-form.tsx`, `case-form.tsx`, `delete-customer.tsx`, `delete-contractor.tsx`, `delete-partner.tsx`, `confirm-payment.tsx`, `edit-payment.tsx`, `first-login-modal.tsx`, `batch-form-modal.tsx`, `download-report-button.tsx`, `form-details/report.tsx`, `form-details/ongoing_case.tsx`) já usam o componente `Button`.
- Restam dois grupos com duplicação real de `<button>` cru:
  1. **Botão "Buscar"**: `case-form.tsx` e `form-details/draft_case.tsx` têm um `<button type="button">` com a mesma className (`rounded-md bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500`, mais `disabled:cursor-not-allowed disabled:bg-gray-200` em `draft_case.tsx`), usado para disparar a busca de cliente por documento. `form-details/ongoing_case.tsx` não tem esse botão.
  2. **Ícones de ação em tabelas**: `customers/table.tsx`, `partners/table.tsx`, `contractors/table.tsx`, `payments/table.tsx` e `users/table.tsx` têm botões `<button>` cru contendo apenas um ícone (`@heroicons/react`), sem background, com cor de texto semântica (verde=ver, azul=editar/confirmar, vermelho=excluir). Tamanho do ícone varia inconsistentemente entre `h-5 w-5` e `w-5 md:w-6` nos mesmos arquivos.
- Fora de escopo (one-off, sem duplicação real a resolver): botões de dashboard (`achievements.tsx`, `ranking.tsx`, `rewards.tsx` — link-style; `attendance-bonus.tsx`, `period-filter.tsx` — toggle), e o botão de logout em `sidebar/sidenav.tsx`.
- **Bug pré-existente no `Button`**: `<button {...rest} disabled={isLoading} ...>` — como `disabled={isLoading}` vem depois de `{...rest}` no JSX, qualquer `disabled` passado pelo caller é sempre sobrescrito. É por isso que os botões "Criar"/"Cancelar" dos formulários usam o workaround `aria-disabled={pending}` em vez de `disabled` real. Isso impede a migração do botão "Buscar" (que precisa de `disabled` real baseado em `pending`/`searchingUser`/`hasSearchedCustomer`).

## Decisões

1. **Fix no `Button`**: trocar `disabled={isLoading}` por `disabled={isLoading || rest.disabled}`, preservando compatibilidade total com o código existente (nenhum caller atual passa `disabled` hoje) e permitindo callers futuros combinarem `isLoading` com uma condição de `disabled` própria.
2. **Migração do botão "Buscar"**: `case-form.tsx` e `form-details/draft_case.tsx` passam a usar `<Button type="button" color="info" size="md" disabled={...} onClick={handleSearchUser}>Buscar</Button>`, mantendo exatamente as mesmas condições de `disabled` que cada arquivo já tinha. `ongoing_case.tsx` não é alterado (não tem esse botão).
3. **Novo primitivo `IconButton`** (`src/app/components/common/icon-button/index.tsx`), para os botões de ação nas 5 tabelas. Substitui os `<button>` crus mantendo exatamente o mesmo comportamento (`onClick`, `disabled` quando presente, renderização condicional por `active`/`status` inalterada nos arquivos-chamadores).
4. **Estratégia de testes**: idêntica à usada no `TextInput`/`Dropdown` — testes automatizados isolados para `Button` (novo arquivo, cobrindo o fix de `disabled`) e para `IconButton` (TDD). Sem testes de render automatizados para os formulários/tabelas (mesma limitação pré-existente do `useActionState`/Jest); verificação via `tsc --noEmit`, `npm run lint`, revisão de código e checagem manual no navegador.

## API do `IconButton`

```tsx
interface IconButtonProps {
  icon: ReactNode;
  color: 'success' | 'info' | 'error';
  onClick: () => void;
  disabled?: boolean;
  title?: string; // aria-label / tooltip, opcional
}
```

Mapeamento de cor (padroniza as variações hoje inconsistentes entre arquivos):

| `color`   | Classe                                | Uso semântico             |
| --------- | ------------------------------------- | ------------------------- |
| `success` | `text-green-500 hover:text-green-700` | ver / confirmar pagamento |
| `info`    | `text-blue-600 hover:text-blue-900`   | editar                    |
| `error`   | `text-red-600 hover:text-red-900`     | excluir                   |

Tamanho do ícone padronizado para `h-5 w-5 md:h-6 md:w-6` (hoje varia entre `h-5 w-5` e `w-5 md:w-6` nos mesmos arquivos). O `<button>` interno ganha `type="button"` (ausente hoje) para evitar submit acidental caso a tabela algum dia fique dentro de um `<form>`.

```tsx
export function IconButton({
  icon,
  color,
  onClick,
  disabled,
  title,
}: IconButtonProps) {
  const colorClass = {
    success: 'text-green-500 hover:text-green-700',
    info: 'text-blue-600 hover:text-blue-900',
    error: 'text-red-600 hover:text-red-900',
  }[color];

  return (
    <button
      type="button"
      className={colorClass}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <span className="[&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-6 md:[&>svg]:w-6">
        {icon}
      </span>
    </button>
  );
}
```

(O plano de implementação define a forma final exata; o acima é a referência de API/estilo, não o código final obrigatório.)

## Escopo da migração

| Arquivo                             | Botão(ões)                             | Mudança                                                                                                                         |
| ----------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `common/button/index.tsx`           | —                                      | Fix: `disabled={isLoading \|\| rest.disabled}`                                                                                  |
| `cases/case-form.tsx`               | "Buscar"                               | `<button>` cru → `<Button type="button" color="info" size="md" disabled={pending \|\| searchingUser}>`                          |
| `cases/form-details/draft_case.tsx` | "Buscar"                               | `<button>` cru → `<Button type="button" color="info" size="md" disabled={pending \|\| searchingUser \|\| hasSearchedCustomer}>` |
| `customers/table.tsx`               | ver, editar, excluir (condicional)     | 3 `<button>` crus → `<IconButton>`                                                                                              |
| `partners/table.tsx`                | ver, editar, excluir (condicional)     | 3 `<button>` crus → `<IconButton>`                                                                                              |
| `contractors/table.tsx`             | ver, editar, excluir (condicional)     | 3 `<button>` crus → `<IconButton>`                                                                                              |
| `payments/table.tsx`                | confirmar, editar (ambos condicionais) | 2 `<button>` crus → `<IconButton>`                                                                                              |
| `users/table.tsx`                   | ver (com `disabled={!user.active}`)    | 1 `<button>` cru → `<IconButton>`                                                                                               |

Fora de escopo: `dashboards/*.tsx`, `sidebar/sidenav.tsx`, e qualquer botão que já use o componente `Button`.

## Testes

- **`Button`**: novo teste cobrindo o fix — `disabled` passado pelo caller é respeitado quando `isLoading` é `false`/omitido; `isLoading` continua desabilitando o botão mesmo sem `disabled` explícito; ambos combinados (`disabled || isLoading`) mantêm o botão desabilitado.
- **`IconButton`** (TDD, novo arquivo `icon-button.test.tsx`): renderiza o ícone recebido, aplica a classe de cor correta por `color`, dispara `onClick`, respeita `disabled` (não dispara `onClick` quando desabilitado), aplica `title` quando fornecido, `type="button"` presente.
- **Formulários/tabelas**: sem testes de render automatizados (limitação do `useActionState`/Jest, e as tabelas dependem de dados assíncronos mockados extensivamente). Verificação via `tsc --noEmit`, `npm run lint`, revisão de código, e checagem manual no navegador dos fluxos afetados (busca de cliente em criar/editar caso; ações de ver/editar/excluir nas 5 tabelas; confirmar/editar pagamento).
