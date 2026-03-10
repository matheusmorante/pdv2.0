import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../../utils/supabaseConfig';
import { getSettings } from '../../utils/settingsService';
import Order from '../../types/order.type';
import { dateNow } from '../../utils/formatters';

const OrderRouteMap = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const settings = getSettings();
    const origin: [number, number] = settings.storeOriginCoords;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // Fetch scheduled orders from today onwards
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('status', 'scheduled')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setOrders(data);
            } catch (err) {
                console.error("Erro ao buscar pedidos para o mapa:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        if (!mapContainer.current || loading) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: origin,
            zoom: 12,
            attributionControl: false
        });

        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

        map.on('load', () => {
            // Store marker (red)
            const storeEl = document.createElement('div');
            storeEl.innerHTML = `<svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#dc2626"/>
                 <circle cx="16" cy="16" r="6" fill="white"/>
             </svg>`;
            new maplibregl.Marker({ element: storeEl, anchor: 'bottom' })
                .setLngLat(origin)
                .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<strong>Nossa Loja</strong>'))
                .addTo(map);

            const bounds = new maplibregl.LngLatBounds();
            bounds.extend(origin);

            orders.forEach((order, index) => {
                if (order.shipping?.destinationCoords) {
                    const coords = order.shipping.destinationCoords as [number, number];
                    bounds.extend(coords);

                    // Order marker (blue)
                    const markerEl = document.createElement('div');
                    markerEl.innerHTML = `<svg width="24" height="34" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#2563eb"/>
                        <text x="16" y="22" font-size="12" fill="white" font-weight="bold" text-anchor="middle">${index + 1}</text>
                    </svg>`;
                    markerEl.style.cursor = 'pointer';

                    new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
                        .setLngLat(coords)
                        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
                            <div className="p-2">
                                <p className="font-black text-xs uppercase tracking-widest text-slate-400 mb-1">Pedido #${order.id?.slice(0, 8)}</p>
                                <p className="font-bold text-slate-800">${order.customerData?.fullName || 'Cliente'}</p>
                                <p className="text-[10px] text-slate-500 mt-1">${order.shipping?.deliveryAddress?.street}, ${order.shipping?.deliveryAddress?.number}</p>
                            </div>
                        `))
                        .addTo(map);

                    // Add route line if exists
                    if (order.shipping?.routeGeoJSON) {
                        const sourceId = `route-${order.id}`;
                        map.addSource(sourceId, {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                properties: {},
                                geometry: order.shipping.routeGeoJSON
                            }
                        });

                        map.addLayer({
                            id: `layer-${sourceId}`,
                            type: 'line',
                            source: sourceId,
                            layout: { 'line-join': 'round', 'line-cap': 'round' },
                            paint: {
                                'line-color': '#3b82f6',
                                'line-width': 3,
                                'line-opacity': 0.4
                            }
                        });
                    }
                }
            });

            if (orders.length > 0) {
                map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
            }
        });

        return () => {
            if (mapRef.current) mapRef.current.remove();
        };
    }, [orders, origin, loading]);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Mapa de Rotas</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Visualização logística de pedidos agendados</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando mapa e pedidos...</p>
                        </div>
                    </div>
                )}
                <div ref={mapContainer} className="w-full h-full" />
            </div>
        </div>
    );
};

export default OrderRouteMap;
