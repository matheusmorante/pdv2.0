import PersonPage from "../Registrations/shared/PersonPage";

const Suppliers = () => (
    <PersonPage
        title="Fornecedores"
        subtitle="Gerencie seus fornecedores e parceiros comerciais"
        newLabel="Novo Fornecedor"
        newIcon="bi bi-truck"
        collectionName="suppliers"
        storageKey="suppliers_table"
    />
);

export default Suppliers;
