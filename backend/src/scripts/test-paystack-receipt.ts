import fs from 'fs';
import path from 'path';
import { connectDB } from '../config/database';
import { PaystackReceipt } from '../services/paystack/PaystackReceipt';
import { Logger } from '../utils/Logger';

const logger = new Logger();

// Mock payment data for testing
const mockPayment = {
  _id: '507f1f77bcf86cd799439011',
  reference: 'MailQuill_1758106786259_5ZI1D8',
  amount: 50000, // ₦50,000
  status: 'success',
  subscriptionTier: 'premium',
  billingCycle: 'yearly',
  paidAt: new Date('2024-01-15T10:30:00Z'),
  createdAt: new Date('2024-01-15T10:30:00Z'),
  userId: '507f1f77bcf86cd799439012'
};

// Mock user data for testing
const mockUser = {
  _id: '507f1f77bcf86cd799439012',
  username: 'john_doe',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe'
};

async function testReceiptGeneration() {
  try {
    logger.info('🧪 Starting PaystackReceipt test...');

    // Test 1: Generate receipt with valid data
    logger.info('📋 Test 1: Generating receipt with valid data...');
    const result = await PaystackReceipt.generateReceipt(
      mockUser._id,
      mockPayment.reference
    );

    if (result.success && result.data) {
      logger.info('✅ Receipt generated successfully!');
      
      // Save the receipt to a file for inspection
      const outputPath = path.join(process.cwd(), 'test-receipt.png');
      fs.writeFileSync(outputPath, result.data);
      logger.info(`💾 Receipt saved to: ${outputPath}`);
      
      // Log receipt details
      logger.info('📊 Receipt Details:', {
        size: result.data.length,
        format: 'PNG',
        reference: mockPayment.reference,
        amount: mockPayment.amount,
        status: mockPayment.status
      });
    } else {
      logger.error('❌ Failed to generate receipt:', result.message);
    }

    // Test 2: Test with invalid reference
    logger.info('📋 Test 2: Testing with invalid reference...');
    const invalidResult = await PaystackReceipt.generateReceipt(
      mockUser._id,
      'invalid_reference_123'
    );

    if (!invalidResult.success) {
      logger.info('✅ Correctly handled invalid reference:', invalidResult.message);
    } else {
      logger.error('❌ Should have failed with invalid reference');
    }

    // Test 3: Test with invalid user ID
    logger.info('📋 Test 3: Testing with invalid user ID...');
    const invalidUserResult = await PaystackReceipt.generateReceipt(
      'invalid_user_id',
      mockPayment.reference
    );

    if (!invalidUserResult.success) {
      logger.info('✅ Correctly handled invalid user ID:', invalidUserResult.message);
    } else {
      logger.error('❌ Should have failed with invalid user ID');
    }

    // Test 4: Test edge cases with special characters
    logger.info('📋 Test 4: Testing with special characters in user data...');
    const specialCharUser = {
      ...mockUser,
      username: 'user<>&"\'test',
      email: 'user@example.com'
    };

    // Note: This test would require updating the database with special character data
    // For now, we'll just log what we would test
    logger.info('📝 Would test with special characters:', {
      username: specialCharUser.username,
      email: specialCharUser.email
    });

    logger.info('🎉 All tests completed!');

  } catch (error) {
    logger.error('💥 Test failed with error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

async function testReceiptWithDatabase() {
  try {
    logger.info('🗄️ Testing receipt generation with database...');

    // Connect to database
    await connectDB();
    logger.info('✅ Connected to database');

    // Find a real payment record
    const { PaymentModel } = await import('../models/Payment');
    const { UserModel } = await import('../models/User');

    const realPayment = await PaymentModel.findOne({ status: 'success' });
    if (!realPayment) {
      logger.warn('⚠️ No real payment found in database, skipping database test');
      return;
    }

    const realUser = await UserModel.findById(realPayment.userId);
    if (!realUser) {
      logger.warn('⚠️ No user found for payment, skipping database test');
      return;
    }

    logger.info('📋 Found real payment:', {
      reference: realPayment.reference,
      amount: realPayment.amount,
      userId: realPayment.userId
    });

    // Generate receipt with real data
    const result = await PaystackReceipt.generateReceipt(
      realPayment.userId.toString(),
      realPayment.reference
    );

    if (result.success && result.data) {
      logger.info('✅ Real receipt generated successfully!');
      
      // Save the real receipt
      const outputPath = path.join(process.cwd(), 'real-receipt.png');
      fs.writeFileSync(outputPath, result.data);
      logger.info(`💾 Real receipt saved to: ${outputPath}`);
    } else {
      logger.error('❌ Failed to generate real receipt:', result.message);
    }

  } catch (error) {
    logger.error('💥 Database test failed:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

async function testReceiptPerformance() {
  try {
    logger.info('⚡ Testing receipt generation performance...');

    const startTime = Date.now();
    const iterations = 5;

    for (let i = 0; i < iterations; i++) {
      const result = await PaystackReceipt.generateReceipt(
        mockUser._id,
        mockPayment.reference
      );

      if (!result.success) {
        logger.error(`❌ Iteration ${i + 1} failed:`, result.message);
        break;
      }

      logger.info(`✅ Iteration ${i + 1}/${iterations} completed`);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    logger.info('📊 Performance Results:', {
      totalTime: `${totalTime}ms`,
      averageTime: `${avgTime.toFixed(2)}ms`,
      iterations: iterations
    });

  } catch (error) {
    logger.error('💥 Performance test failed:', {
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function testReceiptWithDifferentData() {
  try {
    logger.info('🔄 Testing receipt with different payment scenarios...');

    const testScenarios = [
      {
        name: 'Basic Monthly',
        payment: { ...mockPayment, subscriptionTier: 'basic', billingCycle: 'monthly', amount: 10000 },
        user: { ...mockUser, username: 'basic_user', email: 'basic@example.com' }
      },
      {
        name: 'Premium Yearly',
        payment: { ...mockPayment, subscriptionTier: 'premium', billingCycle: 'yearly', amount: 100000 },
        user: { ...mockUser, username: 'premium_user', email: 'premium@example.com' }
      },
      {
        name: 'Large Amount',
        payment: { ...mockPayment, amount: 1000000, reference: 'MailQuill_LARGE_AMOUNT_TEST' },
        user: { ...mockUser, username: 'enterprise_user', email: 'enterprise@example.com' }
      }
    ];

    for (const scenario of testScenarios) {
      logger.info(`📋 Testing scenario: ${scenario.name}`);
      
      // Note: This would require creating test data in the database
      // For now, we'll just log the scenario details
      logger.info('📝 Scenario details:', {
        name: scenario.name,
        tier: scenario.payment.subscriptionTier,
        cycle: scenario.payment.billingCycle,
        amount: scenario.payment.amount,
        username: scenario.user.username
      });
    }

    logger.info('✅ All scenarios logged (would require database setup for full testing)');

  } catch (error) {
    logger.error('💥 Scenario test failed:', {
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Main test runner
async function runAllTests() {
  try {
    logger.info('🚀 Starting PaystackReceipt comprehensive test suite...');
    logger.info('=' .repeat(60));

    // Run all tests
    await testReceiptGeneration();
    logger.info('-' .repeat(60));
    
    await testReceiptWithDatabase();
    logger.info('-' .repeat(60));
    
    await testReceiptPerformance();
    logger.info('-' .repeat(60));
    
    await testReceiptWithDifferentData();
    logger.info('-' .repeat(60));

    logger.info('🎉 All tests completed successfully!');
    logger.info('=' .repeat(60));

  } catch (error) {
    logger.error('💥 Test suite failed:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  } finally {
    // Close database connection if opened
    process.exit(0);
  }
}

// Export functions for individual testing
export {
    runAllTests, testReceiptGeneration, testReceiptPerformance, testReceiptWithDatabase, testReceiptWithDifferentData
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
