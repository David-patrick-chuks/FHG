#!/usr/bin/env tsx

/**
 * Database Cleanup Script
 * 
 * This script clears all data from the database collections.
 * Use with caution as this action is irreversible.
 * 
 * Usage: npm run clear-db
 */

import dotenv from 'dotenv';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { Logger } from '../utils/Logger';

// Load environment variables
dotenv.config();

// Import all models to ensure they are registered with mongoose
import '../models/Activity';
import '../models/AdminAction';
import '../models/Bot';
import '../models/Campaign';
import '../models/EmailExtractor';
import '../models/QueueJob';
import '../models/SentEmail';
import '../models/Subscription';
import '../models/User';

const logger = new Logger();

/**
 * List of all collections to clear
 */
const COLLECTIONS_TO_CLEAR = [
  'users',
  'bots',
  'campaigns',
  'activities',
  'adminactions',
  'emailextractors',
  'queuejobs',
  'sentemails',
  'subscriptions'
];

/**
 * Clear all data from the database
 */
async function clearDatabase(): Promise<void> {
  const dbConnection = new DatabaseConnection();
  
  try {
    logger.info('🚀 Starting database cleanup...');
    
    // Connect to database
    await dbConnection.connect();
    
    if (!dbConnection.isConnected()) {
      throw new Error('Failed to connect to database');
    }
    
    const connection = dbConnection.getConnection();
    if (!connection) {
      throw new Error('Database connection not available');
    }
    
    logger.info('✅ Connected to database successfully');
    
    // Get all collections in the database
    const db = connection.db;
    if (!db) {
      throw new Error('Database instance not available');
    }
    
    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map(col => col.name);
    
    logger.info(`📊 Found ${collectionNames.length} collections in database`);
    
    // Clear each collection
    let totalDeleted = 0;
    
    for (const collectionName of COLLECTIONS_TO_CLEAR) {
      try {
        if (collectionNames.includes(collectionName)) {
          const collection = db.collection(collectionName);
          const result = await collection.deleteMany({});
          
          logger.info(`🗑️  Cleared ${result.deletedCount} documents from '${collectionName}' collection`);
          totalDeleted += result.deletedCount;
        } else {
          logger.info(`ℹ️  Collection '${collectionName}' does not exist, skipping`);
        }
      } catch (error) {
        logger.error(`❌ Error clearing collection '${collectionName}':`, error);
      }
    }
    
    // Clear any other collections that might exist (optional)
    const otherCollections = collectionNames.filter(name => !COLLECTIONS_TO_CLEAR.includes(name));
    if (otherCollections.length > 0) {
      logger.info(`ℹ️  Found ${otherCollections.length} additional collections: ${otherCollections.join(', ')}`);
      
      for (const collectionName of otherCollections) {
        try {
          const collection = db.collection(collectionName);
          const result = await collection.deleteMany({});
          
          logger.info(`🗑️  Cleared ${result.deletedCount} documents from '${collectionName}' collection`);
          totalDeleted += result.deletedCount;
        } catch (error) {
          logger.error(`❌ Error clearing additional collection '${collectionName}':`, error);
        }
      }
    }
    
    logger.info(`🎉 Database cleanup completed successfully!`);
    logger.info(`📈 Total documents deleted: ${totalDeleted}`);
    
  } catch (error) {
    logger.error('💥 Database cleanup failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    try {
      await dbConnection.disconnect();
      logger.info('🔌 Disconnected from database');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
  }
}

/**
 * Confirmation prompt for safety
 */
async function confirmAction(): Promise<boolean> {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('⚠️  WARNING: This will delete ALL data from the database. Are you sure? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    logger.info('🔧 Database Cleanup Script');
    logger.info('========================');
    
    // Check if we're in production
    if (process.env.NODE_ENV === 'production') {
      logger.error('❌ This script cannot be run in production environment!');
      process.exit(1);
    }
    
    // Show database connection info
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/email-outreach-bot';
    logger.info(`📡 Database URI: ${dbUri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
    
    // Confirm action
    const confirmed = await confirmAction();
    if (!confirmed) {
      logger.info('❌ Operation cancelled by user');
      process.exit(0);
    }
    
    // Execute cleanup
    await clearDatabase();
    
  } catch (error) {
    logger.error('💥 Script execution failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    logger.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

export { clearDatabase };

