import Item from "../../types/items.type";
import Footer from "./Footer";
import { ItemsSummary } from "../../types/items.type";
import Body from "./Body";

interface Props {
    items: Item[],
    summary: ItemsSummary,
}

const ItemsTable = ({ items, summary }: Props) => {


    return (
        <table className="break-words w-full [&_td]:border-2 [&_th]:border-2">
            <colgroup>
                <col className="w-[40%]" />
                <col className="w-[10%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[16%]" />
            </colgroup>
            <thead>
                <tr>
                    <th className="">Descrição do Produto/Serviço</th>
                    <th>Quant.</th>
                    <th>Preço Un.</th>
                    <th>Desconto Unitário</th>
                    <th>Valor Total</th>
                </tr>
            </thead>

            <Body items={items} />
            <Footer summary={summary} />
        </table >
    )
}

export default ItemsTable;