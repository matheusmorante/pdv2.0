import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getSettings } from '../../../utils/settingsService';

interface MapRouteProps {
    destinationCoords: [number, number]; // [lng, lat]
    routeGeoJSON?: any;
    className?: string;
    onIdle?: () => void;
}

const MapRoute = ({ destinationCoords, routeGeoJSON, className = "", onIdle }: MapRouteProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const storeMarkerRef = useRef<maplibregl.Marker | null>(null);

    const settings = getSettings();
    const origin: [number, number] = settings.storeOriginCoords;

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: destinationCoords,
            zoom: 12,
            attributionControl: false
        });

        mapRef.current = map;

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

        map.on('load', () => {
            // Update origins from latest settings just in case
            const currentOrigin = getSettings().storeOriginCoords;

            // Store marker (red)
            const storeEl = document.createElement('div');
            storeEl.innerHTML = `<svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#dc2626"/>
                <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>`;
            storeEl.style.cursor = 'pointer';

            storeMarkerRef.current = new maplibregl.Marker({ element: storeEl, anchor: 'bottom' })
                .setLngLat(currentOrigin)
                .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<strong>Loja</strong>'))
                .addTo(map);

            // Destination marker (blue)
            const destEl = document.createElement('div');
            destEl.innerHTML = `<svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#2563eb"/>
                <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>`;
            destEl.style.cursor = 'pointer';
            new maplibregl.Marker({ element: destEl, anchor: 'bottom' })
                .setLngLat(destinationCoords)
                .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<strong>Cliente</strong>'))
                .addTo(map);

            // Draw route polyline if available
            if (routeGeoJSON && routeGeoJSON.coordinates && routeGeoJSON.coordinates.length > 0) {
                map.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: routeGeoJSON
                    }
                });

                map.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#3b82f6',
                        'line-width': 5,
                        'line-opacity': 0.8
                    }
                });

                // Fit map to show both markers and the route
                const bounds = new maplibregl.LngLatBounds();
                bounds.extend(currentOrigin);
                bounds.extend(destinationCoords);
                routeGeoJSON.coordinates.forEach((coord: [number, number]) => {
                    bounds.extend(coord);
                });
                map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
            } else {
                // No route, just fit the two markers
                const bounds = new maplibregl.LngLatBounds();
                bounds.extend(currentOrigin);
                bounds.extend(destinationCoords);
                map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
            }

            // Signal when map is idle (finished rendering)
            if (onIdle) {
                map.once('idle', () => {
                    // Small delay to ensure everything is really painted
                    setTimeout(onIdle, 500);
                });
            }
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinationCoords, routeGeoJSON, origin]); // Reacting to changes in origin (settings)

    return (
        <div className={`w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative z-0 ${className}`}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default MapRoute;
