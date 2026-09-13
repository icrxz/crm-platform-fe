import { render, screen } from '@testing-library/react';
import ControlPanelSummary from '../summary';
import { buildPanelCaseItem } from '../__fixtures__/builders';
import { TransactionType } from '../../../types/transaction';

async function renderSummary(
  cases: Parameters<typeof ControlPanelSummary>[0]['cases']
) {
  const jsx = await ControlPanelSummary({ cases });
  render(jsx);
}

describe('ControlPanelSummary', () => {
  const cases = [
    buildPanelCaseItem({
      case_id: 'case-001',
      transactions: [
        {
          type: TransactionType.INCOMING,
          description: 'Cobrado seguradora',
          value: 500,
        },
        {
          type: TransactionType.INCOMING,
          description: 'Deslocamento',
          value: 50,
        },
        { type: TransactionType.INCOMING, description: 'Peças', value: 30 },
        { type: TransactionType.OUTGOING, description: 'MO', value: 200 },
        {
          type: TransactionType.OUTGOING,
          description: 'Deslocamento Técnico',
          value: 20,
        },
        {
          type: TransactionType.OUTGOING,
          description: 'Peças técnico',
          value: 10,
        },
      ],
    }),
  ];

  it('groups the 3 incoming values with the incoming total in one row of 4', async () => {
    await renderSummary(cases);

    expect(screen.getByText('Mão de obra Seguradora')).toBeInTheDocument();
    expect(screen.getByText('Deslocamento Seguradora')).toBeInTheDocument();
    expect(screen.getByText('Peças Seguradora')).toBeInTheDocument();
    expect(screen.getByText('Total entrada')).toBeInTheDocument();
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 50,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 30,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 580,00')).toBeInTheDocument();
  });

  it('groups the 3 outgoing values with the outgoing total in one row of 4', async () => {
    await renderSummary(cases);

    expect(screen.getByText('Mão de obra Técnico')).toBeInTheDocument();
    expect(screen.getByText('Deslocamento Técnico')).toBeInTheDocument();
    expect(screen.getByText('Peças Técnico')).toBeInTheDocument();
    expect(screen.getByText('Total saída')).toBeInTheDocument();
    expect(screen.getByText('R$ 200,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 20,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 10,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 230,00')).toBeInTheDocument();
  });

  it('renders the grid with 4 columns on large screens', async () => {
    await renderSummary(cases);

    const grid = screen.getByText('Total entrada').closest('.grid');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('shows the case count outside of the grid', async () => {
    await renderSummary(cases);

    expect(screen.getByText('Total de casos:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('1').closest('.grid')).toBeNull();
  });

  it('computes profit as incoming minus outgoing', async () => {
    await renderSummary(cases);

    expect(screen.getByText('Lucro:')).toBeInTheDocument();
    expect(screen.getByText('R$ 350,00')).toBeInTheDocument();
  });

  it('shows a loss in red when outgoing exceeds incoming', async () => {
    const lossCase = [
      buildPanelCaseItem({
        transactions: [
          {
            type: TransactionType.INCOMING,
            description: 'Cobrado seguradora',
            value: 100,
          },
          { type: TransactionType.OUTGOING, description: 'MO', value: 400 },
        ],
      }),
    ];

    await renderSummary(lossCase);

    const profitValue = screen.getByText('-R$ 300,00');
    expect(profitValue).toHaveClass('text-rose-700');
  });
});
