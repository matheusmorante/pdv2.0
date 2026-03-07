import Shipping from "../../../types/Shipping.type";
import { useState } from "react";

const useShipping = () => {
    const [shipping, setShipping] =
        useState<Shipping>(
            {
                value: 0,
                deliveryMethod: 'delivery',
                orderType: 'Entrega com montagem no local',
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