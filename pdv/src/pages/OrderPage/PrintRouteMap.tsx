import { useEffect, useRef, useState } from "react";
import Shipping from "../types/Shipping.type";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getSettings } from "../utils/settingsService";

interface Props {
    shipping: Shipping;
    customerAddress?: string;
    onReady?: () => void; // called when map snapshot is ready
}

const PrintRouteMap = ({ shipping, customerAddress, onReady }: Props) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapSnapshot, setMapSnapshot] = useState<string | null>(null);
    const [loadError, setLoadError] = useState(false);

    const isPickup = shipping.deliveryMethod === 'pickup';
    const hasRoute = !!shipping.routeGeoJSON;
    const hasDestination = !!shipping.destinationCoords;

    useEffect(() => {
        if (isPickup || (!hasRoute && !hasDestination)) {
            onReady?.();
            return;
        }

        const container = mapContainerRef.current;
        if (!container) return;

        const settings = getSettings();
        const origin: [number, number] = settings.storeOriginCoords || [-51.1537, -29.9609];
        const destination = shipping.destinationCoords || origin;

        let map: maplibregl.Map | null = null;

        try {
            map = new maplibregl.Map({
                container,
                style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
                center: destination,
                zoom: 12,
                attributionControl: false,
                preserveDrawingBuffer: true, // Required for canvas.toDataURL()
                interactive: false            // Static map for print
            });

            map.on('load', () => {
                if (!map) return;

                const currentMap = map;

                // Draw route if available
                if (hasRoute && shipping.routeGeoJSON?.coordinates?.length > 0) {
                    currentMap.addSource('route', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: shipping.routeGeoJSON
                        }
                    });

                    currentMap.addLayer({
                        id: 'route-line',
                        type: 'line',
                        source: 'route',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: { 'line-color': '#2563EB', 'line-width': 5, 'line-opacity': 0.9 }
                    });

                    // Fit bounds to route
                    const bounds = new maplibregl.LngLatBounds();
                    bounds.extend(origin);
                    bounds.extend(destination);
                    shipping.routeGeoJSON.coordinates.forEach((coord: [number, number]) => {
                        bounds.extend(coord);
                    });
                    currentMap.fitBounds(bounds, { padding: 40, maxZoom: 15, animate: false });
                } else {
                    // Just show origin and destination
                    const bounds = new maplibregl.LngLatBounds();
                    bounds.extend(origin);
                    bounds.extend(destination);
                    currentMap.fitBounds(bounds, { padding: 60, maxZoom: 15, animate: false });
                }

                // Store marker (green)
                const storeEl = document.createElement('div');
                storeEl.style.cssText = 'width:28px;height:28px;background:#22C55E;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;color:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
                storeEl.textContent = 'S';
                new maplibregl.Marker({ element: storeEl, anchor: 'center' })
                    .setLngLat(origin)
                    .addTo(currentMap);

                // Destination marker (red)
                const destEl = document.createElement('div');
                destEl.style.cssText = 'width:28px;height:28px;background:#EF4444;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;color:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
                destEl.textContent = 'D';
                new maplibregl.Marker({ element: destEl, anchor: 'center' })
                    .setLngLat(destination)
                    .addTo(currentMap);

                // Wait for idle (tiles loaded) then snapshot
                currentMap.once('idle', () => {
                    setTimeout(() => {
                        try {
                            const dataUrl = currentMap.getCanvas().toDataURL('image/png');
                            setMapSnapshot(dataUrl);
                            onReady?.();
                        } catch (e) {
                            console.error('Map snapshot failed:', e);
                            setLoadError(true);
                            onReady?.();
                        } finally {
                            currentMap.remove();
                        }
                    }, 200); // Small extra delay after idle
                });
            });

            map.on('error', () => {
                setLoadError(true);
                onReady?.();
            });

        } catch (e) {
            console.error('Map init failed:', e);
            setLoadError(true);
            onReady?.();
        }

        return () => {
            if (map) {
                try { map.remove(); } catch (_) { }
            }
        };
    }, []);

    if (isPickup) return null;

    if (!hasRoute && !hasDestination) {
        return (
            <section className="mt-4 w-full">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Mapa da Rota
                </h2>
                <div className="w-full h-[120px] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold tracking-widest uppercase">
                    Endereço sem coordenadas — rota não calculada
                </div>
            </section>
        );
    }

    return (
        <section className="mt-4 w-full">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <span>🗺</span> Mapa da Rota de Entrega
                {shipping.distance && (
                    <span className="text-slate-400 font-medium normal-case tracking-normal">
                        — {typeof shipping.distance === 'number'
                            ? (shipping.distance > 100 ? (shipping.distance / 1000).toFixed(1) + ' km' : shipping.distance.toFixed(1) + ' km')
                            : shipping.distance}
                    </span>
                )}
            </h2>

            {/* Hidden Map for rendering snapshot — hidden div */}
            {!mapSnapshot && !loadError && (
                <div
                    ref={mapContainerRef}
                    style={{ width: '600px', height: '240px', position: 'fixed', top: '-9999px', left: '-9999px', visibility: 'hidden' }}
                />
            )}

            {/* Snapshot Image — shown in print */}
            {mapSnapshot ? (
                <div className="relative w-full rounded-xl overflow-hidden border border-slate-200">
                    <img
                        src={mapSnapshot}
                        alt="Mapa da rota de entrega"
                        className="w-full h-auto block"
                        style={{ maxHeight: '240px', objectFit: 'cover' }}
                    />
                    <div className="absolute bottom-2 left-2 flex gap-3">
                        <span className="flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-green-600 shadow border border-green-100">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Origem (Loja)
                        </span>
                        <span className="flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-red-600 shadow border border-red-100">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                            Destino (Cliente)
                        </span>
                    </div>
                </div>
            ) : loadError ? (
                <div className="w-full h-[120px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs font-bold tracking-widest uppercase gap-2">
                    <span>⚠</span>
                    <span>Mapa não pôde ser carregado</span>
                </div>
            ) : (
                        <div className="w-full h-[120px] border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold gap-2 animate-pulse">
                            <span>Carregando mapa...</span>
                </div>
            )}

            {customerAddress && (
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                    📍 {customerAddress}
                </p>
            )}
        </section>
    );
};

export default PrintRouteMap;
