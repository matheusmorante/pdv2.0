import CustomerData from "../types/customerData.type"
import { AddressViaCep } from "../types/fullAddress.type";
import { stringifyFullAddress } from "./fomatters";

export const getShippingRouteUrl = (fullAddress: CustomerData['fullAddress']) => {
    const originString = "R. Cascavel, 306 - Guaraituba, Colombo - PR, 83410-270"
    const destinationString = stringifyFullAddress(fullAddress);

    const originURI = encodeURIComponent(originString);
    const destinationURI = encodeURIComponent(destinationString);

    return (
        `https://www.google.com/maps/dir/?api=1&origin=${originURI}&destination=${destinationURI}&travelmode=driving`
    )
}

export const getAddressByCep = async (cep: string): Promise<AddressViaCep> => {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
   
    const data = await res.json();
    return data
}