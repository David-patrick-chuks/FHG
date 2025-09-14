import mongoose from 'mongoose';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { UserModel } from '../models/User';
import { SubscriptionTier, BillingCycle, AdminUserData } from '../types';
import { Logger } from '../utils/Logger';

export class AdminSeeder {
  private logger: Logger;
  private adminUsers: AdminUserData[];

  constructor() {
    this.logger = new Logger();
    this.adminUsers = [
      {
        email: 'admin@mailquil.com',
        username: 'admin',
        password: 'Admin123456',
        subscription: SubscriptionTier.PREMIUM,
        billingCycle: BillingCycle.YEARLY,
        isAdmin: true,
        isActive: true
      },
      // {
      //   email: 'superadmin@emailoutreachbot.com',
      //   username: 'superadmin',
      //   password: 'SuperAdmin123!@#',
      //   subscription: SubscriptionTier.PREMIUM,
      //   billingCycle: BillingCycle.YEARLY,
      //   isAdmin: true,
      //   isActive: true
      // },
      // {
      //   email: 'support@emailoutreachbot.com',
      //   username: 'support',
      //   password: 'Support123!@#',
      //   subscription: SubscriptionTier.PREMIUM,
      //   billingCycle: BillingCycle.YEARLY,
      //   isAdmin: true,
      //   isActive: true
      // }
    ];
  }

  public async seedAdminUsers(): Promise<void> {
    try {
      this.logger.info('Starting admin user seeding process...');

      // Connect to database
      const dbConnection = DatabaseConnection.getInstance();
      await dbConnection.connect();
      this.logger.info('Database connection established');

      const User = UserModel.getInstance();

      for (const adminData of this.adminUsers) {
        try {
          // Check if admin user already exists
          const existingUser = await User.findOne({
            $or: [
              { email: adminData.email },
              { username: adminData.username }
            ]
          });

          if (existingUser) {
            this.logger.info(`Admin user already exists: ${adminData.email}`);

            // Update existing user to ensure admin privileges
            if (!existingUser.isAdmin) {
              existingUser.isAdmin = true;
              existingUser.subscription = adminData.subscription;
              existingUser.billingCycle = adminData.billingCycle;
              existingUser.isActive = true;
              existingUser.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
              await existingUser.save();
              this.logger.info(`Updated existing user to admin: ${adminData.email}`);
            }
            continue;
          }

          // Create new admin user
          const adminUser = new User({
            email: adminData.email,
            username: adminData.username,
            password: adminData.password, // Pass plain text password - User model will hash it
            subscription: adminData.subscription,
            billingCycle: adminData.billingCycle,
            isAdmin: adminData.isAdmin,
            isActive: adminData.isActive,
            subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            lastLoginAt: new Date()
          });

          await adminUser.save();
          this.logger.info(`Admin user created successfully: ${adminData.email}`);

          // Generate API key for the admin user
          try {
            const apiKey = await adminUser.generateApiKey();
            this.logger.info(`API key generated for admin: ${adminData.email}`);
          } catch (apiKeyError) {
            this.logger.warn(`Failed to generate API key for admin ${adminData.email}:`, apiKeyError);
          }

        } catch (userError) {
          this.logger.error(`Error creating admin user ${adminData.email}:`, userError);
        }
      }

      // Display created admin users
      const allAdmins = await User.find({ isAdmin: true }).select('email username subscription isActive createdAt');
      this.logger.info('Admin users in database:');
      allAdmins.forEach(admin => {
        this.logger.info(`- ${admin.email} (${admin.username}) - ${admin.subscription} - Active: ${admin.isActive}`);
      });

      this.logger.info('Admin user seeding completed successfully!');

    } catch (error) {
      this.logger.error('Error during admin user seeding:', error);
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
    const seeder = new AdminSeeder();
    await seeder.seedAdminUsers();
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

