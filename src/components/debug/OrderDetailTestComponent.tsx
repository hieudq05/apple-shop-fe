import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';

const OrderDetailTestComponent: React.FC = () => {
    const [orderDetail, setOrderDetail] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState('1');

    const fetchOrderDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('=== Testing Order Detail API ===');
            console.log('Fetching order ID:', orderId);
            
            const response = await orderService.getAdminOrderById(parseInt(orderId));
            console.log('Order detail response:', response);
            
            setOrderDetail(response?.data || null);
        } catch (err: any) {
            console.error('Error fetching order detail:', err);
            setError(err.message || 'Failed to fetch order detail');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Order Detail API Test</h1>
            
            <div className="mb-4 flex gap-2">
                <input
                    type="number"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Order ID"
                    className="border rounded px-3 py-2"
                />
                <button
                    onClick={fetchOrderDetail}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Fetch Order'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loading && (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2">Loading order detail...</p>
                </div>
            )}

            {orderDetail && (
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="font-semibold mb-2">Raw API Response:</h2>
                        <pre className="text-sm overflow-auto bg-white p-2 rounded border">
                            {JSON.stringify(orderDetail, null, 2)}
                        </pre>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                        <h2 className="font-semibold mb-4">Order Details Summary:</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong>ID:</strong> {orderDetail.id}
                            </div>
                            <div>
                                <strong>Status:</strong> {orderDetail.status}
                            </div>
                            <div>
                                <strong>Payment Type:</strong> {orderDetail.paymentType}
                            </div>
                            <div>
                                <strong>Created At:</strong> {orderDetail.createdAt}
                            </div>
                            <div>
                                <strong>Customer:</strong> {orderDetail.firstName} {orderDetail.lastName}
                            </div>
                            <div>
                                <strong>Email:</strong> {orderDetail.email}
                            </div>
                            <div>
                                <strong>Phone:</strong> {orderDetail.phone}
                            </div>
                            <div>
                                <strong>Address:</strong> {orderDetail.address}
                            </div>
                        </div>

                        {orderDetail.orderDetails && orderDetail.orderDetails.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Order Items ({orderDetail.orderDetails.length}):</h3>
                                <div className="space-y-2">
                                    {orderDetail.orderDetails.map((item: any, index: number) => (
                                        <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                            <div><strong>Product:</strong> {item.productName}</div>
                                            <div><strong>Quantity:</strong> {item.quantity}</div>
                                            <div><strong>Price:</strong> {item.price}</div>
                                            <div><strong>Color:</strong> {item.colorName}</div>
                                            <div><strong>Version:</strong> {item.versionName}</div>
                                            {item.image_url && (
                                                <div><strong>Image:</strong> <img src={item.image_url} alt={item.productName} className="w-12 h-12 object-cover rounded mt-1" /></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {orderDetail.createdBy && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Created By:</h3>
                                <div className="bg-gray-50 p-2 rounded text-sm">
                                    <div><strong>ID:</strong> {orderDetail.createdBy.id}</div>
                                    <div><strong>Name:</strong> {orderDetail.createdBy.firstName} {orderDetail.createdBy.lastName}</div>
                                    <div><strong>Email:</strong> {orderDetail.createdBy.email}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailTestComponent;
