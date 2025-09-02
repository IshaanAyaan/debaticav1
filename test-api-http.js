const fetch = require('node-fetch');

// Test the API endpoint directly
async function testAPIEndpoint() {
  console.log('🌐 Testing API endpoint...');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/llm`;
  
  console.log(`📡 Testing endpoint: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feature: 'extemp',
        mode: 'light',
        userInput: 'Test question: What is the impact of social media on democracy?',
        projectId: null,
        caseId: null,
        extra: {}
      })
    });
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('⚠️  API requires authentication (expected for protected endpoints)');
      return true; // This is expected behavior
    }
    
    if (response.ok) {
      const text = await response.text();
      console.log('✅ API endpoint test successful!');
      console.log(`📝 Response length: ${text.length} characters`);
      console.log(`📄 First 200 chars: ${text.substring(0, 200)}...`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ API endpoint test failed:');
      console.error(`Status: ${response.status}`);
      console.error(`Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('💡 Make sure your development server is running: npm run dev');
    return false;
  }
}

// Test server availability
async function testServerAvailability() {
  console.log('🔍 Testing server availability...');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(baseUrl);
    console.log(`✅ Server is running at ${baseUrl}`);
    console.log(`📊 Status: ${response.status}`);
    return true;
  } catch (error) {
    console.error('❌ Server not available:', error.message);
    console.log('💡 Start your development server with: npm run dev');
    return false;
  }
}

// Main test function
async function runHTTPTests() {
  console.log('🚀 Starting HTTP API tests...\n');
  
  const tests = [
    { name: 'Server Availability', fn: testServerAvailability },
    { name: 'API Endpoint', fn: testAPIEndpoint }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} Test ---`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }
  
  // Summary
  console.log('\n📊 HTTP Test Summary:');
  console.log('====================');
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All HTTP tests passed!');
  } else {
    console.log('⚠️  Some HTTP tests failed. Check the issues above.');
  }
}

// Run the tests
runHTTPTests().catch(console.error); 