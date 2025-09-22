import { DatabaseConnection } from '../database/DatabaseConnection';
import { IncidentService } from '../services/IncidentService';
import { Logger } from '../utils/Logger';

const logger = new Logger();

async function initializeSampleIncidents() {
  try {
    logger.info('Initializing sample incidents...');
    
    // Connect to database
    const database = DatabaseConnection.getInstance();
    await database.connect();
    
    // Create sample incidents
    await IncidentService.createSampleIncidents();
    
    logger.info('Sample incidents initialized successfully');
    
    // Close database connection
    await database.disconnect();
    
    process.exit(0);
  } catch (error) {
    logger.error('Failed to initialize sample incidents:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeSampleIncidents();
