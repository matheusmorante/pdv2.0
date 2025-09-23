interface props {
    onClick: () => void;
    children: React.ReactNode
}

const ToggleValueTypeBtn = ({ onClick, children }: props) => {
    return (
        <span
            onClick={onClick}
            className="flex w-10 justify-center items-center bg-gray-300 
                rounded-r-md hover:bg-gray-400"
        >
            {children}
        </span>
    )
}
export default ToggleValueTypeBtn;