'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from './CodeBlock';

interface ApiDocsExamplesProps {
  searchQuery: string;
  activeExample?: string;
}

export function ApiDocsExamples({ searchQuery, activeExample }: ApiDocsExamplesProps) {
  const curlExampleCode = `curl -X POST "https://your-domain.com/api/v1/extract" \\
  -H "Authorization: Bearer fhg_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "urls": ["https://example.com"],
    "extractionType": "multiple"
  }'`;

  const jsExampleCode = `const response = await fetch('https://your-domain.com/api/v1/extract', {
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
const statusResponse = await fetch(\`https://your-domain.com/api/v1/extract/\${data.data.jobId}\`, {
  headers: {
    'Authorization': 'Bearer fhg_your_api_key_here'
  }
});

const statusData = await statusResponse.json();
console.log('Results:', statusData.data.results);`;

  const pythonExampleCode = `import requests

# Start extraction
response = requests.post(
    'https://your-domain.com/api/v1/extract',
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
    f'https://your-domain.com/api/v1/extract/{job_id}',
    headers={'Authorization': 'Bearer fhg_your_api_key_here'}
)

status_data = status_response.json()
print(f'Results: {status_data["data"]["results"]}')`;

  const isVisible = (text: string) => 
    !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());

  if (!isVisible('curl javascript python examples')) {
    return <div className="text-center py-8 text-gray-500">No matching content found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* cURL Example */}
      {isVisible('curl') && (
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
      )}

      {/* JavaScript Example */}
      {isVisible('javascript') && (
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
      )}

      {/* Python Example */}
      {isVisible('python') && (
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
      )}
    </div>
  );
}
