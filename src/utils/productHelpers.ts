import type { CreateProductRequest } from '../services/adminProductService';

/**
 * Helper function to create product with proper data structure
 * @param productData - The product data object
 * @param imageFiles - Object mapping placeholder strings to File objects
 * @returns Promise resolving to API response
 */
export async function createProductWithImages(
    productData: CreateProductRequest,
    imageFiles: { [key: string]: File }
) {
    const { adminProductService } = await import('../services/adminProductService');

    // Validate that all placeholder images have corresponding files
    const missingImages = validateImagePlaceholders(productData, imageFiles);
    if (missingImages.length > 0) {
        throw new Error(`Missing image files for placeholders: ${missingImages.join(', ')}`);
    }

    return adminProductService.createProduct(productData, imageFiles);
}

/**
 * Validates that all placeholder images in product data have corresponding files
 * @param productData - The product data object
 * @param imageFiles - Object mapping placeholder strings to File objects
 * @returns Array of missing placeholder keys
 */
export function validateImagePlaceholders(
    productData: CreateProductRequest,
    imageFiles: { [key: string]: File }
): string[] {
    const missingPlaceholders: string[] = [];

    // Check category image
    if (productData.category?.image &&
        typeof productData.category.image === 'string' &&
        productData.category.image.startsWith('placeholder_') &&
        !imageFiles[productData.category.image]) {
        missingPlaceholders.push(productData.category.image);
    }

    // Check feature images
    productData.features?.forEach(feature => {
        if (feature.image &&
            typeof feature.image === 'string' &&
            feature.image.startsWith('placeholder_') &&
            !imageFiles[feature.image]) {
            missingPlaceholders.push(feature.image);
        }
    });

    // Check stock product photos
    productData.stocks?.forEach(stock => {
        stock.productPhotos?.forEach(photo => {
            if (photo.imageUrl &&
                typeof photo.imageUrl === 'string' &&
                photo.imageUrl.startsWith('placeholder_') &&
                !imageFiles[photo.imageUrl]) {
                missingPlaceholders.push(photo.imageUrl);
            }
        });
    });

    return missingPlaceholders;
}

/**
 * Extracts all placeholder keys from product data
 * @param productData - The product data object
 * @returns Array of placeholder strings found in the data
 */
export function extractPlaceholderKeys(productData: CreateProductRequest): string[] {
    const placeholders: string[] = [];

    // Check category image
    if (productData.category?.image &&
        typeof productData.category.image === 'string' &&
        productData.category.image.startsWith('placeholder_')) {
        placeholders.push(productData.category.image);
    }

    // Check feature images
    productData.features?.forEach(feature => {
        if (feature.image &&
            typeof feature.image === 'string' &&
            feature.image.startsWith('placeholder_')) {
            placeholders.push(feature.image);
        }
    });

    // Check stock product photos
    productData.stocks?.forEach(stock => {
        stock.productPhotos?.forEach(photo => {
            if (photo.imageUrl &&
                typeof photo.imageUrl === 'string' &&
                photo.imageUrl.startsWith('placeholder_')) {
                placeholders.push(photo.imageUrl);
            }
        });
    });

    return [...new Set(placeholders)]; // Remove duplicates
}
