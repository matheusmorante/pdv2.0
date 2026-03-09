import { useEffect, useRef } from "react";
import Shipping from "../types/Shipping.type";

interface Props {
    shipping: Shipping;
    customerAddress?: string;
}

// Decode GeoJSON LineString coordinates to polyline points
const getRoutePoints = (routeGeoJSON: any): [number, number][] => {
    try {
        if (!routeGeoJSON) return [];
        // routeGeoJSON can be the full geometry object or FeatureCollection
        let coords: [number, number][] = [];
        if (routeGeoJSON.type === "LineString") {
            coords = routeGeoJSON.coordinates;
        } else if (routeGeoJSON.type === "Feature") {
            coords = routeGeoJSON.geometry?.coordinates || [];
        } else if (routeGeoJSON.type === "FeatureCollection") {
            const feature = routeGeoJSON.features?.[0];
            coords = feature?.geometry?.coordinates || [];
        }
        // GeoJSON is [lng, lat]; map to [lat, lng] for most map APIs
        return coords.map(([lng, lat]) => [lat, lng]);
    } catch {
        return [];
    }
};

// Encode [lat, lng] pairs to encoded polyline format (Google Polyline Encoding)
const encodePolyline = (points: [number, number][]): string => {
    let result = '';
    let prevLat = 0, prevLng = 0;

    const encodeValue = (value: number) => {
        let v = Math.round(value * 1e5);
        v = v < 0 ? ~(v << 1) : v << 1;
        let str = '';
        while (v >= 0x20) {
            str += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
            v >>= 5;
        }
        str += String.fromCharCode(v + 63);
        return str;
    };

    for (const [lat, lng] of points) {
        result += encodeValue(lat - prevLat);
        result += encodeValue(lng - prevLng);
        prevLat = lat;
        prevLng = lng;
    }
    return result;
};

const PrintRouteMap = ({ shipping, customerAddress }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hasRoute = !!shipping.routeGeoJSON;
    const hasDestination = !!shipping.destinationCoords;

    // Build static map URL using OpenStreetMap Static API (staticmap.net - free, no key)
    const buildMapUrl = () => {
        const width = 600;
        const height = 300;
        const baseUrl = "https://staticmap.openstreetmap.de/staticmap.php";

        if (hasRoute) {
            const points = getRoutePoints(shipping.routeGeoJSON);
            if (points.length >= 2) {
                // Use markings for start and end
                const start = points[0];
                const end = points[points.length - 1];
                // Build path string for polyline
                const pathStr = points.map(([lat, lng]) => `${lat},${lng}`).join('|');
                const encoded = encodePolyline(points);
                // staticmap.openstreetmap.de supports polylines via &path= or encoded
                return (
                    `${baseUrl}?` +
                    `center=${start[0]},${start[1]}&` +
                    `zoom=13&` +
                    `size=${width}x${height}&` +
                    `path=color:0x0066ffcc|weight:4|${pathStr}&` +
                    `markers=${start[0]},${start[1]},green-S&` +
                    `markers=${end[0]},${end[1]},red-D`
                );
            }
        }

        if (hasDestination) {
            const [lng, lat] = shipping.destinationCoords!;
            return (
                `${baseUrl}?` +
                `center=${lat},${lng}&` +
                `zoom=15&` +
                `size=${width}x${height}&` +
                `markers=${lat},${lng},red-D`
            );
        }

        return null;
    };

    // Fallback approach: draw route using canvas with OSM tiles
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !hasRoute) return;

        const points = getRoutePoints(shipping.routeGeoJSON);
        if (points.length < 2) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;

        // Calculate bounds
        const lats = points.map(p => p[0]);
        const lngs = points.map(p => p[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const padFactor = 0.15;
        const latRange = (maxLat - minLat) * (1 + padFactor);
        const lngRange = (maxLng - minLng) * (1 + padFactor);
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        const latMin = centerLat - latRange / 2;
        const lngMin = centerLng - lngRange / 2;

        const toPixel = ([lat, lng]: [number, number]): [number, number] => {
            const x = ((lng - lngMin) / lngRange) * W;
            const y = ((latMin + latRange - lat) / latRange) * H;
            return [x, y];
        };

        // Draw background
        ctx.fillStyle = "#e8f0f7";
        ctx.fillRect(0, 0, W, H);

        // Draw border
        ctx.strokeStyle = "#b0c4de";
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, W - 2, H - 2);

        // Draw route line
        ctx.beginPath();
        ctx.strokeStyle = "#2563EB";
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        const [startX, startY] = toPixel(points[0]);
        ctx.moveTo(startX, startY);
        for (let i = 1; i < points.length; i++) {
            const [px, py] = toPixel(points[i]);
            ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw dashed shadow beneath route
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 6;
        ctx.setLineDash([]);
        ctx.moveTo(startX, startY + 2);
        for (let i = 1; i < points.length; i++) {
            const [px, py] = toPixel(points[i]);
            ctx.lineTo(px, py + 2);
        }
        ctx.stroke();

        // Draw route again on top of shadow
        ctx.beginPath();
        ctx.strokeStyle = "#2563EB";
        ctx.lineWidth = 4;
        ctx.moveTo(startX, startY);
        for (let i = 1; i < points.length; i++) {
            const [px, py] = toPixel(points[i]);
            ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Start marker (green circle with S)
        const [sx, sy] = toPixel(points[0]);
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#22C55E";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("S", sx, sy);

        // End marker (red drop pin)
        const [ex, ey] = toPixel(points[points.length - 1]);
        ctx.beginPath();
        ctx.arc(ex, ey, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#EF4444";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("D", ex, ey);

    }, [shipping.routeGeoJSON, hasRoute]);

    const isPickup = shipping.deliveryMethod === 'pickup';

    if (isPickup) return null;

    if (!hasRoute && !hasDestination) {
        // No coordinates available — show placeholder
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
                    <span className="text-slate-300">
                        — {(shipping.distance / 1000).toFixed(1)} km
                    </span>
                )}
            </h2>

            {hasRoute ? (
                <div className="relative w-full rounded-xl overflow-hidden border border-slate-200">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={240}
                        className="w-full h-auto block"
                        style={{ imageRendering: "crisp-edges" }}
                    />
                    <div className="absolute bottom-2 left-2 flex gap-3">
                        <span className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-green-600 shadow">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Origem (Loja)
                        </span>
                        <span className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-red-600 shadow">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                            Destino (Cliente)
                        </span>
                    </div>
                </div>
            ) : (
                // Fallback: destination only, use static img from OpenStreetMap
                <div className="w-full rounded-xl overflow-hidden border border-slate-200">
                    {(() => {
                        const [lng, lat] = shipping.destinationCoords!;
                        const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x240&markers=${lat},${lng},red-D`;
                        return (
                            <img
                                src={mapUrl}
                                alt="Mapa do destino"
                                className="w-full h-auto block"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        );
                    })()}
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
