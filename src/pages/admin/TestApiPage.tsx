import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import orderService from '../../services/orderService';
import { getAccessToken, setAccessToken } from '../../utils/storage';

const TestApiPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [testToken, setTestToken] = useState('');

    const currentToken = getAccessToken();

    const testApiCall = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Testing API call to admin orders...');
            
            const token = getAccessToken();
            if (!token) {
                throw new Error('No access token found. Please login first.');
            }
            
            // Test với URL trực tiếp trước
            const response = await fetch('http://localhost:8080/api/v1/admin/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token, // Token đã có prefix 'Bearer' rồi
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            setResult(data);
            
        } catch (err: any) {
            console.error('API call failed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testWithService = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Testing with orderService...');
            const response = await orderService.getAdminOrders({
                page: 0,
                size: 10
            });
            console.log('Service Response:', response);
            setResult(response);
        } catch (err: any) {
            console.error('Service call failed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Test API Admin Orders</CardTitle>
                    <CardDescription>
                        Test để kiểm tra API admin orders có hoạt động không
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Token Info */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                        <h3 className="font-medium text-blue-800">Current Token Status:</h3>
                        <p className="text-sm text-blue-600 mt-1">
                            {currentToken ? `Token available: ${currentToken.substring(0, 20)}...` : 'No token found'}
                        </p>
                    </div>

                    {/* Manual Token Input for Testing */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <h3 className="font-medium text-yellow-800 mb-2">Set Test Token:</h3>
                        <p className="text-sm text-yellow-700 mb-2">
                            Để test API, bạn cần có admin token. Hãy đăng nhập vào admin và copy token từ localStorage hoặc developer tools.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Paste your admin token here (e.g., Bearer eyJ...)"
                                value={testToken}
                                onChange={(e) => setTestToken(e.target.value)}
                                className="flex-1"
                                type="password"
                            />
                            <Button
                                onClick={() => {
                                    if (testToken.trim()) {
                                        setAccessToken(testToken.trim());
                                        setTestToken('');
                                        window.location.reload(); // Reload để cập nhật token hiển thị
                                    }
                                }}
                                variant="outline"
                                size="sm"
                            >
                                Set Token
                            </Button>
                        </div>
                        <div className="mt-2 flex gap-2">
                            <Button
                                onClick={() => {
                                    // Tạo một test token giả (để demo, thực tế cần token thật từ backend)
                                    const demoToken = "Bearer demo-admin-token-for-testing";
                                    setAccessToken(demoToken);
                                    window.location.reload();
                                }}
                                variant="ghost"
                                size="sm"
                            >
                                Use Demo Token
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button 
                            onClick={testApiCall} 
                            disabled={loading}
                            variant="outline"
                        >
                            {loading ? 'Đang test...' : 'Test Direct API Call'}
                        </Button>
                        
                        <Button 
                            onClick={testWithService} 
                            disabled={loading}
                        >
                            {loading ? 'Đang test...' : 'Test With Service'}
                        </Button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded">
                            <h3 className="font-medium text-red-800">Error:</h3>
                            <pre className="text-sm text-red-600 mt-2">{error}</pre>
                        </div>
                    )}

                    {result && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded">
                            <h3 className="font-medium text-green-800">Result:</h3>
                            <pre className="text-sm text-green-600 mt-2 overflow-auto max-h-96">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TestApiPage;
