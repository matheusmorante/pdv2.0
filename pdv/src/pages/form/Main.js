import Items from "./Items";
import Payments from "./Payments";
import PersonalInfos from "./PersonalInfos";

const Form = () => {
    return (
        <form className="mx-[200px] p-4 shadow-md">
            <Items />
            <div>
                <Payments />
            </div>
            <PersonalInfos />
            <div>
                <label>Dia e periodo da entrega</label>
                <input type='date' />
                <input />
            </div>
            <div>
                <label>Observações</label>
                <input className="w-full min-h-[100px] border border-red-700" />
            </div>
        </form>
    )
}
export default Form;