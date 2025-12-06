import { useState } from "react";
import Order, { PdvAction, IsButtonsClicked } from "../../types/pdvAction.type";
import { dateNow } from "../../utils/fomatters";
import { validateOrder } from "../../utils/validations";
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
    if (!validateOrder(order)) return;

    const updated = { ...order, date: dateNow() };

    sessionStorage.setItem("order", JSON.stringify(updated));

    actionsMap[action](updated);
  }

  return (
    <div className="block [&>button]:p-2 [&>button]:font-bold">
      {buttons.map(btn => (
        <button
          key={btn.key}
          className={btn.color}
          onClick={e => {
            e.preventDefault()
            handleAction(btn.action);
            markClicked(btn.key);
          }}
        >
          <i className="bi bi-whatsapp mr-1" /> {btn.label}
        </button>
      ))}
    </div>
  );
};

export default PdvActions;
