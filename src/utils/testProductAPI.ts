// Test script for product creation API
import { privateAPI } from './axios';

export const testProductCreation = async () => {
  const productData = {
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

  try {
    console.log('🚀 Testing product creation API...');
    console.log('📦 Product data:', JSON.stringify(productData, null, 2));

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));

    // Add placeholder image files (simulating the files from your image)
    const placeholderFiles = [
      'placeholder_anh1',
      'placeholder_anh2', 
      'placeholder_anh3',
      'placeholder_anh4'
    ];

    // For testing, we'll create mock File objects
    placeholderFiles.forEach((fileName) => {
      // Create a simple text file as placeholder
      const file = new File(['test content'], `${fileName}.jpg`, { type: 'image/jpeg' });
      formData.append(fileName, file);
    });

    const response = await privateAPI.post('/api/v1/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ API Response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ API Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// Alternative test with JSON only (if backend accepts JSON)
export const testProductCreationJSON = async () => {
  const productData = {
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

  try {
    console.log('🚀 Testing product creation API (JSON)...');
    console.log('📦 Product data:', JSON.stringify(productData, null, 2));

    const response = await privateAPI.post('/api/v1/admin/products', productData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ API Response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ API Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};
