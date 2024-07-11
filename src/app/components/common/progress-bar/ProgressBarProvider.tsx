'use client';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

const Providers = ({ children }: { children: React.ReactNode; }) => {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="rgb(59 130 246)"
        shallowRouting
        delay={50}
      />
    </>
  );
};

export default Providers;
