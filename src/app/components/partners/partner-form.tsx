`use client`;
import { parseDocument } from '@/app/libs/parser';
import { brazilStates } from '@/app/types/address';
import { Partner, paymentOptionMap, PaymentOptions } from '@/app/types/partner';
import { ServiceResponse } from '@/app/types/service';
import { roboto } from '@/app/ui/fonts';
import { Checkbox } from '@heroui/checkbox';
import { InputMask } from '@react-input/mask';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '../common/button';
import { Dropdown } from '../common/dropdown/dropdown';
import { TextInput } from '../common/text-input/text-input';

interface PartnerFormProps {
  partner?: Partner;
  onSubmit: (
    _currentState: unknown,
    formData: FormData
  ) => Promise<ServiceResponse<any>>;
  onClose: () => void;
  submitState?: Dispatch<SetStateAction<ServiceResponse<any> | null>>;
}

export default function PartnerForm({
  partner,
  onSubmit,
  submitState,
  onClose,
}: PartnerFormProps) {
  const [state, dispatch] = useActionState(onSubmit, null);
  const { pending } = useFormStatus();

  const [isFromSameOwner, setIsFromSameOwner] = useState<boolean>(
    partner?.payment_is_from_same_owner === undefined
      ? true
      : partner.payment_is_from_same_owner
  );

  useEffect(() => {
    if (submitState) {
      submitState(state);
    }
  }, [state, submitState]);

  function handleAccountOwnerChange(isSelected: boolean) {
    setIsFromSameOwner(isSelected);
  }

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1">
        <h1 className={`${roboto.className} mb-5 text-2xl`}>
          {partner ? 'Edite o técnico' : 'Cadastre o técnico'}
          <input
            type="hidden"
            name="partner_id"
            value={partner?.partner_id || ''}
          />
        </h1>

        <div className="w-full">
          <div className="mb-4 columns-3">
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

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="document"
              >
                Documento
              </label>

              <div className="relative">
                <InputMask
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  id="document"
                  name="document"
                  placeholder="Digite o CPF"
                  mask="___.___.___-__"
                  replacement={{ _: /\d/ }}
                  defaultValue={parseDocument(partner?.document || '')}
                  required
                />
              </div>
            </div>
          </div>

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

          <div className="mb-4 columns-2">
            <TextInput
              label="Chave PIX"
              name="payment_key"
              placeholder="Digite a chave pix"
              defaultValue={partner?.payment_key || ''}
              required
            />

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
          </div>

          <div className="my-4 flex w-full flex-row items-center">
            <div className="w-1/2 flex-none">
              <Checkbox
                isSelected={isFromSameOwner}
                onValueChange={handleAccountOwnerChange}
                id="payment_is_from_same_owner"
                name="payment_is_from_same_owner"
                size="sm"
              >
                É o titular da conta
              </Checkbox>
            </div>

            <div className="ml-2 w-1/2 flex-none">
              {!isFromSameOwner && (
                <TextInput
                  label="Nome do titular"
                  name="payment_owner"
                  placeholder="Insira o nome do titular da conta"
                  defaultValue={partner?.payment_owner || ''}
                  required
                />
              )}
            </div>
          </div>

          <hr />

          <div className="my-4 columns-2">
            <TextInput
              label="Cidade"
              name="city"
              defaultValue={partner?.shipping?.city || ''}
              placeholder="Digite a cidade"
            />

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
          </div>

          <hr />

          <div className="my-4 columns-2">
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="phone"
              >
                Telefone
              </label>

              <div className="relative">
                <InputMask
                  id="phone"
                  name="phone"
                  placeholder="Digite o telefone"
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                  mask="+55 (__) _____-____"
                  replacement={{ _: /\d/ }}
                  defaultValue={partner?.personal_contact?.phone_number || ''}
                />
              </div>
            </div>

            <TextInput
              label="Email"
              name="email"
              type="email"
              placeholder="Digite o email"
              defaultValue={partner?.personal_contact?.email || ''}
            />
          </div>

          <div className="mt-6 flex space-x-8">
            <Button
              type="submit"
              className="w-32 items-center"
              isLoading={pending}
              aria-disabled={pending}
            >
              {partner ? 'Salvar' : 'Criar'}
            </Button>

            <Button
              type="button"
              className="w-32 items-center"
              isLoading={pending}
              aria-disabled={pending}
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
