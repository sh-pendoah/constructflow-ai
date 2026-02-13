/**
 * Azure Integration Test
 * Validates that Azure OpenAI and Azure Document Intelligence are properly configured
 */

async function testAzureOpenAI() {
  console.log('🧪 Testing Azure OpenAI Connection...');

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION || '2025-03-01-preview';

  if (!endpoint || !apiKey || !deployment) {
    console.error('❌ Azure OpenAI credentials not configured');
    return false;
  }

  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Deployment: ${deployment}`);
  console.log(`   API Version: ${apiVersion}`);

  try {
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content:
              'Extract the following data as JSON: Invoice number INV-12345, date 2024-01-15, total $1,234.56',
          },
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(
        `❌ Azure OpenAI API error: ${response.status} ${response.statusText}`
      );
      console.error(`   Response: ${error}`);
      return false;
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      console.log('✅ Azure OpenAI responding successfully');
      console.log(`   Response preview: ${content.substring(0, 100)}...`);
      return true;
    } else {
      console.error('❌ Azure OpenAI returned empty response');
      return false;
    }
  } catch (error) {
    console.error('❌ Azure OpenAI connection failed:', error);
    return false;
  }
}

async function testAzureDocumentIntelligence() {
  console.log('\n🧪 Testing Azure Document Intelligence...');

  const endpoint =
    process.env.AZURE_FORM_RECOGNIZER_ENDPOINT ||
    process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const apiKey =
    process.env.AZURE_FORM_RECOGNIZER_API_KEY ||
    process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY;

  if (!endpoint || !apiKey) {
    console.error('❌ Azure Document Intelligence credentials not configured');
    return false;
  }

  console.log(`   Endpoint: ${endpoint}`);

  try {
    // Just check if the endpoint is accessible
    const infoUrl = `${endpoint}/formrecognizer/documentModels?api-version=2024-11-30`;

    const response = await fetch(infoUrl, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });

    if (!response.ok) {
      console.error(
        `❌ Azure Document Intelligence API error: ${response.status} ${response.statusText}`
      );
      return false;
    }

    console.log('✅ Azure Document Intelligence accessible');
    return true;
  } catch (error) {
    console.error('❌ Azure Document Intelligence connection failed:', error);
    return false;
  }
}

async function testAzureBlobStorage() {
  console.log('\n🧪 Testing Azure Blob Storage...');

  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const container = process.env.AZURE_STORAGE_CONTAINER;

  if (!accountName || !connectionString || !container) {
    console.warn('⚠️  Azure Blob Storage not fully configured (optional)');
    return true; // Not critical
  }

  console.log(`   Account: ${accountName}`);
  console.log(`   Container: ${container}`);
  console.log('✅ Azure Blob Storage configured');

  return true;
}

async function testAPIHealth() {
  console.log('\n🧪 Testing API Health...');

  try {
    const response = await fetch('http://localhost:3000/api/health');

    if (!response.ok) {
      console.error(`❌ API health check failed: ${response.status}`);
      return false;
    }

    const data = (await response.json()) as any;
    console.log('✅ API is healthy');
    console.log(`   Status: ${data.status}`);
    console.log(`   MongoDB: ${data.mongodb}`);
    console.log(`   Redis: ${data.redis}`);

    return data.status === 'ok';
  } catch (error) {
    console.error('❌ API health check failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   Worklighter Azure Integration Tests');
  console.log('═══════════════════════════════════════════════════════\n');

  const results = {
    api: await testAPIHealth(),
    openai: await testAzureOpenAI(),
    documentIntelligence: await testAzureDocumentIntelligence(),
    blobStorage: await testAzureBlobStorage(),
  };

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   Test Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log(
    `   API Health:             ${results.api ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log(
    `   Azure OpenAI:           ${results.openai ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log(
    `   Document Intelligence:  ${results.documentIntelligence ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log(
    `   Blob Storage:           ${results.blobStorage ? '✅ PASS' : '❌ FAIL'}`
  );
  console.log('═══════════════════════════════════════════════════════\n');

  const allPassed = Object.values(results).every((r) => r === true);

  if (allPassed) {
    console.log('✅ All Azure integration tests PASSED');
    process.exit(0);
  } else {
    console.log('❌ Some Azure integration tests FAILED');
    process.exit(1);
  }
}

runTests();
