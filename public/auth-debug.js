// Emergency authentication debug script
// Run this in browser console to fix auth issues

console.log('🔧 Auth Debug Script Loaded');

// Create test admin token
function createTestAdminToken() {
  const payload = {
    sub: 'admin@test.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    roles: [
      { authority: 'ROLE_ADMIN' },
      { authority: 'ROLE_STAFF' }
    ],
    firstName: 'Test',
    lastName: 'Admin',
    imageUrl: ''
  };

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = btoa(JSON.stringify(payload));
  const signature = 'test-signature';

  return `${header}.${payloadStr}.${signature}`;
}

// Clean token by removing Bearer prefix
function cleanToken(token) {
  if (!token) return token;
  return token.replace(/^Bearer\s+/i, '').trim();
}

// Fix authentication
function fixAuth() {
  console.log('🚀 Starting auth fix...');

  // Clear existing tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  console.log('✅ Cleared existing tokens');

  // Set test admin token (cleaned of Bearer prefix)
  const testToken = createTestAdminToken();
  const cleanedToken = cleanToken(testToken);
  localStorage.setItem('accessToken', cleanedToken);
  console.log('✅ Set test admin token (Bearer prefix handled)');

  // Reload page
  console.log('🔄 Reloading page...');
  window.location.reload();
}

// Quick diagnosis
function diagnoseAuth() {
  console.log('🔍 Diagnosing authentication...');

  const rawToken = localStorage.getItem('accessToken');
  console.log('Has token:', !!rawToken);
  console.log('Raw token (first 50 chars):', rawToken ? rawToken.substring(0, 50) + '...' : 'null');

  if (rawToken) {
    // Clean token of Bearer prefix
    const token = cleanToken(rawToken);
    console.log('Cleaned token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('Had Bearer prefix:', rawToken !== token);

    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        console.log('Roles:', payload.roles);
        console.log('Expired:', payload.exp < Math.floor(Date.now() / 1000));

        const hasAdminRole = payload.roles?.some(r =>
          r.authority === 'ROLE_ADMIN' || r.authority === 'ROLE_STAFF'
        );
        console.log('Has admin role:', hasAdminRole);
      } else {
        console.log('❌ Invalid token format - parts:', parts.length);
      }
    } catch (error) {
      console.log('❌ Error parsing token:', error);
      console.log('Token parts:', token.split('.').length);
    }
  }
}

// Export functions to global scope
window.authDebug = {
  fix: fixAuth,
  diagnose: diagnoseAuth,
  createToken: createTestAdminToken
};

console.log('🎯 Available commands:');
console.log('- authDebug.fix() - Fix authentication issues');
console.log('- authDebug.diagnose() - Diagnose current auth state');
console.log('- authDebug.createToken() - Create test admin token');

// Auto-run diagnosis
diagnoseAuth();
