import Item from "../../types/items.type"

export const calcItemsTotalValue = (items: Item[]) => {
    return items.reduce((acc, item) => {
        return acc + calcItemTotalValue(item)
    }, 0)


}

export const calcItemTotalValue = (item: Item) => {
    return (item.unitPrice - item.fixedDiscount) * item.quantity
}
