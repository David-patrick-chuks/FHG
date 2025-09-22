import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { IncidentService } from '../services/IncidentService';
import { Logger } from '../utils/Logger';

dotenv.config();

const logger = new Logger();

async function seedIncidents() {
  logger.info('Starting incident seeding...');

  const uri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/email-outreach-bot';

  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected for incident seeding.');

    // Create sample incidents
    const sampleIncidents = [
      {
        title: 'Email Service Degradation',
        description: 'Users experiencing delays in email delivery due to high server load during peak hours.',
        impact: 'major' as const,
        affectedServices: ['Email Service', 'SMTP Gateway'],
        initialMessage: 'We are investigating reports of email delivery delays affecting multiple users.'
      },
      {
        title: 'Database Connection Timeouts',
        description: 'Intermittent database connection timeouts causing application errors for some users.',
        impact: 'critical' as const,
        affectedServices: ['Database', 'API Service', 'User Management'],
        initialMessage: 'We are experiencing database connectivity issues and are working to resolve them.'
      },
      {
        title: 'Payment Processing Delays',
        description: 'Payment gateway experiencing 30-60 second delays in processing transactions.',
        impact: 'major' as const,
        affectedServices: ['Payment Service', 'Subscription Management'],
        initialMessage: 'We are investigating payment processing delays with our payment provider.'
      },
      {
        title: 'API Rate Limiting Issues',
        description: 'Some users hitting rate limits unexpectedly due to increased API usage.',
        impact: 'minor' as const,
        affectedServices: ['API Gateway', 'Rate Limiting Service'],
        initialMessage: 'We are monitoring API rate limiting and adjusting thresholds as needed.'
      },
      {
        title: 'Scheduled Maintenance Window',
        description: 'Planned maintenance to upgrade database infrastructure and improve performance.',
        impact: 'minor' as const,
        affectedServices: ['Database', 'Application Server'],
        initialMessage: 'Scheduled maintenance window to upgrade our database infrastructure.'
      }
    ];

    logger.info(`Creating ${sampleIncidents.length} sample incidents...`);

    for (const incidentData of sampleIncidents) {
      try {
        const result = await IncidentService.createIncident(incidentData);
        if (result.success) {
          logger.info(`Created incident: ${incidentData.title}`);
          
          // Add some updates to make it more realistic
          if (result.data) {
            const incidentId = result.data._id;
            
            // Add investigation update
            await IncidentService.updateIncident(incidentId, {
              message: 'Our team is actively investigating the root cause of this issue.',
              status: 'investigating',
              author: 'system'
            });

            // Add identification update for some incidents
            if (incidentData.impact === 'critical' || incidentData.impact === 'major') {
              await IncidentService.updateIncident(incidentId, {
                message: 'Root cause identified. Implementing fix and monitoring progress.',
                status: 'identified',
                author: 'admin'
              });

              // Resolve some incidents
              if (incidentData.title.includes('Maintenance')) {
                await IncidentService.resolveIncident(incidentId, 'admin');
              }
            }
          }
        } else {
          logger.error(`Failed to create incident: ${incidentData.title}`, result.message);
        }
      } catch (error) {
        logger.error(`Error creating incident ${incidentData.title}:`, error);
      }
    }

    logger.info('Incident seeding completed successfully.');

  } catch (error) {
    logger.error('Error during incident seeding:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected.');
  }
}

seedIncidents();
