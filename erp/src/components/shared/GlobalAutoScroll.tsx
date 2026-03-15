import { useEffect, useRef } from 'react';
import { getSettings } from '@/pages/utils/settingsService';
import { getUserSettings } from '../../pages/utils/userSettingsService';
import { useAuth } from '../../context/AuthContext';

const GlobalAutoScroll = () => {
    const animationFrameId = useRef<number | null>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const activeContainer = useRef<HTMLElement | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const appSettings = getSettings();
        const userSettings = getUserSettings(user?.id);

        // Use user settings instead of app settings
        const speed = userSettings.autoScroll?.speed || appSettings.autoScroll?.speed || 20;
        const threshold = appSettings.autoScroll?.threshold || 100;
        const enabled = userSettings.autoScroll?.enabled ?? true;

        if (!enabled) return;

        const isScrollable = (ele: HTMLElement) => {
            if (ele === document.body || ele === document.documentElement) return false;
            
            const hasScrollableContent = ele.scrollHeight > ele.clientHeight || ele.scrollWidth > ele.clientWidth;
            if (!hasScrollableContent) return false;

            const style = window.getComputedStyle(ele);
            return ['auto', 'scroll', 'overlay'].includes(style.overflowY) || 
                   ['auto', 'scroll', 'overlay'].includes(style.overflowX);
        };

        const getScrollableParent = (ele: HTMLElement | null): HTMLElement | null => {
            let current = ele;
            while (current && current !== document.body && current !== document.documentElement) {
                if (isScrollable(current)) {
                    return current;
                }
                current = current.parentElement;
            }
            return null;
        };

        const startScrolling = () => {
            if (!activeContainer.current) {
                animationFrameId.current = null;
                return;
            }

            const container = activeContainer.current;
            const rect = container.getBoundingClientRect();
            const { x, y } = mousePos.current;

            let scrollX = 0;
            let scrollY = 0;

            const style = window.getComputedStyle(container);
            const canScrollY = ['auto', 'scroll', 'overlay'].includes(style.overflowY);
            const canScrollX = ['auto', 'scroll', 'overlay'].includes(style.overflowX);

            // Add an inner threshold buffer to avoid scrolling when mouse is outside the element entirely
            // Since hover means the mouse is ON the element, technically x/y are within rect, 
            // but just to be sure we check if mouse is inside the scrollable area
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                animationFrameId.current = null;
                return;
            }

            if (canScrollX) {
                if (x < rect.left + threshold) {
                    const ratio = Math.max(0, (rect.left + threshold - x) / threshold);
                    scrollX = -speed * Math.pow(ratio, 1.5);
                } else if (x > rect.right - threshold) {
                    const ratio = Math.max(0, (x - (rect.right - threshold)) / threshold);
                    scrollX = speed * Math.pow(ratio, 1.5);
                }
            }

            if (canScrollY) {
                if (y < rect.top + threshold) {
                    const ratio = Math.max(0, (rect.top + threshold - y) / threshold);
                    scrollY = -speed * Math.pow(ratio, 1.5);
                } else if (y > rect.bottom - threshold) {
                    const ratio = Math.max(0, (y - (rect.bottom - threshold)) / threshold);
                    scrollY = speed * Math.pow(ratio, 1.5);
                }
            }

            if (scrollX !== 0 || scrollY !== 0) {
                container.scrollLeft += scrollX;
                container.scrollTop += scrollY;
                animationFrameId.current = requestAnimationFrame(startScrolling);
            } else {
                animationFrameId.current = null;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            
            // Check if we are hovering a new scrollable element
            const target = e.target as HTMLElement;
            const scrollableParent = getScrollableParent(target);

            // Change active container
            if (activeContainer.current !== scrollableParent) {
                activeContainer.current = scrollableParent;
            }

            // Start loop if not running and we are inside a scrollable container
            if (activeContainer.current && animationFrameId.current === null) {
                animationFrameId.current = requestAnimationFrame(startScrolling);
            }
        };

        const handleMouseLeave = () => {
            activeContainer.current = null;
            if (animationFrameId.current !== null) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };

        // Needs to capture to ensure it runs even if propagation is stopped
        document.addEventListener('mousemove', handleMouseMove, { passive: true, capture: true });
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove, { capture: true });
            document.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameId.current !== null) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    return null;
};

export default GlobalAutoScroll;
