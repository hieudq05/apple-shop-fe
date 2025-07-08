import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import orderService from '../../services/orderService';
import { getAccessToken } from '../../utils/storage';

const ApiDebugComponent: React.FC = () => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const addResult = (title: string, data: any, error?: any) => {
        const newResult = {
            id: Date.now(),
            title,
            data,
            error,
            timestamp: new Date().toLocaleTimeString()
        };
        setResults(prev => [newResult, ...prev]);
    };

    const testDirectFetch = async () => {
        setLoading(true);
        try {
            const token = getAccessToken();
            console.log('Testing direct fetch with token:', token);
            
            const response = await fetch('http://localhost:8080/api/v1/admin/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token || ''
                }
            });
            
            const data = await response.json();
            addResult('Direct Fetch', { status: response.status, data });
        } catch (error) {
            addResult('Direct Fetch', null, error);
        } finally {
            setLoading(false);
        }
    };

    const testService = async () => {
        setLoading(true);
        try {
            const response = await orderService.getAdminOrders({ page: 0, size: 10 });
            addResult('Service Call', response);
        } catch (error) {
            addResult('Service Call', null, error);
        } finally {
            setLoading(false);
        }
    };

    const testAxiosConfig = () => {
        const token = getAccessToken();
        addResult('Current Config', {
            token: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
            baseURL: 'Check console for axios config'
        });
        
        // Log axios config to console
        console.log('Axios privateAPI config:', {
            baseURL: (orderService as any).privateAPI?.defaults?.baseURL,
            headers: (orderService as any).privateAPI?.defaults?.headers
        });
    };

    useEffect(() => {
        testAxiosConfig();
    }, []);

    return (
        <div className="p-6 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>API Debug Tool</CardTitle>
                    <CardDescription>Test các API calls để debug vấn đề</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Button onClick={testDirectFetch} disabled={loading}>
                            Test Direct Fetch
                        </Button>
                        <Button onClick={testService} disabled={loading}>
                            Test Service
                        </Button>
                        <Button onClick={testAxiosConfig} disabled={loading}>
                            Check Config
                        </Button>
                        <Button onClick={() => setResults([])} variant="outline">
                            Clear Results
                        </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {results.map(result => (
                            <div key={result.id} className="p-3 border rounded">
                                <div className="font-medium text-sm">
                                    {result.title} - {result.timestamp}
                                </div>
                                {result.error ? (
                                    <pre className="text-red-600 text-xs mt-1 overflow-auto">
                                        {JSON.stringify(result.error, null, 2)}
                                    </pre>
                                ) : (
                                    <pre className="text-green-600 text-xs mt-1 overflow-auto">
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ApiDebugComponent;
