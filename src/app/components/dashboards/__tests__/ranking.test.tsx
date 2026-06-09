import { render, screen } from '@testing-library/react';
import Ranking from '../ranking';

jest.mock('../../../services/cases/fetch_ranking', () => ({
  fetchRankingData: jest.fn(),
}));

const { fetchRankingData } = jest.requireMock(
  '../../../services/cases/fetch_ranking'
);

const mockAgents = [
  {
    name: 'João Silva',
    inProgress: { green: 8, yellow: 3, red: 2, mostDelayed: 'CASO-099' },
    finalized: { vistoria: 20, reparo: 14 },
  },
  {
    name: 'Maria Oliveira',
    inProgress: { green: 6, yellow: 4, red: 1, mostDelayed: 'CASO-074' },
    finalized: { vistoria: 15, reparo: 13 },
  },
  {
    name: 'Daniel Costa',
    inProgress: { green: 5, yellow: 2, red: 3, mostDelayed: 'CASO-051' },
    finalized: { vistoria: 12, reparo: 9 },
  },
  {
    name: 'Ana Ferreira',
    inProgress: { green: 4, yellow: 5, red: 0, mostDelayed: '' },
    finalized: { vistoria: 10, reparo: 8 },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  fetchRankingData.mockResolvedValue({
    success: true,
    message: '',
    data: mockAgents,
  });
});

describe('Ranking', () => {
  describe('rendering', () => {
    it('should render the section title', async () => {
      render(await Ranking());
      expect(screen.getByText('Ranking – Atendimento')).toBeInTheDocument();
    });

    it('should render the "Ver Todos" action link', async () => {
      render(await Ranking());
      expect(screen.getByText('Ver Todos')).toBeInTheDocument();
    });

    it('should render the bonus banner', async () => {
      render(await Ranking());
      expect(screen.getByText(/Bônus Liderança Geral/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 400,00/)).toBeInTheDocument();
    });

    it('should render all agents by first name', async () => {
      render(await Ranking());
      expect(screen.getByText('João')).toBeInTheDocument();
      expect(screen.getByText('Maria')).toBeInTheDocument();
      expect(screen.getByText('Daniel')).toBeInTheDocument();
      expect(screen.getByText('Ana')).toBeInTheDocument();
    });

    it('should render gold medal for first place', async () => {
      render(await Ranking());
      expect(screen.getByText('🥇')).toBeInTheDocument();
    });

    it('should render silver medal for second place', async () => {
      render(await Ranking());
      expect(screen.getByText('🥈')).toBeInTheDocument();
    });

    it('should render bronze medal for third place', async () => {
      render(await Ranking());
      expect(screen.getByText('🥉')).toBeInTheDocument();
    });

    it('should render numeric position for fourth place', async () => {
      render(await Ranking());
      const matches = screen.getAllByText('4');
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should render the delay traffic light labels', async () => {
      render(await Ranking());
      const labels = screen.getAllByText(/≤5d/);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should render the most delayed case number', async () => {
      render(await Ranking());
      expect(screen.getByText(/CASO-099/)).toBeInTheDocument();
    });

    it('should render an empty state when service returns no agents', async () => {
      fetchRankingData.mockResolvedValue({
        success: true,
        message: '',
        data: [],
      });
      const { container } = render(await Ranking());
      expect(container.querySelector('.grid')).toBeTruthy();
    });
  });
});
