import { useState } from "react";
import Order, { PdvAction, IsButtonsClicked } from "../../../types/pdvAction.type";
import { dateNow } from "../../../utils/formatters";
import { buttons, actionsMap } from "./pdvActionsConfig";

const PdvActions = ({ order }: { order: Order }) => {
  const [isButtonsClicked, setIsButtonsClicked] = useState<IsButtonsClicked>({
    printReceipt: false,
    printShippingOrder: false,
    printWarrantyTerm: false,
    sendShippingOrder: false,
    sendCustomerOrder: false,
    sendCustomerReviews: false
  });

  function markClicked(key: keyof IsButtonsClicked) {
    setIsButtonsClicked((prev) => ({ ...prev, [key]: true }));
  }

  function handleAction(action: PdvAction) {
    const updated = { ...order, date: dateNow() };
    sessionStorage.setItem("order", JSON.stringify(updated));
    if (actionsMap[action]) {
      actionsMap[action](updated);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {buttons.map(btn => (
        <button
          key={btn.key}
          className={`${btn.color} flex items-center gap-3 whitespace-nowrap active:scale-95`}
          onClick={e => {
            e.preventDefault()
            handleAction(btn.action);
            markClicked(btn.key);
          }}
        >
          <i className={`bi ${btn.icon} text-lg`} />
          <span className="font-black">{btn.label}</span>
          {isButtonsClicked[btn.key] && <i className="bi bi-check-circle-fill text-white ml-1" />}
        </button>
      ))}
    </div>
  );
};

export default PdvActions;
