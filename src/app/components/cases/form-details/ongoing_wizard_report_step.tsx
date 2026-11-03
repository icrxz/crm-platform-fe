'use client';
import { CaseServiceType } from '@/app/types/case';
import { Button } from '../../common/button';
import { Pill } from '../../common/pill';

interface WizardReportStepProps {
  hidden: boolean;
  checklist: { key: string; title: string; done: boolean }[];
  serviceType: CaseServiceType;
  action: (formData: FormData) => void;
}

// O laudo sai com o que já foi enviado nas etapas anteriores; aqui o técnico
// só confere o que falta e escreve a conclusão.
export function WizardReportStep({
  hidden,
  checklist,
  serviceType,
  action,
}: WizardReportStepProps) {
  return (
    <section hidden={hidden} aria-label="Envio para o laudo">
      <ul className="mb-4 space-y-1">
        {checklist.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <Pill
              text={item.done ? 'Enviado' : 'Pendente'}
              color={item.done ? 'success' : 'warning'}
              size="sm"
            />
            {item.title}
          </li>
        ))}
      </ul>

      <form action={action}>
        <input type="hidden" name="type" value={serviceType} />
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="report-content"
        >
          Conclusão do atendimento
        </label>
        <textarea
          id="report-content"
          name="content"
          className="mb-4 h-32 w-full rounded-md border border-gray-300 p-2"
          rows={3}
          placeholder="Descreva o que foi feito no atendimento para constar no laudo"
          required
        />
        <Button type="submit">Enviar para laudo</Button>
      </form>
    </section>
  );
}
