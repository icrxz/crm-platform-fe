'use client';

import {
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useState } from 'react';
import Lightbox, { useLightboxState } from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';

export interface CarouselImage {
  id: string;
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  maxVisible?: number;
}

const ITEM_SIZE = 96;
const ITEM_GAP = 8;

function OpenInNewTabButton() {
  const { currentSlide } = useLightboxState();
  if (!currentSlide || !('src' in currentSlide)) return null;

  return (
    <button
      type="button"
      title="Abrir em nova aba"
      aria-label="Abrir em nova aba"
      className="yarl__button"
      onClick={() =>
        window.open(currentSlide.src, '_blank', 'noopener,noreferrer')
      }
    >
      <ArrowTopRightOnSquareIcon className="h-6 w-6" />
    </button>
  );
}

export function ImageCarousel({ images, maxVisible = 5 }: ImageCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const visibleCount = Math.min(maxVisible, images.length);
  const maxStartIndex = Math.max(0, images.length - visibleCount);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex < maxStartIndex;
  const viewportWidth =
    visibleCount * ITEM_SIZE + (visibleCount - 1) * ITEM_GAP;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Imagens anteriores"
        disabled={!canGoPrev}
        onClick={() => setStartIndex((current) => Math.max(0, current - 1))}
        className="shrink-0 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      <div className="overflow-hidden" style={{ width: viewportWidth }}>
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            gap: ITEM_GAP,
            transform: `translateX(-${startIndex * (ITEM_SIZE + ITEM_GAP)}px)`,
          }}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="relative shrink-0 overflow-hidden rounded-lg bg-gray-100"
              style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={`${ITEM_SIZE}px`}
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Próximas imagens"
        disabled={!canGoNext}
        onClick={() =>
          setStartIndex((current) => Math.min(maxStartIndex, current + 1))
        }
        className="shrink-0 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>

      <Lightbox
        open={lightboxIndex !== null}
        index={lightboxIndex ?? 0}
        close={() => setLightboxIndex(null)}
        slides={images.map((image) => ({ src: image.src, alt: image.alt }))}
        plugins={[Counter]}
        counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
        toolbar={{
          buttons: [<OpenInNewTabButton key="open-new-tab" />, 'close'],
        }}
      />
    </div>
  );
}
