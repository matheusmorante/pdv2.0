import Items from "./itemsTable/Index";
import React, { useState } from "react";
import Payments from "./Payments";
import PersonalInfos from "./PersonalInfos";

export type Item = {
    description: string;
    quantity: number;
    price: number;
    discount: number;
    discountIsPercentage: boolean;
    itemTotalValue: number;
}

const Form = () => {
    const [items, setItems] = useState<Item[]>([
        {
            description: '',
            quantity: 1,
            price: 0,
            discount: 0,
            discountIsPercentage: false,
            itemTotalValue: 0
        }
    ]);
    const [freight, setFreight] = useState<number>(0);
    const [totalDiscount, setDiscount] = useState<number>(0);
    const [orderTotalValue, setOrderTotalValue] = useState<number>(0);

    return (
        <form className="w-[900px] mx-auto p-4 shadow-md">
            <Items
                items={items}
                setItems={setItems}
                orderTotalValue={orderTotalValue}
                setOrderTotalValue={setOrderTotalValue} 
                freight={freight}
                setFreight={setFreight}
            />
            <div>
                <Payments />
            </div>
            <PersonalInfos />
            <div>
                <label>Dia e periodo da entrega</label>
                <input type='date' />
                <input />
            </div>
            <div>
                <label>Observações</label>
                <input className="w-full min-h-[100px] border border-red-700" />
            </div>
        </form>
    )
}
export default Form;