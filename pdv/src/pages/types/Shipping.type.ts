type Shipping = {
    value: number,
    distance?: number,
    deliveryMethod: 'delivery' | 'pickup',
    orderType: string,
    scheduling: {
        date: string,
        time: string, // legacy/display
        startTime?: string, // HH:mm
        endTime?: string,   // HH:mm
        type: 'fixed' | 'range'
    }
};

export default Shipping;