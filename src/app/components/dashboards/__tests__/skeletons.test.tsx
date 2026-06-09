import { render, screen } from '@testing-library/react';
import {
  AttendanceBonusSkeleton,
  ChartSkeleton,
  GenericSkeleton,
  KpiCardsSkeleton,
  RankingSkeleton,
} from '../skeletons';

describe('Skeletons', () => {
  describe('KpiCardsSkeleton', () => {
    it('should render two skeleton cards', () => {
      const { container } = render(<KpiCardsSkeleton />);
      const skeletonCards = container.querySelectorAll('.rounded-xl');
      expect(skeletonCards).toHaveLength(2);
    });
  });

  describe('RankingSkeleton', () => {
    it('should render without crashing', () => {
      const { container } = render(<RankingSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render four row placeholders', () => {
      const { container } = render(<RankingSkeleton />);
      const rows = container.querySelectorAll('.rounded-full');
      expect(rows.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('ChartSkeleton', () => {
    it('should render without crashing', () => {
      const { container } = render(<ChartSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render a large placeholder area for the chart', () => {
      const { container } = render(<ChartSkeleton />);
      const chartArea = container.querySelector('.h-48');
      expect(chartArea).toBeInTheDocument();
    });
  });

  describe('AttendanceBonusSkeleton', () => {
    it('should render without crashing', () => {
      const { container } = render(<AttendanceBonusSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render twelve avatar placeholders', () => {
      const { container } = render(<AttendanceBonusSkeleton />);
      const avatars = container.querySelectorAll('.rounded-full');
      expect(avatars.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('GenericSkeleton', () => {
    it('should render without crashing', () => {
      const { container } = render(<GenericSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render four item placeholders', () => {
      const { container } = render(<GenericSkeleton />);
      const items = container.querySelectorAll('.rounded-full');
      expect(items).toHaveLength(4);
    });
  });
});
