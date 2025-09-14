import mongoose from 'mongoose';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { BotModel } from '../models/Bot';
import { CampaignModel } from '../models/Campaign';
import { UserModel } from '../models/User';
import { BillingCycle, CampaignStatus, SeedUserData, SubscriptionTier } from '../types';
import { Logger } from '../utils/Logger';

export class DataSeeder {
  private logger: Logger;
  private seedUsersData: SeedUserData[];

  constructor() {
    this.logger = new Logger();
    this.seedUsersData = [
  // Admin users
  {
    email: 'admin@emailoutreachbot.com',
    username: 'admin',
    password: 'Admin123!@#',
    subscription: SubscriptionTier.PREMIUM,
    billingCycle: BillingCycle.YEARLY,
    isAdmin: true,
    isActive: true
  },
  {
    email: 'superadmin@emailoutreachbot.com',
    username: 'superadmin',
    password: 'SuperAdmin123!@#',
    subscription: SubscriptionTier.PREMIUM,
    billingCycle: BillingCycle.YEARLY,
    isAdmin: true,
    isActive: true
  },
  {
    email: 'support@emailoutreachbot.com',
    username: 'support',
    password: 'Support123!@#',
    subscription: SubscriptionTier.PREMIUM,
    billingCycle: BillingCycle.YEARLY,
    isAdmin: true,
    isActive: true
  },
  // Regular users
  {
    email: 'demo@emailoutreachbot.com',
    username: 'demo',
    password: 'Demo123!@#',
    subscription: SubscriptionTier.BASIC,
    billingCycle: BillingCycle.MONTHLY,
    isAdmin: false,
    isActive: true
  },
  {
    email: 'test@emailoutreachbot.com',
    username: 'testuser',
    password: 'Test123!@#',
    subscription: SubscriptionTier.BASIC,
    billingCycle: BillingCycle.MONTHLY,
    isAdmin: false,
    isActive: true
  },
  {
    email: 'free@emailoutreachbot.com',
    username: 'freeuser',
    password: 'Free123!@#',
    subscription: SubscriptionTier.FREE,
    billingCycle: BillingCycle.MONTHLY,
    isAdmin: false,
    isActive: true
  }
    ];
  }

