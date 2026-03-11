import PersonPage from "../Registrations/shared/PersonPage";

const Employees = () => (
    <PersonPage
        title="Funcionários"
        subtitle="Gerencie sua equipe e colaboradores"
        newLabel="Novo Funcionário"
        newIcon="bi bi-person-badge-fill"
        collectionName="employees"
        storageKey="employees_table"
    />
);

export default Employees;
