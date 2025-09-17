import { dateNow, stringifyFullAddress, stringifyItems } from './utils';

const WarrantyTermPage = () => {
    const storedOrder = sessionStorage.getItem('order');
    const order = storedOrder ? JSON.parse(storedOrder) : null;
    const date = dateNow();

    return (
        <div>
            <h1 className='text-center font-bold text-lg'>TERMO DE GARANTIA</h1>
            <br />
            <p><strong>Cliente: </strong>{order.customerData.fullName}</p>
            <p>
                <strong>Endereço: </strong>
                {
                    stringifyFullAddress(
                        order.customerData.fullAddress
                    )
                }
            </p>
            <p><strong>Telefone: </strong> {order.customerData.phone}</p>
            <p><strong>Produto(s): </strong>{stringifyItems(order.items)}</p>
            <p><strong>Data da Compra:</strong> {date}</p>
            <br />
            <p><strong>Garantia:</strong></p>
            <p>
                A loja garante o(s) produto(s) acima contra defeitos de fabricação pelo período de 3 meses (90 dias) a partir da data da compra.
                A garantia cobre apenas problemas decorrentes de fabricação, não sendo válida para:
            </p>
            <ul>
                <li>Uso indevido ou manutenção inadequada;</li>
                <li>Danos causados por acidentes, quedas, transporte, exposição a umidade, maresia, calor excessivo, produtos abrasivos entre outras situações;</li>
                <li>Alterações ou reparos feitos por terceiros.</li>
            </ul>
            <br />
            <p><strong>Procedimento em caso de defeito:</strong></p>
            <p>
                O cliente deve apresentar o(s) produto(s), o recibo ou nota fiscal e este termo de garantia à loja através de foto legível.
                A loja se compromete a reparar, substituir ou devolver o valor do produto conforme avaliação do defeito.
            </p>
            <br />
            <p><strong>Declaração:</strong></p>
            <p>
                Declaro que recebi as informações sobre o produto e os termos de garantia.
            </p>
    
            <div className="flex text-center gap-10 justify-center mt-10">
                <div className="assinatura">
                    <div>________________________________________________</div>
                    <div>Cliente </div>
                </div>
                <div className="">
                    <div> ________________________________________________</div>
                    <div>Vendedor / Loja</div>
                </div>
            </div>
        </div>

    )
};

export default WarrantyTermPage;