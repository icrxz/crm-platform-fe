'use client';
import { Attachment } from '@/app/types/attachments';
import Image from 'next/image';
import Carousel from 'react-multi-carousel';

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

interface ImageCarrouselProps {
  images?: Attachment[];
}

export function ImageCarrousel({ images }: ImageCarrouselProps) {
  if (!images || images.length === 0) {
    console.log('No images to display');
    return null;
  }

  return (
    <div className='flex'>
      <Carousel responsive={responsive}>
        {images?.map(image => (
          <Image
            key={image.attachment_id}
            src={image.url}
            alt={image.file_name}
            width={200}
            height={200}
          />
        ))}
      </Carousel>
    </div>
  );
}
