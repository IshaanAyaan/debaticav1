const fs = require('fs');
const path = require('path');

// Simple test to check if the prompt file exists
async function testPromptFile() {
  console.log('🧪 Testing prompt file loading...');
  
  const promptPath = path.join(process.cwd(), 'prompts', 'extemp.md');
  
  try {
    const content = await fs.promises.readFile(promptPath, 'utf-8');
    console.log('✅ Prompt file loaded successfully!');
    console.log(`📄 File size: ${content.length} characters`);
    console.log(`📁 File path: ${promptPath}`);
    return true;
  } catch (error) {
    console.error('❌ Error loading prompt file:', error.message);
    return false;
  }
}

// Test environment variables
function testEnvironmentVariables() {
  console.log('\n🔧 Testing environment variables...');
  
  const requiredVars = ['GOOGLE_API_KEY', 'OPENAI_API_KEY'];
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set (${process.env[varName].substring(0, 10)}...)`);
    } else {
      console.log(`❌ ${varName}: Not set`);
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.log(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.log('💡 Make sure to set these in your .env.local file');
  }
  
  return missing.length === 0;
}

// Test LLM router directly
async function testLLMRouter() {
  console.log('\n🤖 Testing LLM router...');
  
  try {
    // Import the router module
    const { runLLM } = require('./lib/llm/router');
    
    // Test with a simple prompt
    const testPrompt = fs.readFileSync(path.join(process.cwd(), 'prompts', 'extemp.md'), 'utf-8');
    
    const result = await runLLM({
      mode: 'light',
      systemPrompt: testPrompt,
      userInput: 'Test question: What is the impact of social media on democracy?',
      stream: false
    });
    
    console.log('✅ LLM router test successful!');
    console.log(`📝 Response length: ${result.content.length} characters`);
    console.log(`⏱️  Latency: ${result.latency}ms`);
    return true;
  } catch (error) {
    console.error('❌ LLM router test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  const tests = [
    { name: 'Prompt File', fn: testPromptFile },
    { name: 'Environment Variables', fn: testEnvironmentVariables },
    { name: 'LLM Router', fn: testLLMRouter }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} Test ---`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All tests passed! Your API should be working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the issues above.');
  }
}

// Run the tests
runTests().catch(console.error); 