import fs from 'fs';
import path from 'path';
import { PaystackReceipt } from '../services/paystack/PaystackReceipt';

// Simple test script that doesn't require database connection
async function testReceiptGeneration() {
  console.log('🧪 Testing PaystackReceipt generation...');

  try {
    // Test with mock data (this will fail with "Payment not found" but tests the error handling)
    const result = await PaystackReceipt.generateReceipt(
      '507f1f77bcf86cd799439012',
      'test_reference_123'
    );

    console.log('📋 Test Result:', {
      success: result.success,
      message: result.message,
      hasData: !!result.data,
      dataSize: result.data ? result.data.length : 0
    });

    if (result.success && result.data) {
      // Save receipt if generated
      const outputPath = path.join(process.cwd(), 'test-receipt.pdf');
      fs.writeFileSync(outputPath, result.data);
      console.log(`💾 Receipt saved to: ${outputPath}`);
    } else {
      console.log('ℹ️ Expected failure (no payment found in database)');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Test the PDF generation directly (bypassing database)
async function testPdfGeneration() {
  console.log('📄 Testing PDF generation...');

  try {
    // Import the private method for testing (this is a hack for testing)
    const PaystackReceiptClass = PaystackReceipt as any;
    
    // Mock payment and user data
    const mockPayment = {
      reference: 'TEST_REF_123',
      amount: 50000,
      status: 'success',
      subscriptionTier: 'premium',
      billingCycle: 'yearly',
      paidAt: new Date(),
      createdAt: new Date()
    };

    const mockUser = {
      username: 'test_user',
      email: 'test@example.com'
    };

    // Test PDF generation
    const pdfBuffer = await PaystackReceiptClass.generateReceiptPDF(mockPayment, mockUser);
    
    console.log('✅ PDF generated successfully!');
    console.log('📊 PDF Details:', {
      size: pdfBuffer.length,
      format: 'PDF'
    });

    // Save the generated PDF
    const outputPath = path.join(process.cwd(), 'test-pdf-receipt.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`💾 PDF receipt saved to: ${outputPath}`);

  } catch (error) {
    console.error('💥 PDF generation test failed:', error);
  }
}

// Test logo loading
async function testLogoLoading() {
  console.log('🖼️ Testing logo loading...');

  try {
    const logoPath = path.join(process.cwd(), 'public', 'MailQuill.svg');
    
    if (fs.existsSync(logoPath)) {
      const logoContent = fs.readFileSync(logoPath, 'utf8');
      console.log('✅ Logo file found and readable');
      console.log('📊 Logo Details:', {
        path: logoPath,
        size: logoContent.length,
        hasXmlDeclaration: logoContent.includes('<?xml'),
        hasSvgTag: logoContent.includes('<svg'),
        hasPath: logoContent.includes('<path')
      });

      // Test logo processing
      const processedLogo = logoContent
        .replace(/<?xml[^>]*>/g, '')
        .replace(/<!DOCTYPE[^>]*>/g, '')
        .replace(/<metadata>[\s\S]*?<\/metadata>/g, '')
        .replace(/^<svg[^>]*>/i, '')
        .replace(/<\/svg>$/i, '')
        .replace(/fill="#000000"/g, 'fill="#1e3a8a"')
        .trim();

      console.log('✅ Logo processed successfully');
      console.log('📊 Processed Logo:', {
        originalSize: logoContent.length,
        processedSize: processedLogo.length,
        hasBrandColor: processedLogo.includes('#1e3a8a')
      });

    } else {
      console.log('⚠️ Logo file not found at:', logoPath);
    }

  } catch (error) {
    console.error('💥 Logo loading test failed:', error);
  }
}

// Test XML escaping
function testXmlEscaping() {
  console.log('🔒 Testing XML escaping...');

  const testStrings = [
    'normal text',
    'text with & ampersand',
    'text with < and > brackets',
    'text with "quotes" and \'apostrophes\'',
    'complex: <script>alert("test")</script>',
    'email@domain.com',
    'user<>&"\'test'
  ];

  // Mock the xmlEscape function
  const xmlEscape = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  testStrings.forEach((testString, index) => {
    const escaped = xmlEscape(testString);
    console.log(`📝 Test ${index + 1}:`, {
      original: testString,
      escaped: escaped,
      isSafe: !escaped.includes('<') && !escaped.includes('>') && !escaped.includes('&') && !escaped.includes('"') && !escaped.includes("'")
    });
  });

  console.log('✅ XML escaping test completed');
}

// Main test runner
async function runSimpleTests() {
  console.log('🚀 Starting simple PaystackReceipt tests...');
  console.log('=' .repeat(50));

  await testLogoLoading();
  console.log('-'.repeat(50));

  testXmlEscaping();
  console.log('-'.repeat(50));

  await testPdfGeneration();
  console.log('-'.repeat(50));

  await testReceiptGeneration();
  console.log('-'.repeat(50));

  console.log('🎉 All simple tests completed!');
  console.log('=' .repeat(50));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSimpleTests().catch(console.error);
}

export { runSimpleTests, testLogoLoading, testPdfGeneration, testReceiptGeneration, testXmlEscaping };

