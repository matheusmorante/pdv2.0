import Shipping from "../types/Shipping.type";
import { useEffect, useState } from "react";

interface Props {
    shipping: Shipping;
    customerAddress?: string;
    onReady?: () => void;
}

// Sample an array to at most maxPoints elements (evenly spaced)
const samplePoints = (arr: any[], maxPoints: number) => {
    if (arr.length <= maxPoints) return arr;
    const step = arr.length / maxPoints;
    return Array.from({ length: maxPoints }, (_, i) => arr[Math.floor(i * step)]);
};

// Extract [lat, lng] pairs from the routeGeoJSON (stored as LineString with [lng, lat] coords)
const extractLatLngs = (routeGeoJSON: any): [number, number][] => {
    try {
        let coords: [number, number][] = [];
        if (routeGeoJSON?.type === "LineString") {
            coords = routeGeoJSON.coordinates;
        } else if (routeGeoJSON?.type === "Feature") {
            coords = routeGeoJSON.geometry?.coordinates || [];
        } else if (routeGeoJSON?.type === "FeatureCollection") {
            coords = routeGeoJSON.features?.[0]?.geometry?.coordinates || [];
        }
        // GeoJSON = [lng, lat], staticmap wants lat,lng
        return coords.map(([lng, lat]: number[]) => [lat, lng]);
    } catch {
        return [];
    }
};

// Build static map URL using staticmap.openstreetmap.de
// Docs: https://staticmap.openstreetmap.de/staticmap.php
const buildStaticMapUrl = (
    points: [number, number][],
    originLatLng: [number, number] | null,
    destLatLng: [number, number]
) => {
    const w = 600;
    const h = 260;

    // Sample for URL length — keep at most 80 points
    const sampled = samplePoints(points, 80);

    // Build path string: lat,lng|lat,lng|...
    const pathStr = sampled.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join('|');

    const params = new URLSearchParams({
        size: `${w}x${h}`,
        maptype: 'mapnik',
    });

    // Build full URL manually (URLSearchParams encodes | and : which breaks this API)
    let url = `https://staticmap.openstreetmap.de/staticmap.php?size=${w}x${h}`;

    if (pathStr) {
        url += `&path=color:0x2563EBCC|weight:4|${pathStr}`;
    }

    // Markers
    if (originLatLng) {
        url += `&markers=${originLatLng[0].toFixed(5)},${originLatLng[1].toFixed(5)},green-S`;
    }
    url += `&markers=${destLatLng[0].toFixed(5)},${destLatLng[1].toFixed(5)},red-D`;

    return url;
};

const PrintRouteMap = ({ shipping, customerAddress, onReady }: Props) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);

    const isPickup = shipping.deliveryMethod === 'pickup';
    const hasRoute = !!shipping.routeGeoJSON;
    const hasDestination = !!shipping.destinationCoords;

    useEffect(() => {
        if (isPickup) {
            onReady?.();
            return;
        }

        if (!hasRoute && !hasDestination) {
            onReady?.();
            return;
        }

        // Build the static map URL
        const destLatLng: [number, number] | null = shipping.destinationCoords
            ? [shipping.destinationCoords[1], shipping.destinationCoords[0]] // [lng,lat] -> [lat,lng]
            : null;

        if (!destLatLng) {
            onReady?.();
            return;
        }

        let url: string;

        if (hasRoute) {
            const points = extractLatLngs(shipping.routeGeoJSON);
            if (points.length >= 2) {
                const originLatLng = points[0];
                url = buildStaticMapUrl(points, originLatLng, destLatLng);
            } else {
                // Fallback: just show destination pin
                url = `https://staticmap.openstreetmap.de/staticmap.php?size=600x260&markers=${destLatLng[0]},${destLatLng[1]},red-D`;
            }
        } else {
            // No route, just show destination
            url = `https://staticmap.openstreetmap.de/staticmap.php?size=600x260&markers=${destLatLng[0]},${destLatLng[1]},red-D`;
        }

        setImgSrc(url);

        // Fallback: forcefully trigger onReady if the image takes more than 3.5 seconds
        const timer = setTimeout(() => {
            setImgError(prev => {
                if (!prev) onReady?.();
                return true; // Force error state so we don't stay "loading"
            });
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    if (isPickup) return null;

    if (!hasRoute && !hasDestination) return null;

    const distanceLabel = shipping.distance != null
        ? typeof shipping.distance === 'number' && shipping.distance > 100
            ? `${(shipping.distance / 1000).toFixed(1)} km`
            : `${Number(shipping.distance).toFixed(1)} km`
        : null;

    return (
        <section className="mt-4 w-full print:block">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                🗺 Mapa da Rota de Entrega
                {distanceLabel && (
                    <span className="text-slate-400 font-medium normal-case tracking-normal text-[10px]">
                        — {distanceLabel}
                    </span>
                )}
            </h2>

            <div className="relative w-full rounded-xl overflow-hidden border border-slate-200"
                style={{ minHeight: '120px', background: '#f0f4f8' }}>

                {/* Loading state */}
                {imgSrc && !imgLoaded && !imgError && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Carregando mapa...
                    </div>
                )}

                {/* Map image */}
                {imgSrc && (
                    <img
                        src={imgSrc}
                        alt="Mapa da rota de entrega"
                        className="w-full h-auto block"
                        style={{ display: imgLoaded ? 'block' : 'none' }}
                        onLoad={() => {
                            setImgLoaded(true);
                            // Small delay before print to ensure image is painted
                            setTimeout(() => onReady?.(), 200);
                        }}
                        onError={() => {
                            setImgError(true);
                            onReady?.();
                        }}
                    />
                )}

                {/* Error fallback */}
                {imgError && (
                    <div className="w-full h-[100px] flex flex-col items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest gap-1 bg-slate-100">
                        <span>⚠</span>
                        <span>Não foi possível carregar o mapa</span>
                    </div>
                )}

                {/* Legend overlay */}
                {imgLoaded && hasRoute && (
                    <div className="absolute bottom-2 left-2 flex gap-3">
                        <span className="flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-green-700 shadow border border-green-100">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Origem
                        </span>
                        <span className="flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-red-600 shadow border border-red-100">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                            Destino
                        </span>
                    </div>
                )}
            </div>

            {customerAddress && (
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                    📍 {customerAddress}
                </p>
            )}
        </section>
    );
};

export default PrintRouteMap;
