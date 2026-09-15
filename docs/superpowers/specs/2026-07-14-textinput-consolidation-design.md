# Design: consolidação do componente `TextInput`

## Contexto

Primeira etapa do plano de implementação do design system (ver `docs/design-system-audit.md`, prioridade 1). A estratégia acordada é: um componente comum por vez — refinar o componente até bater com o padrão real já usado no app, e só então substituir os usos antigos pelos novos.

`TextInput` foi escolhido como ponto de partida por ser o padrão mais duplicado hoje (45+ ocorrências de `<input>` cru) e ter **zero adoção real** (só é usado uma vez, em `partner-form.tsx`, para o campo "Nome do titular").

Uma auditoria de código (via Explore) comparou o `TextInput` atual em `src/app/components/common/text-input/text-input.tsx` contra o uso real de `<input>` nos 4 formulários de entidade (`customer-form.tsx`, `contractor-form.tsx`, `partner-form.tsx`, `case-form.tsx`). Achados:

- Todos os 4 formulários usam o mesmo padrão: `useActionState` + `useFormStatus` (Server Actions do Next.js), inputs **não-controlados** via `name`/`defaultValue`. Nenhum usa react-hook-form/Formik.
- A `className` base do `<input>` cru é idêntica nos 4 arquivos e já bate com a do `TextInput` atual — não há mudança de estilo base necessária.
- Todo `<input>` cru é envolvido em `<div><label .../><div className="relative">{input}</div></div>` — o `TextInput` atual **não tem** o `<div className="relative">` interno.
- `disabled:bg-gray-300` no `TextInput` atual vs. `disabled:bg-gray-100` usado de fato em `case-form.tsx` (único lugar com `disabled` em input de texto hoje).
- Nenhum formulário usa `onChange`/`value` controlado em campo de texto simples — o único caso controlado encontrado é um campo mascarado (`InputMask` em `case-form.tsx`), fora do escopo desta etapa.
- Campos com máscara (CPF/CNPJ via `InputMask`) e moeda (`InputNumberFormat`) existem em `customer-form.tsx`, `contractor-form.tsx` e `case-form.tsx` — ficam de fora desta etapa.
- Nenhum formulário mostra erro de validação hoje (só `required` nativo do HTML, sem indicador visual). Existe um componente `ErrorMessage` (`common/error-message/index.tsx`, prop `message: string`) já pronto mas não usado em nenhum formulário.

## Decisões (tomadas com o usuário)

1. **Escopo do componente**: `TextInput` cobre só texto simples (com ou sem máscara/formatação **não** incluído). `InputMask` e `InputNumberFormat` continuam como estão — viram componentes próprios (`MaskedInput`, `CurrencyInput`) em etapa futura.
2. **Modo controlado**: adicionar suporte opcional a `value`/`onChange`, coexistindo com o modo não-controlado (`defaultValue`) já existente. Nenhum uso atual de texto simples precisa disso agora, mas evita quebrar a API depois.
3. **Cor de fundo disabled**: padronizar em `disabled:bg-gray-100` (bate com o que já está em produção em `case-form.tsx`), substituindo o `disabled:bg-gray-300` atual do componente.
4. **Estado de erro**: adicionar prop opcional `error?: string`. Quando presente, aplica borda vermelha no input e renderiza `ErrorMessage` (componente já existente) abaixo do campo. Nenhum formulário é obrigado a usá-la agora — fica pronta para quando validação client-side for adicionada.

## Novo shape do `TextInput`

```ts
interface TextInputProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: string; // não-controlado (mantido)
  value?: string; // controlado (novo, opcional)
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // (novo, opcional)
  error?: string; // (novo, opcional) — ativa borda vermelha + ErrorMessage
}
```

Mudanças de markup:

- Adicionar `<div className="relative">` envolvendo o `<input>`, para bater com o padrão já usado em todo o app.
- `disabled:bg-gray-300` → `disabled:bg-gray-100`.
- Quando `error` estiver presente: trocar `border-gray-200` por `border-red-500` (ou equivalente) no input e renderizar `<ErrorMessage message={error} />` logo abaixo do `<div className="relative">`.
- Continuar aceitando todos os atributos de `<button>`... (não aplicável aqui — é `<input>`; manter os HTML attrs relevantes já suportados: `id`, `type`, `name`, `placeholder`, `required`, `disabled`).

## Escopo da substituição (usos antigos → novo componente)

Trocar por `TextInput` **apenas os campos de texto simples e não-mascarados** nos 4 formulários de entidade:

- `src/app/components/customers/customer-form.tsx`
- `src/app/components/contractors/contractor-form.tsx`
- `src/app/components/partners/partner-form.tsx`
- `src/app/components/cases/case-form.tsx`

Campos com `InputMask` (CPF/CNPJ) e `InputNumberFormat` (moeda) **não** são tocados nesta etapa — permanecem com markup cru. O `<select>` de estado em `case-form.tsx` (que usa `value` sem `onChange`, um bug pré-existente) também não é tocado — é escopo do componente `Dropdown`, não `TextInput`.

`partner-form.tsx` já importa e usa `TextInput` em um campo — a nova API é aditiva (todas as props novas são opcionais), então esse uso continua funcionando sem alteração.

## Fora de escopo

- `InputMask`/`InputNumberFormat` (CPF, CNPJ, moeda) — não migram nesta etapa.
- `<select>`/`Dropdown` — componente separado, próxima etapa do design system.
- Adição de validação client-side real (a prop `error` fica pronta, mas nenhum formulário passa a validar nesta etapa).
- Qualquer outro formulário fora dos 4 listados (ex: `login-form.tsx`, `delete-*.tsx`, `edit-payment.tsx`, `first-login-modal.tsx`) — ficam para uma rodada futura de adoção do `TextInput`.

## Verificação

- `TextInput` continua renderizando visualmente idêntico aos inputs crus atuais quando usado sem `error`/`value`/`onChange` (regressão visual zero nos campos migrados).
- Cada formulário migrado continua funcionando via Server Action (`useActionState`) sem alteração de comportamento — os campos migrados devem submeter os mesmos valores de `name`.
- Testar manualmente os 4 formulários (criar/editar customer, contractor, partner, case) no navegador após a migração, conferindo layout, `required`, `disabled` (caso `case-form.tsx`) e submissão.
