import React from 'react';
import { LabelConfig } from './Index';
import LabelItem from './LabelItem';

interface Props {
    config: LabelConfig;
    image: string | null;
    cellImages?: Record<number, string>;
    onCellClick?: (index: number) => void;
}

const LabelGrid: React.FC<Props> = ({ config, image, cellImages = {}, onCellClick }) => {
    const isRound = config.type === 'round';
    
    // Total items based on layout
    // Round: 4 columns x 6 rows = 24
    // Rect: 3 columns x 7 rows = 21 (as requested "3x7")
    const count = isRound ? 24 : 21;
    const columns = isRound ? 4 : 3;
    
    // Style for the A4 sheet
    const sheetStyle: React.CSSProperties = {
        width: '210mm',
        height: '297mm',
        backgroundColor: 'white',
        margin: '0 auto',
        padding: isRound ? '18mm 10mm' : '15mm 10mm', // Adjusted margins for 3x7
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: isRound ? '40mm' : '38.1mm', // Adjusted height for 7 rows (297-30)/7=38.1
        rowGap: isRound ? '4mm' : '0mm', // 3x7 sheets often have no gap or very small
        columnGap: isRound ? '4mm' : '4mm',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    return (
        <div style={sheetStyle} className="label-sheet">
            {Array.from({ length: count }).map((_, i) => (
                <div 
                    key={i} 
                    onClick={() => onCellClick?.(i)}
                    className={`flex items-center justify-center overflow-hidden transition-all ${config.preset === 'custom' ? 'cursor-pointer hover:bg-blue-50/50 group' : ''}`} 
                    style={{ width: '100%', height: '100%', position: 'relative' }}
                >
                    <LabelItem 
                        config={config} 
                        image={cellImages[i] || image} 
                        index={i} 
                    />
                    {config.preset === 'custom' && !cellImages[i] && !image && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="bi bi-plus-circle text-blue-500 text-xl" />
                        </div>
                    )}
                </div>
            ))}
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    header, nav, footer, aside, .lg\\:col-span-4, .lg\\:col-span-8 > div:not(.bg-white) {
                        display: none !important;
                    }
                    #root > div:not(.print-only) {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        height: 297mm;
                    }
                    .label-sheet {
                        box-shadow: none !important;
                        border: none !important;
                        page-break-after: always;
                    }
                }
                .print-only {
                    display: none;
                }
            `}} />
        </div>
    );
};

export default LabelGrid;
