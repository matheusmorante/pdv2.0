import Shipping from "../../../types/Shipping.type";
import { useState } from "react";
import { getSettings } from "../../../utils/settingsService";

const useShipping = (initialDeliveryMethod: 'delivery' | 'pickup' = 'delivery') => {
    const settings = getSettings();
    const options = initialDeliveryMethod === 'delivery' ? settings.deliveryHandlingOptions : settings.pickupHandlingOptions;
    const defaultHandling = options.length > 0 ? options[0] : '';

    const [shipping, setShipping] =
        useState<Shipping>(
            {
                value: 0,
                deliveryMethod: initialDeliveryMethod,
                orderType: defaultHandling,
                scheduling: {
                    date: "",
                    time: "",
                    startTime: "",
                    endTime: "",
                    type: "range"
                },
                autoCalculateValue: false
            }
        );

    return { shipping, setShipping }
};

export default useShipping