import Order from "../../../types/pdvAction.type";

export const getHour = (time?: string) => {
    if (!time) return -1;
    return parseInt(time.split(":")[0], 10);
};

export const calculateLanes = (orders: Order[]): Order[][] => {
    const lanes: Order[][] = [];

    const sortedOrders = [...orders].sort((a, b) => {
        const startA = getHour(a.shipping.scheduling.startTime || a.shipping.scheduling.time);
        const startB = getHour(b.shipping.scheduling.startTime || b.shipping.scheduling.time);
        return startA - startB;
    });

    sortedOrders.forEach((order) => {
        const start = getHour(order.shipping.scheduling.startTime || order.shipping.scheduling.time);
        let placed = false;

        for (const lane of lanes) {
            const lastInLane = lane[lane.length - 1];
            const endHourLast = lastInLane.shipping.scheduling.type === 'range'
                ? getHour(lastInLane.shipping.scheduling.endTime)
                : getHour(lastInLane.shipping.scheduling.startTime || lastInLane.shipping.scheduling.time) + 1;

            if (endHourLast <= start) {
                lane.push(order);
                placed = true;
                break;
            }
        }

        if (!placed) {
            lanes.push([order]);
        }
    });

    return lanes.length > 0 ? lanes : [[]];
};
