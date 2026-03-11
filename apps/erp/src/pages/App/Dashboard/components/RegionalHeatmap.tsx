import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Order from '../../../types/order.type';
import { formatCurrency } from '../../../utils/formatters';

interface RegionalHeatmapProps {
    orders: Order[];
}

type MetricType = 'profit' | 'value' | 'count';

const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
    'GUARAITUBA': [-49.1725, -25.3614],
    'GUARANI': [-49.1750, -25.3650],
    'SÍTIO CERCADO': [-49.2559, -25.5390],
    'JARDIM AURORA': [-49.1800, -25.3550],
    'SÃO DIMAS': [-49.1911, -25.3475],
    'CENTRO': [-49.2242, -25.2917],
    'PALMITAL': [-49.1650, -25.3450],
    'SÃO BRAZ': [-49.3300, -25.4200],
    'MK BURQUES': [-49.1700, -25.3600],
    'DAS GRAÇAS': [-49.1850, -25.3500],
    'COLONIO FARIA': [-49.2100, -25.3200],
    'PLANTA GUARITUBA PEQUENA': [-49.1600, -25.3700],
    'COLOMBO': [-49.2242, -25.2917],
    'CURITIBA': [-49.2667, -25.4284]
};

const RegionalHeatmap = ({ orders }: RegionalHeatmapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [metric, setMetric] = useState<MetricType>('value');
    const markersRef = useRef<maplibregl.Marker[]>([]);

    const aggregatedData = useMemo(() => {
        const data: Record<string, { count: number; value: number; profit: number; coords: [number, number] }> = {};

        orders.forEach(order => {
            const neighborhood = (order.customerData?.fullAddress?.neighborhood || '').trim().toUpperCase();
            if (!neighborhood) return;

            const coords = NEIGHBORHOOD_COORDS[neighborhood] || NEIGHBORHOOD_COORDS['COLOMBO'];

            if (!data[neighborhood]) {
                data[neighborhood] = { count: 0, value: 0, profit: 0, coords };
            }

            data[neighborhood].count += 1;
            const orderValue = order.paymentsSummary?.totalOrderValue || 0;
            const orderCost = order.itemsSummary?.totalItemsCost || 0;
            data[neighborhood].value += orderValue;
            data[neighborhood].profit += (orderValue - orderCost);
        });

        return Object.entries(data).map(([name, stats]) => ({
            name,
            ...stats
        }));
    }, [orders]);

    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://demotiles.maplibre.org/style.json', // Basic style
            center: [-49.1725, -25.3614], // Default Colombo
            zoom: 11
        });

        map.current.addControl(new maplibregl.NavigationControl());

        return () => {
            map.current?.remove();
        };
    }, []);

    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        const maxValue = Math.max(...aggregatedData.map(d => d[metric]), 1);

        aggregatedData.forEach(d => {
            const val = d[metric];
            const size = Math.max(20, (val / maxValue) * 80);
            
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.borderRadius = '50%';
            el.style.backgroundColor = metric === 'profit' ? 'rgba(16, 185, 129, 0.6)' : metric === 'value' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(245, 158, 11, 0.6)';
            el.style.border = '2px solid white';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.color = 'white';
            el.style.fontSize = '10px';
            el.style.fontWeight = 'bold';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            el.innerHTML = metric === 'count' ? String(val) : '';

            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div style="padding: 8px; font-family: sans-serif;">
                    <strong style="display: block; margin-bottom: 4px; border-bottom: 1px solid #eee;">${d.name}</strong>
                    <div style="font-size: 11px; margin-top: 4px;">
                        <span>Pedidos: <strong>${d.count}</strong></span><br/>
                        <span>Vendas: <strong>${formatCurrency(d.value)}</strong></span><br/>
                        <span>Lucro: <strong>${formatCurrency(d.profit)}</strong></span>
                    </div>
                </div>`
            );

            const marker = new maplibregl.Marker(el)
                .setLngLat(d.coords)
                .setPopup(popup)
                .addTo(map.current!);

            markersRef.current.push(marker);
        });
    }, [aggregatedData, metric]);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">Vendas por Região</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Mapa de calor por bairro em Colombo/Curitiba</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setMetric('value')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${metric === 'value' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        Valor
                    </button>
                    <button 
                        onClick={() => setMetric('profit')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${metric === 'profit' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        Lucro
                    </button>
                    <button 
                        onClick={() => setMetric('count')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${metric === 'count' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        Pedidos
                    </button>
                </div>
            </div>
            <div ref={mapContainer} className="flex-1 w-full" />
        </div>
    );
};

export default RegionalHeatmap;
