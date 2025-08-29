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

            className="flex w-7 h-7 justify-center items-center bg-gray-300"
        >
            {children}
        </span>
    )
}
export default PercentModeBtn;