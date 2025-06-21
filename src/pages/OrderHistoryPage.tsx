import OrderHistoryCard, {type OrderHistoryCardProps} from "../components/OrderHistoryCard.tsx";
import React from "react";

const orderHistoryDatas: OrderHistoryCardProps[] = [
    {
        id: 1,
        createdAt: "2024-01-20T10:30:00Z",
        paymentType: "BANK_TRANSFER",
        status: "SHIPPED",
        orderDetails: [
            {
                id: 1,
                product: { id: 1 },
                productName: "iPhone 15 Pro Max",
                quantity: 1,
                price: 29990000,
                note: "",
                colorName: "Natural Titanium",
                versionName: "256GB",
                image_url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MA7E4?wid=400&hei=400&fmt=jpeg&qlt=90&.v=TXZpSEg0MGF0QUNTNGpkTzhrU3hndllvYS9naDJJdU9KTWdGWjhKWFRmS09ndGkreVVaZTdmSmpUOUozdHRlU0pPRjNYblFJVkwzR2MyTG5BQ1RpRlE"
            },
            {
                id: 2,
                product: { id: 2 },
                productName: "MacBook Air M3",
                quantity: 1,
                price: 27990000,
                note: "",
                colorName: "Silver",
                versionName: "8GB/256GB",
                image_url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MDFX4?wid=400&hei=400&fmt=jpeg&qlt=90&.v=a0w4aUNRdVRBU0RuTitHR3hrR2RCdllvYS9naDJJdU9KTWdGWjhKWFRmS1ZGS1d3SDlTVjBOQWIxNCszUkpvN1Z0V1grbituVlRzQkUwY0R1QWF2REE"
            }
        ],
        shippingTrackingCode: "VN123456789"
    },
    {
        id: 2,
        createdAt: "2024-01-15T09:15:00Z",
        paymentType: "CREDIT_CARD",
        status: "DELIVERED",
        orderDetails: [
            {
                id: 3,
                product: { id: 3 },
                productName: "iPad Pro 12.9\"",
                quantity: 1,
                price: 25990000,
                note: "Giao hàng buổi chiều",
                colorName: "Space Gray",
                versionName: "128GB WiFi",
                image_url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MDFX4?wid=400&hei=400&fmt=jpeg&qlt=90&.v=a0w4aUNRdVRBU0RuTitHR3hrR2RCdllvYS9naDJJdU9KTWdGWjhKWFRmS1ZGS1d3SDlTVjBOQWIxNCszUkpvN1Z0V1grbituVlRzQkUwY0R1QWF2REE"
            }
        ],
        shippingTrackingCode: "VN987654321"
    }
]

const OrderHistoryPage: React.FC = () => {
    return (
        <>
            <div className={"py-6 bg-gray-100"}>
                <div className={"container mx-auto"}>
                    <div className={"text-lg font-semibold"}>Đơn hàng</div>
                </div>
            </div>
            <div className="container mx-auto py-12 flex flex-col gap-y-6">
                <h1 className="text-4xl font-semibold">Lịch sử đơn hàng</h1>
                {
                    orderHistoryDatas.length > 0 && (
                        orderHistoryDatas.map((orderData: OrderHistoryCardProps, idx) => (
                            <OrderHistoryCard
                                order={orderData}
                                key={orderData.id}
                                index={idx + 1}/>
                        ))
                    ) || (
                        <>
                            <p className="text-xl text-gray-500 font-medium">Bạn không có đơn hàng nào gần đây.</p>
                            <hr className={"my-6"}/>
                        </>
                    )
                }
                <div className={"space-y-1"}>
                    <p className="text-xl font-medium">Bạn không thấy tất cả đơn hàng của mình?</p>
                    <p className="text-gray-500 text-sm">Bạn hiện đang đăng nhập bằng <span
                        className={"text-blue-600"}>{"hieuu8a@gmail.com"}</span></p>
                    <p className="text-gray-500 text-sm">
                        Để xem tài khoản khác, hãy chuyển đổi tài khoản của bạn bằng cách nhấp vào biểu tượng tài khoản
                        ở góc trên bên phải và chọn "Đăng xuất". Sau đó, đăng nhập lại bằng tài khoản khác của bạn.
                    </p>
                </div>
            </div>
        </>
    )
}
export default OrderHistoryPage;