import React, { useState } from "react";
import Order, { OrderAction, IsButtonsClicked } from "../../../types/order.type";
import { dateNow } from "../../../utils/formatters";
import { buttons, actionsMap } from "./orderActionsConfig";

const OrderActions = ({ order }: { order: Order }) => {
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

  function handleAction(action: OrderAction) {
    const updated = { ...order, date: dateNow() };
    sessionStorage.setItem("order", JSON.stringify(updated));
    if (actionsMap[action]) {
      actionsMap[action](updated);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {buttons.map((btn) => (
        <button
          key={btn.key}
          className={`${btn.color} flex items-center gap-3 whitespace-nowrap active:scale-95`}
          onClick={(e) => {
            e.preventDefault();
            handleAction(btn.action);
            markClicked(btn.key as keyof IsButtonsClicked);
          }}
        >
          <i className={`bi ${btn.icon} text-lg`} />
          <span className="font-black">{btn.label}</span>
          {isButtonsClicked[btn.key as keyof IsButtonsClicked] && <i className="bi bi-check-circle-fill text-white ml-1" />}
        </button>
      ))}
    </div>
  );
};

export default OrderActions;
