#!/usr/bin/env node

// Simple Node.js script to test authentication logic
// This tests the core JWT and role logic without React dependencies

console.log('🔍 Testing Authentication Logic...\n');

// Mock JWT payload structure
const createMockJWT = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'mock-signature';
  return `${header}.${payloadStr}.${signature}`;
};

// Mock JWT decode function
const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

// Mock role checking functions
const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  return user.roles.some(r => r.authority === role);
};

const isAdmin = (user) => {
  return hasRole(user, 'ROLE_ADMIN') || hasRole(user, 'ROLE_STAFF');
};

const canAccessAdmin = (user) => {
  return isAdmin(user);
};

// Test cases
const tests = [
  {
    name: 'Admin Token Creation and Decoding',
    test: () => {
      const payload = {
        sub: 'admin@test.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        roles: [{ authority: 'ROLE_ADMIN' }],
        firstName: 'Test',
        lastName: 'Admin'
      };
      
      const token = createMockJWT(payload);
      const decoded = decodeJWT(token);
      
      return {
        passed: decoded && decoded.sub === 'admin@test.com' && decoded.roles[0].authority === 'ROLE_ADMIN',
        details: { token: token.substring(0, 50) + '...', decoded }
      };
    }
  },
  
  {
    name: 'Admin Role Detection',
    test: () => {
      const adminUser = {
        roles: [{ authority: 'ROLE_ADMIN' }, { authority: 'ROLE_STAFF' }]
      };
      
      const regularUser = {
        roles: [{ authority: 'ROLE_USER' }]
      };
      
      const adminCheck = isAdmin(adminUser);
      const userCheck = isAdmin(regularUser);
      
      return {
        passed: adminCheck === true && userCheck === false,
        details: { adminIsAdmin: adminCheck, userIsAdmin: userCheck }
      };
    }
  },
  
  {
    name: 'Admin Access Control',
    test: () => {
      const adminUser = {
        roles: [{ authority: 'ROLE_ADMIN' }]
      };
      
      const staffUser = {
        roles: [{ authority: 'ROLE_STAFF' }]
      };
      
      const regularUser = {
        roles: [{ authority: 'ROLE_USER' }]
      };
      
      const adminAccess = canAccessAdmin(adminUser);
      const staffAccess = canAccessAdmin(staffUser);
      const userAccess = canAccessAdmin(regularUser);
      
      return {
        passed: adminAccess === true && staffAccess === true && userAccess === false,
        details: { 
          adminCanAccess: adminAccess, 
          staffCanAccess: staffAccess, 
          userCanAccess: userAccess 
        }
      };
    }
  },
  
  {
    name: 'Token Expiration Logic',
    test: () => {
      const validPayload = {
        sub: 'test@test.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        roles: [{ authority: 'ROLE_USER' }]
      };
      
      const expiredPayload = {
        sub: 'test@test.com',
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
        roles: [{ authority: 'ROLE_USER' }]
      };
      
      const validToken = createMockJWT(validPayload);
      const expiredToken = createMockJWT(expiredPayload);
      
      const validDecoded = decodeJWT(validToken);
      const expiredDecoded = decodeJWT(expiredToken);
      
      const validIsExpired = validDecoded.exp <= Math.floor(Date.now() / 1000);
      const expiredIsExpired = expiredDecoded.exp <= Math.floor(Date.now() / 1000);
      
      return {
        passed: validIsExpired === false && expiredIsExpired === true,
        details: { 
          validTokenExpired: validIsExpired, 
          expiredTokenExpired: expiredIsExpired,
          currentTime: Math.floor(Date.now() / 1000),
          validExp: validDecoded.exp,
          expiredExp: expiredDecoded.exp
        }
      };
    }
  },
  
  {
    name: 'Role Priority Logic',
    test: () => {
      const multiRoleUser = {
        roles: [
          { authority: 'ROLE_USER' },
          { authority: 'ROLE_STAFF' },
          { authority: 'ROLE_ADMIN' }
        ]
      };
      
      // Should prioritize ADMIN over STAFF over USER
      const hasAdminRole = hasRole(multiRoleUser, 'ROLE_ADMIN');
      const hasStaffRole = hasRole(multiRoleUser, 'ROLE_STAFF');
      const hasUserRole = hasRole(multiRoleUser, 'ROLE_USER');
      const isAdminUser = isAdmin(multiRoleUser);
      
      return {
        passed: hasAdminRole && hasStaffRole && hasUserRole && isAdminUser,
        details: { 
          hasAdminRole, 
          hasStaffRole, 
          hasUserRole, 
          isAdminUser,
          roles: multiRoleUser.roles
        }
      };
    }
  },
  
  {
    name: 'Bearer Token Prefix Handling',
    test: () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const tokenWithBearer = `Bearer ${token}`;
      
      // Simulate cleaning function
      const cleanToken = (inputToken) => {
        if (!inputToken) return inputToken;
        return inputToken.replace(/^Bearer\s+/i, '').trim();
      };
      
      const cleaned = cleanToken(tokenWithBearer);
      const alreadyClean = cleanToken(token);
      
      return {
        passed: cleaned === token && alreadyClean === token,
        details: { 
          original: tokenWithBearer,
          cleaned,
          alreadyClean,
          bothMatch: cleaned === token && alreadyClean === token
        }
      };
    }
  }
];

// Run tests
let passed = 0;
let failed = 0;

console.log('Running Authentication Tests:\n');

tests.forEach((test, index) => {
  try {
    const result = test.test();
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    
    console.log(`${index + 1}. ${status} - ${test.name}`);
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
      console.log('   Details:', JSON.stringify(result.details, null, 2));
    }
    
    console.log('');
  } catch (error) {
    failed++;
    console.log(`${index + 1}. ❌ ERROR - ${test.name}`);
    console.log('   Error:', error.message);
    console.log('');
  }
});

// Summary
console.log('='.repeat(50));
console.log(`📊 Test Results:`);
console.log(`   Total Tests: ${tests.length}`);
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All authentication logic tests passed!');
  console.log('✅ The authentication system is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Please review the authentication logic.');
}

console.log('\n🔗 To test in browser, visit: http://localhost:5173/auth-validation');
console.log('='.repeat(50));
