import { render, screen, fireEvent } from '@testing-library/react';
import { ImageCarousel } from '../image-carousel';

jest.mock('yet-another-react-lightbox', () => ({
  __esModule: true,
  default: ({ open, index }: { open: boolean; index: number }) =>
    open ? <div data-testid="lightbox" data-index={index} /> : null,
  useLightboxState: () => ({ currentSlide: null }),
}));

jest.mock(
  'yet-another-react-lightbox/plugins/counter',
  () => ({ __esModule: true, default: 'counter-plugin' }),
  { virtual: true }
);

function buildImages(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `image-${index}`,
    src: `https://example.com/image-${index}.png`,
    alt: `Imagem ${index}`,
  }));
}

describe('ImageCarousel', () => {
  it('renders nothing when there are no images', () => {
    const { container } = render(<ImageCarousel images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('disables both arrows when the image count fits within maxVisible', () => {
    render(<ImageCarousel images={buildImages(3)} maxVisible={5} />);

    expect(screen.getByLabelText('Imagens anteriores')).toBeDisabled();
    expect(screen.getByLabelText('Próximas imagens')).toBeDisabled();
  });

  it('enables the next arrow when there are more images than maxVisible', () => {
    render(<ImageCarousel images={buildImages(8)} maxVisible={5} />);

    expect(screen.getByLabelText('Imagens anteriores')).toBeDisabled();
    expect(screen.getByLabelText('Próximas imagens')).toBeEnabled();
  });

  it('enables the prev arrow and disables next once scrolled to the end', () => {
    render(<ImageCarousel images={buildImages(8)} maxVisible={5} />);

    const nextButton = screen.getByLabelText('Próximas imagens');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    expect(nextButton).toBeDisabled();
    expect(screen.getByLabelText('Imagens anteriores')).toBeEnabled();
  });

  it('opens the lightbox at the clicked image index', () => {
    render(<ImageCarousel images={buildImages(3)} />);

    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByAltText('Imagem 1'));

    expect(screen.getByTestId('lightbox')).toHaveAttribute('data-index', '1');
  });
});
