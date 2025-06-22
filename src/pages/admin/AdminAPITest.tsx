import React, { useState } from 'react';
import { 
  PlayIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import AdminService from '../../services/adminService';
import { testProductCreationJSON } from '../../utils/testProductAPI';

const AdminAPITest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleProductData = {
    "name": "iPhone XS Max",
    "description": "This is demo description.",
    "createdBy": "hieuu8a@gmail.com",
    "category": {
        "id": null,
        "name": "iPhone",
        "image": "https://apple.com"
    },
    "features": [
        {
            "id": null,
            "name": "Intelligence 123123",
            "description": "Được thiết kế cho Apple Intelligence.",
            "image": "placeholder_anh4"
        }
    ],
    "stocks": [
        {
            "color": {
                "id": null,
                "name": "Xanh lưu ly",
                "hexCode": "#0071e3"
            },
            "quantity": 26,
            "price": 23900000,
            "productPhotos": [
                {
                    "imageUrl": "placeholder_anh3",
                    "alt": "iPhone 16 Pro Max Xanh Lưu Ly"
                }
            ],
            "instanceProperties": [
                {
                    "id": null,
                    "name": "Demo Instance12asd"
                },
                {
                    "id": null,
                    "name": "Demo 99999999"
                }
            ]
        },
        {
            "color": {
                "id": null,
                "name": "Vàng",
                "hexCode": "#0071e3"
            },
            "quantity": 26,
            "price": 23900000,
            "productPhotos": [
                {
                    "imageUrl": "placeholder_anh1",
                    "alt": "iPhone 16 Pro Max Xanh Lưu Ly"
                }
            ],
            "instanceProperties": [
                {
                    "id": null,
                    "name": "Demo Instance Testtttttttt"
                }
            ]
        },
        {
            "color": {
                "id": null,
                "name": "Vàng",
                "hexCode": "#0071e3"
            },
            "quantity": 26,
            "price": 23900000,
            "productPhotos": [
                {
                    "imageUrl": "placeholder_anh2",
                    "alt": "iPhone 16 Pro Max Xanh Lưu Ly"
                }
            ],
            "instanceProperties": [
                {
                    "id": null,
                    "name": "Display Size"
                }
            ]
        }
    ]
  };

  const testCreateProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🚀 Testing product creation...');
      
      // Try JSON approach first
      const response = await AdminService.createProductJSON(sampleProductData);
      
      console.log('✅ Success:', response);
      setResult(response);
    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testCreateProductFormData = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🚀 Testing product creation with FormData...');
      
      // Create mock files for testing
      const files: { [key: string]: File } = {};
      ['placeholder_anh1', 'placeholder_anh2', 'placeholder_anh3', 'placeholder_anh4'].forEach(name => {
        files[name] = new File(['test content'], `${name}.jpg`, { type: 'image/jpeg' });
      });
      
      const response = await AdminService.createProduct(sampleProductData, files);
      
      console.log('✅ Success:', response);
      setResult(response);
    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testUtilFunction = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🚀 Testing with utility function...');
      
      const response = await testProductCreationJSON();
      
      console.log('✅ Success:', response);
      setResult(response);
    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Test - Product Creation</h1>
        <p className="text-gray-600 mt-1">Test the product creation API with sample data</p>
      </div>

      {/* Sample Data Display */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5" />
          Sample Product Data
        </h2>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(sampleProductData, null, 2)}
        </pre>
      </div>

      {/* Test Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Test Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={testCreateProduct}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <PlayIcon className="h-5 w-5" />
            Test JSON API
          </button>
          
          <button
            onClick={testCreateProductFormData}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <PlayIcon className="h-5 w-5" />
            Test FormData API
          </button>
          
          <button
            onClick={testUtilFunction}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <PlayIcon className="h-5 w-5" />
            Test Utility Function
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800">Testing API call...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Error:</p>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Success! API Response:</p>
          </div>
          <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">Instructions:</h3>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Make sure your backend server is running on http://localhost:8080</li>
          <li>• Ensure you're logged in as an admin user</li>
          <li>• Check the browser console for detailed logs</li>
          <li>• The API endpoint is: POST /api/v1/admin/products</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAPITest;
