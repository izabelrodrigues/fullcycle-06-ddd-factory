import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order-item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item-model";
import OrderModel from "./order-model";

export default class OrderRepository implements OrderRepositoryInterface {
    async create(entity: Order): Promise<void> {
        await OrderModel.create(
            {
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
            },
            {
                include: [{ model: OrderItemModel }],
            }
        );
    }
    async update(entity: Order): Promise<void> {

        await OrderItemModel.destroy({ where: { order_id: entity.id } });

        await OrderModel.update(
            {
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total()
            },
            {
                where: {
                    id: entity.id,
                }
            }
        );

        entity.items.map((item) => {
            OrderItemModel.create({
                id: item.id,
                name: item.name,
                price: item.price,
                product_id: item.productId,
                quantity: item.quantity,
                order_id: entity.id
            });
        });


    }
    async find(id: string): Promise<Order> {
        let orderModel;
        try {
            orderModel = await OrderModel.findOne({
                where: {
                    id,
                },
                rejectOnEmpty: true,
                include: ["items"]
            });
        } catch (error) {
            throw new Error("Order not found");
        }

        let items: OrderItem[] = [];
        orderModel.items.map((orderModelItem) => {

            let orderItem = new OrderItem(orderModelItem.id, orderModelItem.name, orderModelItem.price / orderModelItem.quantity, orderModelItem.product_id, orderModelItem.quantity);
            items.push(orderItem);
        });

        let order = new Order(orderModel.id, orderModel.customer_id, items);
        return order;

    }
    async findAll(): Promise<Order[]> {
        const orderModels = await OrderModel.findAll({ include: ["items"] });
        let orders: Order[] = [];

        orderModels.map((orderModel) => {
            let items: OrderItem[] = [];

            orderModel.items.map((orderModelItem) => {

                let orderItem = new OrderItem(orderModelItem.id, orderModelItem.name, orderModelItem.price / orderModelItem.quantity, orderModelItem.product_id, orderModelItem.quantity);
                items.push(orderItem);
            });

            let order = new Order(orderModel.id, orderModel.customer_id, items);

            orders.push(order);
        });

        return orders;
    }


}