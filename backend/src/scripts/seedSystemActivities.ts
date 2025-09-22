import mongoose from 'mongoose';
import { SystemActivityModel } from '../models/SystemActivity';
import { ActivityType } from '../types';
import { Logger } from '../utils/Logger';

const logger = new Logger();

async function seedSystemActivities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fhg');
    logger.info('Connected to MongoDB');

    // Clear existing system activities
    await SystemActivityModel.deleteMany({});
    logger.info('Cleared existing system activities');

    // Create sample system activities
    const sampleActivities = [
      {
        type: ActivityType.SYSTEM_ERROR,
        title: 'Database Connection Timeout',
        description: 'Temporary database connection timeout occurred during peak hours. Connection was restored automatically.',
        severity: 'high' as const,
        category: 'error' as const,
        source: 'database',
        metadata: {
          errorCode: 'DB_TIMEOUT_001',
          affectedServices: ['api', 'auth'],
          duration: '2 minutes'
        },
        resolved: true,
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        resolvedBy: 'system',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        type: ActivityType.SYSTEM_MAINTENANCE,
        title: 'Scheduled Database Maintenance',
        description: 'Routine database maintenance completed successfully. Performance optimizations applied.',
        severity: 'medium' as const,
        category: 'maintenance' as const,
        source: 'scheduler',
        metadata: {
          maintenanceType: 'performance_optimization',
          duration: '45 minutes',
          affectedTables: ['users', 'campaigns', 'activities']
        },
        resolved: true,
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        resolvedBy: 'admin',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000) // 1 day ago
      },
      {
        type: ActivityType.SYSTEM_BACKUP,
        title: 'Daily Backup Completed',
        description: 'Automated daily backup process completed successfully. All critical data backed up to secure storage.',
        severity: 'low' as const,
        category: 'backup' as const,
        source: 'backup_service',
        metadata: {
          backupSize: '2.3 GB',
          backupLocation: 'secure_storage_01',
          compressionRatio: '0.65'
        },
        resolved: true,
        resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        resolvedBy: 'system',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        type: ActivityType.SECURITY_LOGIN_FAILED,
        title: 'Multiple Failed Login Attempts',
        description: 'Detected multiple failed login attempts from suspicious IP address. Account temporarily locked.',
        severity: 'high' as const,
        category: 'security' as const,
        source: 'security_monitor',
        metadata: {
          ipAddress: '192.168.1.100',
          attempts: 5,
          timeWindow: '10 minutes',
          action: 'account_locked'
        },
        resolved: true,
        resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        resolvedBy: 'security_system',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        type: ActivityType.SYSTEM_ERROR,
        title: 'API Rate Limit Exceeded',
        description: 'API rate limit exceeded for multiple endpoints. Temporary throttling applied.',
        severity: 'medium' as const,
        category: 'performance' as const,
        source: 'api_gateway',
        metadata: {
          affectedEndpoints: ['/api/campaigns', '/api/users'],
          requestCount: 1500,
          timeWindow: '1 hour',
          throttlingDuration: '30 minutes'
        },
        resolved: true,
        resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        resolvedBy: 'system',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        type: ActivityType.SYSTEM_MAINTENANCE,
        title: 'Server Restart Required',
        description: 'Server restart completed successfully after applying security patches.',
        severity: 'medium' as const,
        category: 'maintenance' as const,
        source: 'system_admin',
        metadata: {
          patchVersion: 'v2.1.3',
          restartDuration: '3 minutes',
          affectedServices: ['web', 'api', 'worker']
        },
        resolved: true,
        resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        resolvedBy: 'admin',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        type: ActivityType.SYSTEM_ERROR,
        title: 'Memory Usage Alert',
        description: 'High memory usage detected on primary server. Automatic cleanup initiated.',
        severity: 'high' as const,
        category: 'performance' as const,
        source: 'monitoring_system',
        metadata: {
          memoryUsage: '85%',
          threshold: '80%',
          cleanupActions: ['cache_clear', 'garbage_collection']
        },
        resolved: true,
        resolvedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        resolvedBy: 'system',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      },
      {
        type: ActivityType.SYSTEM_BACKUP,
        title: 'Weekly Full Backup',
        description: 'Weekly full system backup completed successfully. All data verified and stored.',
        severity: 'low' as const,
        category: 'backup' as const,
        source: 'backup_service',
        metadata: {
          backupSize: '15.7 GB',
          backupLocation: 'secure_storage_02',
          verificationStatus: 'passed'
        },
        resolved: true,
        resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        resolvedBy: 'system',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    // Insert sample activities
    const createdActivities = await SystemActivityModel.insertMany(sampleActivities);
    logger.info(`Created ${createdActivities.length} system activities`);

    // Log summary
    const stats = await SystemActivityModel.getSystemActivityStats(7);
    logger.info('System activity statistics:', stats);

    logger.info('System activities seeded successfully');
  } catch (error) {
    logger.error('Error seeding system activities:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedSystemActivities()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedSystemActivities };
