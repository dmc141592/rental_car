import { useEffect, useState } from 'react';

export const MOBILE_BREAKPOINT = 1024;

const read = () => ({
  w: window.innerWidth,
  h: window.innerHeight,
  isMobile: window.innerWidth < MOBILE_BREAKPOINT,
});

export function useViewport() {
  const [vp, setVp] = useState(read);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVp(read()));
    };
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return vp;
}
