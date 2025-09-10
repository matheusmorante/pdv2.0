const PritableWarrantyTerm = () => {
    return (
        <div>
            <h2>TERMO DE GARANTIA</h2>

            <p><strong>Cliente:</strong> </p>
            <p><strong>Endereço:</strong> </p>
            <p><strong>Telefone:</strong></p>
            <p><strong>Produto(s):</strong> </p>
            <p><strong>Data da Compra:</strong></p>

            <p><strong>Garantia:</strong></p>
            <p>
                A loja garante o(s) produto(s) acima contra defeitos de fabricação pelo período de 3 meses (90 dias) a partir da data da compra.
                A garantia cobre apenas problemas decorrentes de fabricação, não sendo válida para:
            </p>
            <ul>
                <li>Uso indevido ou manutenção inadequada;</li>
                <li>Danos causados por acidentes, quedas ou transporte;</li>
                <li>Alterações ou reparos feitos por terceiros.</li>
            </ul>

            <p><strong>Procedimento em caso de defeito:</strong></p>
            <p>
                O cliente deve apresentar o produto com a nota fiscal e este termo à loja.
                A loja se compromete a reparar, substituir ou devolver o valor do produto conforme avaliação do defeito.
            </p>

            <p><strong>Declaração:</strong></p>
            <p>
                Declaro que recebi as informações sobre o produto e os termos de garantia.
            </p>

            <div className="assinaturas">
                <div className="assinatura">
                    _________________________
                    Cliente
                </div>
                <div className="assinatura">
                    _________________________
                    Vendedor / Loja
                </div>
            </div>
        </div>

    )
};

export default PritableWarrantyTerm;