const { AIService } = require('./dist/services/AIService');

async function testAIService() {
  console.log('🤖 Testing AI Service...\n');

  // Mock template data
  const template = {
    name: "Sales Outreach Template",
    description: "Professional sales outreach for B2B companies",
    useCase: "Cold outreach to potential clients",
    variables: [
      { key: "company_name", value: "TechCorp", required: true },
      { key: "industry", value: "Technology", required: true },
      { key: "pain_point", value: "scalability challenges", required: true }
    ],
    samples: [
      {
        subject: "Quick question about {{company_name}}'s {{pain_point}}",
        body: `Hi there,

I noticed {{company_name}} is in the {{industry}} space, and I thought you might be interested in how our solution has helped similar companies increase their efficiency by 40%.

Our platform is specifically designed to address {{pain_point}} that many {{industry}} companies face.

Would you be open to a brief 15-minute call this week to discuss how this might apply to {{company_name}}?

Best regards`
      },
      {
        subject: "How we can help {{company_name}} scale",
        body: `Hello,

I've been following {{company_name}}'s growth in {{industry}}, and I'm impressed by your progress.

However, I've noticed that many {{industry}} companies struggle with {{pain_point}}. This often leads to decreased efficiency and higher costs.

Our solution was specifically designed to solve this exact challenge. We've helped 200+ companies in {{industry}} achieve their goals.

Would you be interested in a brief conversation about how we could help {{company_name}} overcome this challenge?

Best`
      }
    ]
  };

  // Mock recipient context
  const recipientContext = {
    email: "john.doe@techcorp.com",
    // name: "John Doe",
    // company: "TechCorp",
    // industry: "Technology"
  };

  try {
    console.log('📝 Template Info:');
    console.log(`- Name: ${template.name}`);
    console.log(`- Samples: ${template.samples.length}`);
    console.log(`- Variables: ${template.variables.length}`);
    console.log(`- Recipient:  (${recipientContext.email})\n`);

    // Test with different variation counts
    const testCases = [30];
    
    for (const variationCount of testCases) {
      console.log(`\n🔄 Testing with ${variationCount} variation(s)...`);
      console.log('=' .repeat(50));
      
      const startTime = Date.now();
      
      const result = await AIService.generateVariationsFromTemplate(
        template,
        recipientContext,
        variationCount
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (result.success && result.data) {
        console.log(`✅ Success! Generated ${result.data.length} variation(s) in ${duration}ms`);
        
        result.data.forEach((variation, index) => {
          console.log(`\n📧 Variation ${index + 1}:`);
          console.log(`Subject: ${variation.subject}`);
          console.log(`Body: ${variation.body.substring(0, 100)}...`);
        });
      } else {
        console.log(`❌ Failed: ${result.message || 'Unknown error'}`);
      }
      
      console.log('\n' + '-'.repeat(50));
    }

  } catch (error) {
    console.error('💥 Error testing AI service:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testAIService()
  .then(() => {
    console.log('\n🎉 Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
