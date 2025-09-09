'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from './CodeBlock';

interface ApiDocsExamplesProps {
  searchQuery: string;
  activeExample?: string;
}

export function ApiDocsExamples({ searchQuery, activeExample }: ApiDocsExamplesProps) {
  const curlExampleCode = `curl -X POST "https://backend.agentworld.online/api/v1/extract" \\
  -H "Authorization: Bearer fhg_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "urls": ["https://example.com"],
    "extractionType": "multiple"
  }'`;

  const jsExampleCode = `const response = await fetch('https://backend.agentworld.online/api/v1/extract', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer fhg_your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    urls: ['https://example.com'],
    extractionType: 'multiple'
  })
});

const data = await response.json();
console.log('Job ID:', data.data.jobId);

// Check status
const statusResponse = await fetch(\`https://backend.agentworld.online/api/v1/extract/\${data.data.jobId}\`, {
  headers: {
    'Authorization': 'Bearer fhg_your_api_key_here'
  }
});

const statusData = await statusResponse.json();
console.log('Results:', statusData.data.results);`;

  const pythonExampleCode = `import requests

# Start extraction
response = requests.post(
    'https://backend.agentworld.online/api/v1/extract',
    headers={
        'Authorization': 'Bearer fhg_your_api_key_here',
        'Content-Type': 'application/json'
    },
    json={
        'urls': ['https://example.com'],
        'extractionType': 'multiple'
    }
)

data = response.json()
job_id = data['data']['jobId']
print(f'Job ID: {job_id}')

# Check status
status_response = requests.get(
    f'https://backend.agentworld.online/api/v1/extract/{job_id}',
    headers={'Authorization': 'Bearer fhg_your_api_key_here'}
)

status_data = status_response.json()
print(f'Results: {status_data["data"]["results"]}')`;

  const isVisible = (text: string) => 
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());

  if (!isVisible('curl javascript python examples')) {
    return <div className="text-center py-8 text-gray-500">No matching content found.</div>;
  }

  const renderExample = () => {
    switch (activeExample) {
      case 'curl':
        return (
          <Card>
            <CardHeader>
              <CardTitle>cURL Example</CardTitle>
              <CardDescription>
                Extract emails using cURL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={curlExampleCode}
                language="bash"
                id="curl-example"
              />
            </CardContent>
          </Card>
        );
      case 'javascript':
        return (
          <Card>
            <CardHeader>
              <CardTitle>JavaScript Example</CardTitle>
              <CardDescription>
                Extract emails using JavaScript/Node.js
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={jsExampleCode}
                language="javascript"
                id="js-example"
              />
            </CardContent>
          </Card>
        );
      case 'python':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Python Example</CardTitle>
              <CardDescription>
                Extract emails using Python
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={pythonExampleCode}
                language="python"
                id="python-example"
              />
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
                <CardDescription>
                  Choose a programming language to see code examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2">cURL</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Command line examples
                    </p>
                    <button 
                      onClick={() => window.location.hash = 'curl'}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      View Example →
                    </button>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2">JavaScript</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Node.js and browser examples
                    </p>
                    <button 
                      onClick={() => window.location.hash = 'javascript'}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      View Example →
                    </button>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Python</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Python requests examples
                    </p>
                    <button 
                      onClick={() => window.location.hash = 'python'}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      View Example →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderExample()}
    </div>
  );
}
