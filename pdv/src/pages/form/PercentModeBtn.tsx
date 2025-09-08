interface props {
    action: () => void;
    children: React.ReactNode
}

const PercentModeBtn = ({ action, children }: props) => {
    return (
        <span
            onClick={() =>
                action()
            }

            className="flex w-10 px-1 justify-center items-center bg-gray-300 
                rounded-r-md hover:bg-gray-400"
        >
            {children}
        </span>
    )
}
export default PercentModeBtn;