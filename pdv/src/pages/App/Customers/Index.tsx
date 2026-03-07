import PersonPage from "../Registrations/shared/PersonPage";

const Customers = () => (
    <PersonPage
        title="Clientes"
        subtitle="Gerencie sua base de clientes e contatos"
        newLabel="Novo Cliente"
        newIcon="bi bi-person-plus-fill"
        collectionName="customers"
        storageKey="customers_table"
    />
);

export default Customers;
