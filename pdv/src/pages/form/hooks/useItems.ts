import { useState } from "react";
import Item from "../../types/items.type";

const useItems = () => {
    const [items, setItems] = useState<Item[]>([
            {
                description: '',
                quantity: 1,
                unitPrice: 0,
                fixedDiscount: 0,
                percentDiscount: 0,
            }
        ])
     

    return { items, setItems }
}

export default useItems;