  public async seedUsers(): Promise<void> {
    try {
      this.logger.info('Starting user seeding process...');

      const User = UserModel.getInstance();

      for (const userData of this.seedUsersData) {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({
            $or: [
              { email: userData.email },
              { username: userData.username }
            ]
          });

          if (existingUser) {
            this.logger.info(`User already exists: ${userData.email}`);
            
            // Update existing user if needed
            if (userData.isAdmin && !existingUser.isAdmin) {
              existingUser.isAdmin = true;
              existingUser.subscription = userData.subscription;
              existingUser.billingCycle = userData.billingCycle;
              existingUser.isActive = true;
              existingUser.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
              await existingUser.save();
              this.logger.info(`Updated existing user to admin: ${userData.email}`);
            }
            continue;
          }

          // Create new user
          const user = new User({
            email: userData.email,
            username: userData.username,
            password: userData.password, // Pass plain text password - User model will hash it
            subscription: userData.subscription,
            billingCycle: userData.billingCycle,
            isAdmin: userData.isAdmin,
            isActive: userData.isActive,
            subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            lastLoginAt: new Date()
          });

          await user.save();
          this.logger.info(`User created successfully: ${userData.email}`);

          // Generate API key for admin users
          if (userData.isAdmin) {
            try {
              await user.generateApiKey();
              this.logger.info(`API key generated for admin: ${userData.email}`);
            } catch (apiKeyError) {
              this.logger.warn(`Failed to generate API key for admin ${userData.email}:`, apiKeyError);
            }
          }

        } catch (userError) {
          this.logger.error(`Error creating user ${userData.email}:`, userError);
        }
      }

      // Display created users
      const allUsers = await User.find({}).select('email username subscription isAdmin isActive createdAt');
      this.logger.info('Users in database:');
      allUsers.forEach(user => {
        this.logger.info(`- ${user.email} (${user.username}) - ${user.subscription} - Admin: ${user.isAdmin} - Active: ${user.isActive}`);
      });

      this.logger.info('User seeding completed successfully!');
      
    } catch (error) {
      this.logger.error('Error during user seeding:', error);
      throw error;
    }
  }

  public async seedBots(): Promise<void> {
    try {
      this.logger.info('Starting bot seeding process...');

      const User = UserModel.getInstance();
      const Bot = BotModel.getInstance();

      // Get demo user
      const demoUser = await User.findOne({ email: 'demo@emailoutreachbot.com' });
      if (!demoUser) {
        this.logger.warn('Demo user not found, skipping bot seeding');
        return;
      }

    const botData = [
      {
        name: 'Sales Outreach Bot',
        description: 'Automated sales outreach bot for lead generation',
        isActive: true,
        settings: {
          maxEmailsPerDay: 100,
          delayBetweenEmails: 30000,
          workingHours: {
            start: '09:00',
            end: '17:00',
            timezone: 'UTC'
          }
        }
      },
      {
        name: 'Follow-up Bot',
        description: 'Follow-up bot for nurturing leads',
        isActive: true,
        settings: {
          maxEmailsPerDay: 50,
          delayBetweenEmails: 60000,
          workingHours: {
            start: '10:00',
            end: '16:00',
            timezone: 'UTC'
          }
        }
      }
    ];

    for (const botInfo of botData) {
      try {
        // Check if bot already exists
        const existingBot = await Bot.findOne({
          userId: demoUser._id,
          name: botInfo.name
        });

        if (existingBot) {
          this.logger.info(`Bot already exists: ${botInfo.name}`);
          continue;
        }

        // Create new bot
        const bot = new Bot({
          userId: demoUser._id,
          name: botInfo.name,
          description: botInfo.description,
          isActive: botInfo.isActive,
          settings: botInfo.settings
        });

        await bot.save();
        this.logger.info(`Bot created successfully: ${botInfo.name}`);

      } catch (botError) {
        this.logger.error(`Error creating bot ${botInfo.name}:`, botError);
      }
    }

    this.logger.info('Bot seeding completed successfully!');
    
    } catch (error) {
      this.logger.error('Error during bot seeding:', error);
      throw error;
    }
  }

  public async seedCampaigns(): Promise<void> {
    try {
      this.logger.info('Starting campaign seeding process...');

      const User = UserModel.getInstance();
      const Bot = BotModel.getInstance();
      const Campaign = CampaignModel.getInstance();

      // Get demo user and their bots
      const demoUser = await User.findOne({ email: 'demo@emailoutreachbot.com' });
      if (!demoUser) {
        this.logger.warn('Demo user not found, skipping campaign seeding');
        return;
      }

      const userBots = await Bot.find({ userId: demoUser._id });
      if (userBots.length === 0) {
        this.logger.warn('No bots found for demo user, skipping campaign seeding');
        return;
      }

    const campaignData = [
      {
        name: 'Q1 Sales Campaign',
        description: 'Sales outreach campaign for Q1 leads',
        status: CampaignStatus.DRAFT,
        targetAudience: {
          emailList: ['lead1@example.com', 'lead2@example.com', 'lead3@example.com'],
          totalEmails: 3
        },
        aiConfiguration: {
          prompt: 'Write a professional sales email to introduce our product',
          messageVariations: 3
        }
      },
      {
        name: 'Product Demo Follow-up',
        description: 'Follow-up campaign for product demo attendees',
        status: CampaignStatus.PAUSED,
        targetAudience: {
          emailList: ['demo1@example.com', 'demo2@example.com'],
          totalEmails: 2
        },
        aiConfiguration: {
          prompt: 'Write a follow-up email after product demo',
          messageVariations: 2
        }
      }
    ];

    for (const campaignInfo of campaignData) {
      try {
        // Check if campaign already exists
        const existingCampaign = await Campaign.findOne({
          userId: demoUser._id,
          name: campaignInfo.name
        });

        if (existingCampaign) {
          this.logger.info(`Campaign already exists: ${campaignInfo.name}`);
          continue;
        }

        // Create new campaign
        const campaign = new Campaign({
          userId: demoUser._id,
          botId: userBots[0]._id, // Use first bot
          name: campaignInfo.name,
          description: campaignInfo.description,
          status: campaignInfo.status,
          targetAudience: campaignInfo.targetAudience,
          aiConfiguration: campaignInfo.aiConfiguration
        });

        await campaign.save();
        this.logger.info(`Campaign created successfully: ${campaignInfo.name}`);

      } catch (campaignError) {
        this.logger.error(`Error creating campaign ${campaignInfo.name}:`, campaignError);
      }
    }

    this.logger.info('Campaign seeding completed successfully!');
    
    } catch (error) {
      this.logger.error('Error during campaign seeding:', error);
      throw error;
    }
  }

  public async seedAllData(): Promise<void> {
    try {
      this.logger.info('Starting complete data seeding process...');

      // Connect to database
      const dbConnection = DatabaseConnection.getInstance();
      await dbConnection.connect();
      this.logger.info('Database connection established');

      // Seed users first
      await this.seedUsers();

      // Seed bots
      await this.seedBots();

      // Seed campaigns
      await this.seedCampaigns();

      this.logger.info('Complete data seeding finished successfully!');
      
    } catch (error) {
      this.logger.error('Error during complete data seeding:', error);
      throw error;
    } finally {
      // Close database connection
      await mongoose.connection.close();
      this.logger.info('Database connection closed');
    }
  }
}

async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const command = args[0] || 'all';
    const seeder = new DataSeeder();

    switch (command) {
      case 'users':
        await seeder.seedUsers();
        break;
      case 'bots':
        await seeder.seedBots();
        break;
      case 'campaigns':
        await seeder.seedCampaigns();
        break;
      case 'all':
      default:
        await seeder.seedAllData();
        break;
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
}

// Run the seeding process if this file is executed directly
if (require.main === module) {
  main();
}

