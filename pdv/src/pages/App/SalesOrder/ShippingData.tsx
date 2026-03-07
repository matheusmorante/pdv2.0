import React from "react";
import Shipping from "../../types/Shipping.type";
import CustomerData from "../../types/customerData.type";
import { getShippingRouteUrl, autoCalculateRouteDistance } from "../../utils/maps";
import { ValidationErrors } from "../../utils/validations";
import { getSettings } from "../../utils/settingsService";
import { toast } from "react-toastify";
import FreteDistancia from "./ShippingComponents/FreteDistancia";
import Agendamento from "./ShippingComponents/Agendamento";
import MapRoute from "./ShippingComponents/MapRoute";

interface Props {
    shipping: Shipping;
    setShipping: React.Dispatch<React.SetStateAction<Shipping>>;
    customerData: CustomerData;
    isCalculatingDistance?: boolean;
    onAutoCalculateDistance?: () => void;
    errors: ValidationErrors;
}

const ShippingData = ({ shipping, setShipping, customerData, isCalculatingDistance, onAutoCalculateDistance, errors }: Props) => {
    const route = getShippingRouteUrl(customerData.fullAddress);
    const settings = getSettings();

    const onChangeShippingValue = (newValue: number) => {
        setShipping((prev: Shipping) => ({ ...prev, value: newValue }));
    };

    const onChangeDistance = (newValue: string) => {
        const numValue = parseFloat(newValue.replace(',', '.'));
        setShipping((prev: Shipping) => {
            const distance = isNaN(numValue) ? undefined : numValue;
            let value = prev.value;

            // Auto-calculate freight if distance is valid and rate is configured
            if (distance !== undefined && settings.freightPerKm > 0) {
                value = distance * settings.freightPerKm;
            }

            return { ...prev, distance, value };
        });
    };

    const onChangeScheduling = (
        key: keyof Shipping["scheduling"],
        value: string | Date
    ) => {
        setShipping((prev: Shipping) => {
            const newScheduling = { ...prev.scheduling, [key]: value };

            if (newScheduling.type === 'fixed') {
                newScheduling.time = newScheduling.startTime || '';
            } else {
                newScheduling.time = `${newScheduling.startTime || ''} às ${newScheduling.endTime || ''}`;
            }

            return {
                ...prev,
                scheduling: newScheduling as Shipping["scheduling"],
            };
        });
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col xl:flex-row gap-8 w-full">
                <FreteDistancia
                    value={shipping.value}
                    distance={shipping.distance}
                    routeUrl={route}
                    onChangeValue={onChangeShippingValue}
                    onChangeDistance={onChangeDistance}
                    onAutoCalculateDistance={onAutoCalculateDistance}
                    autoCalculateValue={shipping.autoCalculateValue}
                    onToggleAutoCalculate={() => setShipping(prev => ({ ...prev, autoCalculateValue: !prev.autoCalculateValue }))}
                    isCalculatingDistance={isCalculatingDistance}
                    errors={errors}
                />
                <Agendamento
                    scheduling={shipping.scheduling}
                    onChangeScheduling={onChangeScheduling}
                    errors={errors}
                />
            </div>

            {shipping.destinationCoords && (
                <div className="w-full flex flex-col gap-2 relative group -mt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Rota de Entrega</label>
                    <MapRoute
                        destinationCoords={shipping.destinationCoords}
                        routeGeoJSON={shipping.routeGeoJSON}
                        className="h-80 w-full animate-slide-up"
                    />
                </div>
            )}
        </div>
    );
};

export default ShippingData;