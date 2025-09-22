import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { IncidentService } from '../services/IncidentService';
import { SystemActivityLogger } from '../services/SystemActivityLogger';
import { Logger } from '../utils/Logger';

dotenv.config();

const logger = new Logger();

async function testIncidentDuplicatePrevention() {
  logger.info('Starting incident duplicate prevention test...');

  const uri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/email-outreach-bot';

  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected for testing.');

    // Test 1: Create initial incident
    logger.info('Test 1: Creating initial incident...');
    const result1 = await SystemActivityLogger.logCriticalError(
      'Database Connection Lost',
      'Primary database connection failed, affecting all users',
      'database',
      { errorCode: 'DB001', service: 'MongoDB' }
    );
    logger.info('Initial incident result:', result1);

    // Test 2: Try to create duplicate with same title (should be prevented)
    logger.info('Test 2: Attempting to create duplicate incident with same title...');
    const result2 = await SystemActivityLogger.logCriticalError(
      'Database Connection Lost',
      'Primary database connection failed again, affecting all users',
      'database',
      { errorCode: 'DB001', service: 'MongoDB' }
    );
    logger.info('Duplicate incident result:', result2);

    // Test 3: Try to create similar incident with different message (should be prevented)
    logger.info('Test 3: Attempting to create similar incident with different message...');
    const result3 = await SystemActivityLogger.logCriticalError(
      'Database Connection Failed',
      'Database connection timeout occurred, affecting multiple users',
      'database',
      { errorCode: 'DB002', service: 'MongoDB' }
    );
    logger.info('Similar incident result:', result3);

    // Test 4: Try to create incident with different error type (should be allowed)
    logger.info('Test 4: Creating incident with different error type...');
    const result4 = await SystemActivityLogger.logCriticalError(
      'Email Service Down',
      'SMTP service is completely unreachable',
      'email-service',
      { errorCode: 'SMTP001', service: 'SMTP' }
    );
    logger.info('Different error type result:', result4);

    // Test 5: Test rate limiting - rapid successive calls
    logger.info('Test 5: Testing rate limiting with rapid successive calls...');
    const rapidCalls = [];
    for (let i = 0; i < 3; i++) {
      rapidCalls.push(
        SystemActivityLogger.logCriticalError(
          'Rate Limit Test',
          `Rate limit test call ${i + 1}`,
          'test-service',
          { testCall: i + 1 }
        )
      );
    }
    
    const rapidResults = await Promise.all(rapidCalls);
    rapidResults.forEach((result, index) => {
      logger.info(`Rapid call ${index + 1} result:`, result);
    });

    // Test 6: Test with different severity levels
    logger.info('Test 6: Testing different severity levels...');
    
    // High severity (should create incident)
    const highResult = await SystemActivityLogger.logSystemEvent(
      'SYSTEM_ERROR' as any,
      'High Severity Test',
      'This is a high severity test',
      'high',
      'test-service',
      { severity: 'high' }
    );
    logger.info('High severity result:', highResult);

    // Medium severity (should NOT create incident)
    const mediumResult = await SystemActivityLogger.logSystemEvent(
      'SYSTEM_ERROR' as any,
      'Medium Severity Test',
      'This is a medium severity test',
      'medium',
      'test-service',
      { severity: 'medium' }
    );
    logger.info('Medium severity result:', mediumResult);

    // Test 7: Test with resolved incident (should allow new incident)
    logger.info('Test 7: Testing with resolved incident...');
    
    // First, get the first incident and resolve it
    const incidents = await IncidentService.getAllIncidents();
    if (incidents.success && incidents.data && incidents.data.length > 0) {
      const firstIncident = incidents.data[0];
      logger.info('Resolving first incident...');
      const resolveResult = await IncidentService.resolveIncident(firstIncident._id, 'test-user');
      logger.info('Resolve result:', resolveResult);

      // Now try to create similar incident (should be allowed since previous is resolved)
      const newResult = await SystemActivityLogger.logCriticalError(
        'Database Connection Lost',
        'Database connection failed again after resolution',
        'database',
        { errorCode: 'DB003', service: 'MongoDB' }
      );
      logger.info('New incident after resolution result:', newResult);
    }

    logger.info('Incident duplicate prevention test completed successfully!');

  } catch (error) {
    logger.error('Error during incident duplicate prevention test:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected.');
  }
}

testIncidentDuplicatePrevention();
