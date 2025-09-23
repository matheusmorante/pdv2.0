import Shipping from "../../types/Shipping.type";
import { useState } from "react";

const useShipping = () => {
    const [shipping, setShipping] =
        useState<Shipping>(
            {
                value: 0,
                scheduling: {
                    date: "",
                    time: ""
                },
            }
        );

    return { shipping, setShipping }
};

export default useShipping