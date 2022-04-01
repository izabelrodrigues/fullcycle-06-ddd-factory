import Customer from "../entity/customer";
import CustomerInterface from "../entity/customer.inteface";
import { v4 as uuid } from "uuid";
import Address from "../value-object/address";

export default class CustomerFactory {
    static createWithAddress(name: string, address: Address): CustomerInterface {
        let customer = new Customer(uuid(), name);
        customer.changeAddress(address);
        return customer;
    }

    static create(name: string): CustomerInterface {
        return new Customer(uuid(), name);
    }

}