import FullAddress from "./fullAddress.type"

type CustomerData = {
    fullName: string,
    phone: string,
    noPhone?: boolean,
    fullAddress: FullAddress
}

export default CustomerData