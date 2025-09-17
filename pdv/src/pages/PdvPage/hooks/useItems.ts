import { useState } from "react";
import Item from "../../types/items.type";

const useItems = () => {
    const [items, setItems] = useState<Item[]>([
            {
                description: '',
                quantity: 1,
                unitPrice: 0,
                discount: 0,
                discountType: 'fixed',
            }
        ])
     

    return { items, setItems }
}

export default useItems;