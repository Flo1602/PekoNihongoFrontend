import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < breakpoint;
    });

    useEffect(() => {
        function onResize() {
            setIsMobile(window.innerWidth < breakpoint);
        }

        window.addEventListener('resize', onResize);

        onResize();

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, [breakpoint]);

    return isMobile;
}
