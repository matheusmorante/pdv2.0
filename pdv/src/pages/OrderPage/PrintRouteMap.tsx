import Shipping from "../types/Shipping.type";
import { useEffect, useState } from "react";

interface Props {
    shipping: Shipping;
    customerAddress?: string;
    onReady?: () => void;
}

// Extract [lat, lng] pairs from routeGeoJSON (stored as LineString with [lng, lat] coords)
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
        // GeoJSON = [lng, lat], we need [lat, lng]
        return coords.map(([lng, lat]: number[]) => [lat, lng]);
    } catch {
        return [];
    }
};

// Sample an array to at most maxPoints elements (evenly spaced)
const samplePoints = (arr: any[], maxPoints: number) => {
    if (arr.length <= maxPoints) return arr;
    const step = arr.length / maxPoints;
    return Array.from({ length: maxPoints }, (_, i) => arr[Math.floor(i * step)]);
};

// Build a Google Maps static API URL (no API key — uses embed format that works reliably)
const buildGoogleMapsImgUrl = (
    destLatLng: [number, number],
    originLatLng?: [number, number]
): string => {
    // Use Google Maps embed as a snapshot target — actually use a tile-based fallback
    // We'll use the stable staticmap.openstreetmap.de with a generous timeout
    const [dLat, dLng] = destLatLng;
    let url = `https://staticmap.openstreetmap.de/staticmap.php?size=650x280&maptype=mapnik`;
    if (originLatLng) {
        url += `&markers=${originLatLng[0].toFixed(5)},${originLatLng[1].toFixed(5)},green-S`;
    }
    url += `&markers=${dLat.toFixed(5)},${dLng.toFixed(5)},red-D`;
    return url;
};

// Build static URL with the full route path
const buildStaticMapUrl = (
    points: [number, number][],
    originLatLng: [number, number] | null,
    destLatLng: [number, number]
): string => {
    const sampled = samplePoints(points, 70);
    const pathStr = sampled.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join('|');

    let url = `https://staticmap.openstreetmap.de/staticmap.php?size=650x280&maptype=mapnik`;
    if (pathStr) {
        url += `&path=color:0x2563EBCC|weight:4|${pathStr}`;
    }
    if (originLatLng) {
        url += `&markers=${originLatLng[0].toFixed(5)},${originLatLng[1].toFixed(5)},green-S`;
    }
    url += `&markers=${destLatLng[0].toFixed(5)},${destLatLng[1].toFixed(5)},red-D`;
    return url;
};

// Fallback: Google Maps Static (requires key in prod, but works without key for basic embed)
const buildFallbackUrl = (destLatLng: [number, number]): string => {
    const [lat, lng] = destLatLng;
    return `https://staticmap.openstreetmap.de/staticmap.php?size=650x280&center=${lat},${lng}&zoom=15&maptype=mapnik&markers=${lat},${lng},red-D`;
};

const PrintRouteMap = ({ shipping, customerAddress, onReady }: Props) => {
    const [primarySrc, setPrimarySrc] = useState<string>('');
    const [imgLoaded, setImgLoaded] = useState(false);
    const [primaryFailed, setPrimaryFailed] = useState(false);
    const [fallbackLoaded, setFallbackLoaded] = useState(false);
    const [fallbackFailed, setFallbackFailed] = useState(false);
    const [fallbackSrc, setFallbackSrc] = useState<string>('');
    const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');

    const isPickup = shipping.deliveryMethod === 'pickup';
    const hasRoute = !!shipping.routeGeoJSON;
    const hasDestination = !!shipping.destinationCoords;

    useEffect(() => {
        if (isPickup || (!hasRoute && !hasDestination)) {
            onReady?.();
            return;
        }

        // destinationCoords is [lng, lat] — convert to [lat, lng]
        const destLatLng: [number, number] | null = shipping.destinationCoords
            ? [shipping.destinationCoords[1], shipping.destinationCoords[0]]
            : null;

        if (!destLatLng) {
            onReady?.();
            return;
        }

        // Build Google Maps link for fallback display
        const [dLat, dLng] = destLatLng;
        setGoogleMapsUrl(`https://www.google.com/maps/search/?api=1&query=${dLat},${dLng}`);

        // Primary: full route map
        let primary: string;
        let fallback: string;

        if (hasRoute) {
            const points = extractLatLngs(shipping.routeGeoJSON);
            if (points.length >= 2) {
                primary = buildStaticMapUrl(points, points[0], destLatLng);
                fallback = buildGoogleMapsImgUrl(destLatLng, points[0]);
            } else {
                primary = buildFallbackUrl(destLatLng);
                fallback = buildGoogleMapsImgUrl(destLatLng);
            }
        } else {
            primary = buildFallbackUrl(destLatLng);
            fallback = buildGoogleMapsImgUrl(destLatLng);
        }

        setPrimarySrc(primary);
        setFallbackSrc(fallback);

        // Hard timeout: if neither image loads in 5s, call onReady anyway
        const timeout = setTimeout(() => {
            onReady?.();
        }, 5000);

        return () => clearTimeout(timeout);
    }, []);

    if (isPickup || (!hasRoute && !hasDestination)) return null;

    const distanceLabel = shipping.distance != null
        ? typeof shipping.distance === 'number' && shipping.distance > 100
            ? `${(shipping.distance / 1000).toFixed(1)} km`
            : `${Number(shipping.distance).toFixed(1)} km`
        : null;

    const allFailed = primaryFailed && fallbackFailed;

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

                {/* Loading indicator */}
                {!imgLoaded && !fallbackLoaded && !allFailed && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Carregando mapa...
                    </div>
                )}

                {/* Primary map image (with route) */}
                {primarySrc && !primaryFailed && (
                    <img
                        src={primarySrc}
                        alt="Mapa da rota de entrega"
                        className="w-full h-auto block"
                        style={{ display: imgLoaded ? 'block' : 'none' }}
                        onLoad={() => {
                            setImgLoaded(true);
                            setTimeout(() => onReady?.(), 200);
                        }}
                        onError={() => setPrimaryFailed(true)}
                    />
                )}

                {/* Fallback: simpler map (just destination pin) */}
                {primaryFailed && fallbackSrc && !fallbackFailed && (
                    <img
                        src={fallbackSrc}
                        alt="Mapa do destino"
                        className="w-full h-auto block"
                        style={{ display: fallbackLoaded ? 'block' : 'none' }}
                        onLoad={() => {
                            setFallbackLoaded(true);
                            setTimeout(() => onReady?.(), 200);
                        }}
                        onError={() => {
                            setFallbackFailed(true);
                            onReady?.();
                        }}
                    />
                )}

                {/* All failed: show address + Google Maps link */}
                {allFailed && (
                    <div className="w-full p-4 flex flex-col items-center justify-center gap-3 bg-slate-100 text-center" style={{ minHeight: '120px' }}>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            📍 {customerAddress || 'Endereço de entrega'}
                        </span>
                        {googleMapsUrl && (
                            <span className="text-[10px] text-slate-400 font-mono break-all">
                                {googleMapsUrl}
                            </span>
                        )}
                    </div>
                )}

                {/* Legend overlay */}
                {(imgLoaded || fallbackLoaded) && hasRoute && (
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
