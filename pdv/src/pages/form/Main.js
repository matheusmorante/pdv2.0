import PaymentFields from "./PaymentFields";
import PersonalInfoFields from "./PersonalInfoFields";

const Form = () => {
    return (
        <form className="mx-[200px] p-4 shadow-md">
            <itemFields/>
            <div>
                <PaymentFields />
            </div>
            <PersonalInfoFields />
            <div>
                <label>Dia e periodo da entrega</label>
                <input type='date' />
                <input />
            </div>

        </form>
    )
}
export default Form;