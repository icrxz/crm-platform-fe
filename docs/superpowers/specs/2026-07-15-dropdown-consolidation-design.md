# Consolidação do componente Dropdown nos formulários de entidade

## Contexto

Após a consolidação do `TextInput` (branch `feature/design-system-textinput`, PR #95), o próximo componente do design system a ser padronizado é o `Dropdown` (`src/app/components/common/dropdown/dropdown.tsx`).

Auditoria do estado atual:

- Nenhum dos 4 formulários de entidade (`customer-form.tsx`, `contractor-form.tsx`, `partner-form.tsx`, `case-form.tsx`) usa o `Dropdown` — todos os selects são `<select>` cru, com a mesma classe Tailwind que o `Dropdown` já usa (`peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500`). Não há divergência de estilo a resolver, diferente do que ocorreu com o `TextInput`.
- `contractor-form.tsx` não possui nenhum campo select — fica fora do escopo desta migração.
- O `Dropdown` atual tem os mesmos dois problemas que o `TextInput` tinha antes de ser refinado:
  - Sem suporte a `disabled` (nenhuma classe `disabled:*` no `<select>`).
  - Sem suporte a `error` (sem borda vermelha condicional, sem `<ErrorMessage>`).
  - Também tem o mesmo typo de diretiva: `'useClient';` em vez de `'use client';` (linha 1).
  - Falta o wrapper `<div className="relative">` ao redor do `<select>`, presente na maioria dos selects crus dos formulários (exceto o select "contractor" do `case-form.tsx`, que também não tem esse wrapper hoje).
- O `case-form.tsx` tem um bug pré-existente no select "state": é renderizado como controlado (`value={customer?.shipping.state}`) sem `onChange`, o que dispara o warning do React "a component is changing an uncontrolled input to be controlled" / input controlado sem handler. Os demais campos do `case-form` (`first_name`, `last_name`, `city`) já usam o padrão uncontrolled (`defaultValue` + `disabled={!hasSearchedCustomer || !!customer}`) desde a migração do `TextInput`.

## Decisões

1. **Escopo do refinamento do `Dropdown`**: adicionar suporte a `disabled` (com estilo visual) e `error` (borda vermelha + `ErrorMessage`), espelhando exatamente o que já existe no `TextInput`. Também corrigir o typo `'use client'` e adicionar o wrapper `relative`.
2. **Bug do select "state" no `case-form`**: migrar para o padrão uncontrolled já usado pelos outros campos do formulário — `defaultValue={customer?.shipping.state || ''}` + `disabled={!hasSearchedCustomer || !!customer}` — eliminando o warning de controlled/uncontrolled.
3. **Estratégia de testes**: idêntica à usada no `TextInput` — testes automatizados isolados apenas para o componente `Dropdown` (TDD). Para os formulários (`customer-form`, `partner-form`, `case-form`), a verificação é feita via `tsc --noEmit`, `lint`, revisão de código e checagem manual no navegador, dado que `useActionState` (React 19 API) não é suportado pela versão de React instalada (18.3.1) no ambiente de testes Jest — limitação pré-existente, documentada durante o trabalho do `TextInput`, fora do escopo desta consolidação.

## API do componente `Dropdown` (após o refinamento)

```tsx
interface DropdownProps {
  name: string;
  label: string;
  options: Array<DropdownOption>; // sem mudança: { id, value, label }
  placeholder?: string;
  required?: boolean;
  disabled?: boolean; // novo
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  optional?: boolean;
  error?: string; // novo
}
```

Estilo do `<select>` após o refinamento (mesma estrutura do `TextInput`):

```tsx
const borderColor = error ? 'border-red-500' : 'border-gray-200';
// ...
<div className="relative">
  <select
    className={`peer block w-full rounded-md border ${borderColor} py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100`}
    disabled={disabled}
    // ...resto inalterado
  />
</div>;
{
  error && <ErrorMessage message={error} />;
}
```

Nenhuma mudança na assinatura de `onChange` (continua recebendo `string`, não o evento cru — diferente do `TextInput`), nem no formato de `DropdownOption`.

## Escopo da migração por formulário

| Formulário          | Campo                | Origem das opções                                                                          | Wiring                                                                                                                                            |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `customer-form.tsx` | `state`              | `brazilStates` (array de strings, mapeado para `{id: s, value: s, label: s}`)              | uncontrolled, `defaultValue={customer?.shipping.state \|\| ''}`                                                                                   |
| `partner-form.tsx`  | `partner_type`       | 2 valores hardcoded ("Montador"/"Tapeceiro")                                               | uncontrolled, `defaultValue={partner?.partner_type \|\| ''}`                                                                                      |
| `partner-form.tsx`  | `payment_key_option` | `Object.values(PaymentOptions)`, label via `paymentOptionMap`                              | uncontrolled, `defaultValue={partner?.payment_key_option \|\| ''}`                                                                                |
| `partner-form.tsx`  | `state`              | `brazilStates`                                                                             | uncontrolled, `defaultValue={partner?.shipping?.state \|\| ''}`                                                                                   |
| `case-form.tsx`     | `contractor`         | dinâmico via `fetchContractors` (`id`/`value` = `contractor_id`, `label` = `company_name`) | uncontrolled, sem `defaultValue` (igual hoje); `required`                                                                                         |
| `case-form.tsx`     | `state`              | `brazilStates`                                                                             | uncontrolled, `defaultValue={customer?.shipping.state \|\| ''}`, `disabled={!hasSearchedCustomer \|\| !!customer}` (corrige o bug descrito acima) |

`contractor-form.tsx` não tem campos select — nenhuma mudança nele.

Fora de escopo: nenhum outro uso de `Dropdown` (ex: `panel/search.tsx`, `cases/filter-modal.tsx`, `partners/filter-modal.tsx`) será alterado — esses já usam `Dropdown` e não fazem parte da consolidação dos formulários de entidade.

## Testes

- **`Dropdown` isolado** (TDD, novo arquivo `dropdown.test.tsx`): label/id associados, wrapper `relative` presente, uncontrolled via `defaultValue`, controlado via `value`/`onChange`, estilo de `disabled`, `error` com borda vermelha + `ErrorMessage`, ausência de erro quando não fornecido, `required`, renderização das `options` (incluindo `placeholder` e `optional`).
- **Formulários**: sem testes de render automatizados (limitação do `useActionState`/Jest). Verificação via `tsc --noEmit`, `npm run lint`, revisão de código, e checagem manual no navegador dos fluxos de criar/editar para os 3 formulários afetados (customer, partner, case).
