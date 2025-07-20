// Test utility for JWT Unicode handling
import { decodeJWT } from './jwt';

// Function to create a test JWT token with Vietnamese characters
export const createTestJWT = (firstName: string, lastName: string): string => {
    const header = {
        "alg": "HS256",
        "typ": "JWT"
    };

    const payload = {
        "sub": "test@email.com",
        "firstName": firstName,
        "lastName": lastName,
        "roles": [{ "authority": "ROLE_USER" }],
        "exp": Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        "iat": Math.floor(Date.now() / 1000)
    };

    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
    const encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/=/g, '');
    
    // Create a dummy signature (in real app, this would be properly signed)
    const signature = btoa("dummy-signature").replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Test function to verify Unicode handling
export const testUnicodeDecoding = () => {
    console.log('=== Testing JWT Unicode Decoding ===');
    
    // Test with Vietnamese name
    const testName = {
        firstName: "Dương",
        lastName: "Quốc Hiếu"
    };
    
    console.log('Original name:', testName);
    
    // Create test token
    const testToken = createTestJWT(testName.firstName, testName.lastName);
    console.log('Test token created:', testToken);
    
    // Decode token
    const decoded = decodeJWT(testToken);
    console.log('Decoded payload:', decoded);
    
    if (decoded) {
        console.log('Decoded firstName:', decoded.firstName);
        console.log('Decoded lastName:', decoded.lastName);
        console.log('Full name:', `${decoded.firstName} ${decoded.lastName}`);
        
        // Check if decoding is correct
        const isCorrect = decoded.firstName === testName.firstName && 
                         decoded.lastName === testName.lastName;
        
        console.log('Unicode decoding correct:', isCorrect);
        
        if (!isCorrect) {
            console.error('❌ Unicode decoding failed!');
            console.error('Expected:', testName);
            console.error('Got:', { firstName: decoded.firstName, lastName: decoded.lastName });
        } else {
            console.log('✅ Unicode decoding successful!');
        }
    } else {
        console.error('❌ Failed to decode token');
    }
    
    console.log('=== End Test ===');
};

// Alternative encoding method for better Unicode support
export const createTestJWTWithProperEncoding = (firstName: string, lastName: string): string => {
    const header = {
        "alg": "HS256",
        "typ": "JWT"
    };

    const payload = {
        "sub": "test@email.com",
        "firstName": firstName,
        "lastName": lastName,
        "roles": [{ "authority": "ROLE_USER" }],
        "exp": Math.floor(Date.now() / 1000) + 3600,
        "iat": Math.floor(Date.now() / 1000)
    };

    // Proper Unicode encoding
    const encodeBase64Url = (obj: any): string => {
        const jsonString = JSON.stringify(obj);
        
        // Use TextEncoder for proper Unicode handling
        if (typeof TextEncoder !== 'undefined') {
            const encoder = new TextEncoder();
            const bytes = encoder.encode(jsonString);
            const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
            return btoa(binaryString)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        } else {
            // Fallback for older browsers
            const encoded = btoa(unescape(encodeURIComponent(jsonString)));
            return encoded
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        }
    };

    const encodedHeader = encodeBase64Url(header);
    const encodedPayload = encodeBase64Url(payload);
    const signature = btoa("dummy-signature").replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Test both encoding methods
export const compareEncodingMethods = () => {
    console.log('=== Comparing Encoding Methods ===');
    
    const testName = {
        firstName: "Dương",
        lastName: "Quốc Hiếu"
    };
    
    // Method 1: Basic encoding
    const token1 = createTestJWT(testName.firstName, testName.lastName);
    const decoded1 = decodeJWT(token1);
    
    // Method 2: Proper Unicode encoding
    const token2 = createTestJWTWithProperEncoding(testName.firstName, testName.lastName);
    const decoded2 = decodeJWT(token2);
    
    console.log('Method 1 (Basic):', decoded1);
    console.log('Method 2 (Unicode):', decoded2);
    
    const method1Correct = decoded1?.firstName === testName.firstName && decoded1?.lastName === testName.lastName;
    const method2Correct = decoded2?.firstName === testName.firstName && decoded2?.lastName === testName.lastName;
    
    console.log('Method 1 correct:', method1Correct);
    console.log('Method 2 correct:', method2Correct);
    
    console.log('=== End Comparison ===');
};
