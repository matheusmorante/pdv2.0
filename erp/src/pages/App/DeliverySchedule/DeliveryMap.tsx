import React, { useEffect, useRef, useMemo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Order from "@/pages/types/order.type";
import { getSettings } from '@/pages/utils/settingsService';
import { getNeighborhoodCoords } from '@/pages/utils/maps';

interface DeliveryMapProps {
    orders: Order[];
}

interface RoutePoint {
    id: string;
    lat: number;
    lng: number;
    order: Order;
    isAssistance: boolean;
    distance?: string;
    duration?: string;
}

export default function DeliveryMap({ orders }: DeliveryMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markers = useRef<maplibregl.Marker[]>([]);
    const settings = getSettings();
    const storeOrigin = settings.storeOriginCoords || [-49.16928, -25.35203]; // [lng, lat]

    const [routeInfo, setRouteInfo] = useState<Record<string, { distance: string, duration: string }>>({});

    const points = useMemo(() => {
        return orders.map(order => {
            const isAssistance = order.orderType === 'assistance';
            const fullAddress = order.customerData?.fullAddress;
            
            const neighborhood = fullAddress?.neighborhood || "";
            const city = fullAddress?.city || "";

            const coords = getNeighborhoodCoords(neighborhood, city);
            if (!coords) return null;

            // Simple jittering
            const seed = parseInt(order.id?.slice(-4) || "0", 16);
            const jitterLat = (seed % 100 - 50) * 0.0001;
            const jitterLng = (seed % 100 - 50) * 0.0001;

            return {
                id: order.id,
                lat: coords.lat + jitterLat,
                lng: coords.lng + jitterLng,
                order,
                isAssistance
            };
        }).filter(Boolean) as RoutePoint[];
    }, [orders]);

    // Fetch routing info from OSRM
    useEffect(() => {
        const fetchAllRoutes = async () => {
            const newInfo: Record<string, { distance: string, duration: string }> = {};
            
            // Fetch in chunks or sequentially to avoid rate limits if many orders
            for (const p of points) {
                try {
                    const url = `https://router.project-osrm.org/route/v1/driving/${storeOrigin[0]},${storeOrigin[1]};${p.lng},${p.lat}?overview=false`;
                    const res = await fetch(url);
                    const data = await res.json();
                    
                    if (data.routes && data.routes[0]) {
                        const route = data.routes[0];
                        newInfo[p.id] = {
                            distance: `${(route.distance / 1000).toFixed(1)} km`,
                            duration: `${Math.round(route.duration / 60)} min`
                        };
                    }
                } catch (e) {
                    console.warn(`Erro ao calcular rota para ${p.id}:`, e);
                }
            }
            setRouteInfo(newInfo);
        };

        if (points.length > 0) {
            fetchAllRoutes();
        }
    }, [points, storeOrigin]);

    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            center: [storeOrigin[0], storeOrigin[1]],
            zoom: 12,
            attributionControl: false
        });

        map.current.on('load', () => {
            if (!map.current) return;

            // Store Marker
            new maplibregl.Marker({ color: '#2563eb' })
                .setLngLat([storeOrigin[0], storeOrigin[1]])
                .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<div style="padding: 5px; font-weight: 900;">Loja Móveis Morante</div>'))
                .addTo(map.current);

            updateMarkers();
        });

        return () => {
            map.current?.remove();
        };
    }, [storeOrigin]);

    // Update markers when points or routeInfo change
    useEffect(() => {
        if (!map.current?.loaded()) return;
        updateMarkers();
    }, [points, routeInfo]);

    const updateMarkers = () => {
        if (!map.current) return;

        // Clear existing markers
        markers.current.forEach(m => m.remove());
        markers.current = [];

        points.forEach((p) => {
            const info = routeInfo[p.id];
            const color = p.isAssistance ? '#f59e0b' : '#3b82f6';
            
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.innerHTML = `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); color: white;">
                <i class="bi bi-${p.isAssistance ? 'tools' : 'truck'}"></i>
            </div>`;

            const gMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${storeOrigin[1]},${storeOrigin[0]}&destination=${p.lat},${p.lng}&travelmode=driving`;

            const popupHtml = `
                <div style="font-family: 'Inter', sans-serif; padding: 12px; min-width: 240px; border-radius: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="background: ${color}; color: white; padding: 3px 8px; border-radius: 6px; font-size: 8px; font-weight: 900; text-transform: uppercase; tracking: 0.1em;">
                            ${p.isAssistance ? 'Assistência' : 'Entrega'}
                        </span>
                        <span style="font-size: 10px; font-weight: 900; color: #94a3b8;">#${p.order.id?.slice(-5)}</span>
                    </div>
                    
                    <h4 style="margin: 0 0 4px; font-weight: 900; color: #1e293b; font-size: 14px;">${p.order.customerData?.fullName || 'Cliente'}</h4>
                    <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">
                        <i class="bi bi-geo-alt-fill" style="color: #ef4444; margin-right: 4px;"></i>
                        ${p.order.customerData?.fullAddress?.street}, ${p.order.customerData?.fullAddress?.number}
                    </p>
                    
                    ${info ? `
                        <div style="display: flex; gap: 12px; margin-top: 12px; padding: 8px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
                            <div>
                                <p style="margin: 0; font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase;">Distância</p>
                                <p style="margin: 0; font-size: 11px; font-weight: 900; color: #334155;">${info.distance}</p>
                            </div>
                            <div style="width: 1px; background: #e2e8f0;"></div>
                            <div>
                                <p style="margin: 0; font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase;">Tempo Est.</p>
                                <p style="margin: 0; font-size: 11px; font-weight: 900; color: #334155;">${info.duration}</p>
                            </div>
                        </div>
                    ` : `
                        <div style="margin-top: 12px; font-size: 10px; color: #94a3b8; font-style: italic;">Calculando rota...</div>
                    `}

                    <a href="${gMapsUrl}" target="_blank" style="display: block; width: 100%; margin-top: 12px; padding: 10px; background: #1e293b; color: white; border-radius: 12px; text-align: center; text-decoration: none; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s;">
                        Abrir no Google Maps
                    </a>
                </div>
            `;

            const m = new maplibregl.Marker({ element: el })
                .setLngLat([p.lng, p.lat])
                .setPopup(new maplibregl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(popupHtml))
                .addTo(map.current!);
            
            markers.current.push(m);
        });
    };

    return (
        <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl relative animate-fade-in">
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}
