interface props {
    seller: string;
    setSeller: React.Dispatch<React.SetStateAction<string>>
}

const Seller = ({ seller, setSeller }: props) => {
    return (
        <div className="[&_input]:border-b-2 focus:[&_input]:border-blue-400
         [&_input]:border-gray-300">
            <label>Vendedor</label>
            <input
                className="text-right pr-2"
                value={seller}
                onChange={
                    (e: React.ChangeEvent<HTMLInputElement>) =>
                        setSeller(e.target.value)
                }
            />
        </div>
    )
}
export default Seller;