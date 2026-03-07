import { useRef, useEffect, useCallback } from 'react';

interface AutoScrollOptions {
    threshold?: number;
    maxSpeed?: number;
    direction?: 'horizontal' | 'vertical' | 'both';
    enabled?: boolean;
}

/**
 * useAutoScroll Hook
 * Enables automatic scrolling when the mouse is near the borders of a scrollable container.
 * 
 * @param containerRef Reference to the scrollable HTML element
 * @param options threshold (px from border), maxSpeed (px per frame), direction
 */
export const useAutoScroll = (
    containerRef: React.RefObject<HTMLElement | null>,
    options: AutoScrollOptions = {}
) => {
    const {
        threshold = 80,
        maxSpeed = 15,
        direction = 'both',
        enabled = true
    } = options;

    const animationFrameId = useRef<number | null>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const isInside = useRef(false);

    const startScrolling = useCallback(() => {
        if (!enabled || !isInside.current || !containerRef.current) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const { x, y } = mousePos.current;

        let scrollX = 0;
        let scrollY = 0;

        // Horizontal scrolling logic
        if (direction === 'horizontal' || direction === 'both') {
            if (x < rect.left + threshold) {
                // Near left border
                const ratio = Math.max(0, (rect.left + threshold - x) / threshold);
                scrollX = -maxSpeed * Math.pow(ratio, 1.5);
            } else if (x > rect.right - threshold) {
                // Near right border
                const ratio = Math.max(0, (x - (rect.right - threshold)) / threshold);
                scrollX = maxSpeed * Math.pow(ratio, 1.5);
            }
        }

        // Vertical scrolling logic
        if (direction === 'vertical' || direction === 'both') {
            if (y < rect.top + threshold) {
                // Near top border
                const ratio = Math.max(0, (rect.top + threshold - y) / threshold);
                scrollY = -maxSpeed * Math.pow(ratio, 1.5);
            } else if (y > rect.bottom - threshold) {
                // Near bottom border
                const ratio = Math.max(0, (y - (rect.bottom - threshold)) / threshold);
                scrollY = maxSpeed * Math.pow(ratio, 1.5);
            }
        }

        if (scrollX !== 0 || scrollY !== 0) {
            container.scrollLeft += scrollX;
            container.scrollTop += scrollY;
        }

        animationFrameId.current = requestAnimationFrame(startScrolling);
    }, [containerRef, threshold, maxSpeed, direction, enabled]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseEnter = () => {
            isInside.current = true;
            if (animationFrameId.current === null) {
                animationFrameId.current = requestAnimationFrame(startScrolling);
            }
        };

        const handleMouseLeave = () => {
            isInside.current = false;
            if (animationFrameId.current !== null) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameId.current !== null) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [containerRef, startScrolling]);
};
