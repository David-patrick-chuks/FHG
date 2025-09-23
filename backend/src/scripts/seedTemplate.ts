/**
 * Template Seeding Script
 * 
 * This script creates a professional cold outreach template for the specified user.
 * 
 * Usage:
 * npm run seed:template
 * 
 * The script will create a comprehensive email template with:
 * - 10 different email samples
 * - 6 customizable variables
 * - Professional cold outreach content
 * - Proper categorization and tagging
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Logger } from '../utils/Logger';
import { TemplateService } from '../services/TemplateService';
import { TemplateCategory, TemplateStatus } from '../types/template';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const logger = new Logger();

async function seedTemplate() {
  logger.info('Starting template seeding...');

  const uri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/email-outreach-bot';

  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected for template seeding.');

    const userId = '68d197e42b6737bdbad62aee';
    
    // Create a comprehensive email outreach template
    const templateData = {
      name: 'Professional Cold Outreach Template',
      description: 'A professional template for cold outreach emails that helps establish connections and generate interest in your services or products.',
      category: TemplateCategory.COLD_OUTREACH,
      industry: 'Technology',
      targetAudience: 'Business professionals and decision makers',
      isPublic: true,
      useCase: 'Initial contact with potential clients or partners',
      variables: [
        {
          key: 'recipient_name',
          value: 'John Doe',
          required: true
        },
        {
          key: 'company_name',
          value: 'Acme Corp',
          required: true
        },
        {
          key: 'sender_name',
          value: 'David',
          required: true
        },
        {
          key: 'sender_company',
          value: 'Tech Solutions Inc',
          required: true
        },
        {
          key: 'specific_value_proposition',
          value: 'increased productivity by 40%',
          required: false
        },
        {
          key: 'call_to_action',
          value: 'schedule a 15-minute call',
          required: false
        }
      ],
      samples: [
        {
          _id: uuidv4(),
          subject: 'Quick question about {{company_name}}\'s growth strategy',
          body: `Hi {{recipient_name}},

I hope this email finds you well. I came across {{company_name}} and was impressed by your recent growth in the market.

I'm {{sender_name}} from {{sender_company}}, and we've been helping companies like yours {{specific_value_proposition}} through our innovative solutions.

I'd love to learn more about {{company_name}}'s current challenges and see if there might be a way we could help.

Would you be open to {{call_to_action}} this week? I promise to keep it brief and valuable.

Best regards,
{{sender_name}}`,
          createdAt: new Date()
        },
        {
          _id: uuidv4(),
          subject: '{{company_name}} - Quick question about your current processes',
          body: `Hello {{recipient_name}},

I hope you're having a great week at {{company_name}}.

I'm {{sender_name}} from {{sender_company}}. We specialize in helping businesses streamline their operations and {{specific_value_proposition}}.

I noticed {{company_name}} has been expanding rapidly, which is fantastic. With growth often comes operational challenges that we've helped similar companies overcome.

I'd be curious to learn about any bottlenecks or inefficiencies you might be experiencing as you scale.

Would you be interested in {{call_to_action}} to discuss this further?

Looking forward to hearing from you.

Best,
{{sender_name}}`,
          createdAt: new Date()
        },
        {
          _id: uuidv4(),
          subject: 'Partnership opportunity with {{company_name}}',
          body: `Hi {{recipient_name}},

I hope this message finds you well.

I'm {{sender_name}} from {{sender_company}}, and I've been following {{company_name}}'s impressive journey in the industry.

We've been working with companies in your space and have helped them {{specific_value_proposition}} through strategic partnerships.

I believe there might be a great opportunity for {{company_name}} and {{sender_company}} to collaborate in a way that benefits both our clients.

Would you be open to {{call_to_action}} to explore this potential partnership?

I'd love to share some case studies of similar collaborations that have been mutually beneficial.

Best regards,
{{sender_name}}`,
          createdAt: new Date()
        },
        {
          _id: uuidv4(),
          subject: 'Quick insight about {{company_name}}\'s market position',
          body: `Dear {{recipient_name}},

I hope you're doing well.

I'm {{sender_name}} from {{sender_company}}, and I've been analyzing the market trends in your industry.

{{company_name}} has been making some impressive moves, and I wanted to share some insights that might be valuable for your strategic planning.

We've been working with similar companies and have helped them {{specific_value_proposition}} by identifying and capitalizing on emerging opportunities.

I'd love to share these insights with you and discuss how they might apply to {{company_name}}'s current situation.

Would you be interested in {{call_to_action}} to discuss this further?

I promise it will be worth your time.

Best,
{{sender_name}}`,
          createdAt: new Date()
        },
        {
          _id: uuidv4(),
          subject: '{{company_name}} - Question about your current solutions',
          body: `Hi {{recipient_name}},

I hope this email finds you well.

I'm {{sender_name}} from {{sender_company}}, and I've been researching companies in your industry to understand their current challenges and solutions.

{{company_name}} caught my attention because of your innovative approach to solving industry problems.

We've been working with companies similar to yours and have helped them {{specific_value_proposition}} through our specialized solutions.

I'm curious about the tools and processes {{company_name}} currently uses and whether there might be opportunities for improvement or optimization.

Would you be open to {{call_to_action}} to discuss your current setup and see if there are any areas where we might be able to add value?

Looking forward to your response.

Best regards,
{{sender_name}}`,
          createdAt: new Date()
        },
        {
          _id: uuidv4(),
          subject: 'Quick question about {{company_name}}\'s expansion plans',
          body: `Hello {{recipient_name}},

I hope you're having a productive week.

I'm {{sender_name}} from {{sender_company}}, and I've been following {{company_name}}'s growth trajectory with great interest.

Your recent expansion into new markets is impressive, and it got me thinking about the operational challenges that often come with rapid growth.

We've been helping companies like {{company_name}} {{specific_value_proposition}} by optimizing their processes and implementing scalable solutions.

I'd love to learn more about {{company_name}}'s expansion strategy and see if there might be ways we could support your continued growth.

Would you be interested in {{call_to_action}} to discuss this further?

I have some ideas that might be particularly relevant to your current situation.

Best,
{{sender_name}}`,
          createdAt: new Date()
        },
        {
          _id: uuidv4(),
          subject: '{{company_name}} - Industry insights that might interest you',
          body: `Hi {{recipient_name}},

I hope this message finds you well.

I'm {{sender_name}} from {{sender_company}}, and I've been analyzing industry trends that I believe would be valuable for {{company_name}} to know about.

We've been working with companies in your space and have helped them {{specific_value_proposition}} by staying ahead of these trends and adapting their strategies accordingly.

I've compiled some insights and case studies that I think would be particularly relevant to {{company_name}}'s current position and future goals.

Would you be open to {{call_to_action}} to discuss these insights and see how they might apply to your business?

I'm confident you'll find the information valuable, regardless of whether we end up working together.

Best regards,
{{sender_name}}`,
          createdAt: new Date()
        },
        {
          _id: uuidv4(),
          subject: 'Quick question about {{company_name}}\'s technology stack',
          body: `Dear {{recipient_name}},

I hope you're doing well.

I'm {{sender_name}} from {{sender_company}}, and I've been researching how companies in your industry are leveraging technology to gain competitive advantages.

{{company_name}} has been on my radar because of your innovative approach to solving industry challenges.

We've been working with similar companies and have helped them {{specific_value_proposition}} by optimizing their technology infrastructure and implementing more efficient processes.

I'm curious about the technology solutions {{company_name}} currently uses and whether there might be opportunities for improvement or integration.

Would you be interested in {{call_to_action}} to discuss your current tech stack and explore potential optimizations?

I'd love to share some case studies of similar improvements we've implemented.

Best,
{{sender_name}}`,
          createdAt: new Date()
        },
        {
          _id: uuidv4(),
          subject: '{{company_name}} - Question about your customer acquisition strategy',
          body: `Hi {{recipient_name}},

I hope this email finds you well.

I'm {{sender_name}} from {{sender_company}}, and I've been studying successful customer acquisition strategies in your industry.

{{company_name}}'s growth has been impressive, and I'm curious about the strategies that have been most effective for you.

We've been working with companies like yours and have helped them {{specific_value_proposition}} by refining their customer acquisition processes and implementing more targeted approaches.

I'd love to learn about {{company_name}}'s current customer acquisition methods and see if there might be opportunities to optimize or expand your reach.

Would you be open to {{call_to_action}} to discuss your current strategies and explore potential improvements?

I have some ideas that might be particularly relevant to your market position.

Best regards,
{{sender_name}}`,
          createdAt: new Date()
        },
        {
          _id: uuidv4(),
          subject: 'Quick insight about {{company_name}}\'s competitive advantage',
          body: `Hello {{recipient_name}},

I hope you're having a great week.

I'm {{sender_name}} from {{sender_company}}, and I've been analyzing competitive advantages in your industry.

{{company_name}} has developed a strong position in the market, and I wanted to share some insights about how similar companies have been able to {{specific_value_proposition}} by leveraging their unique strengths.

We've been working with companies in your space and have helped them identify and capitalize on their competitive advantages more effectively.

I believe there might be opportunities for {{company_name}} to further strengthen its market position by optimizing certain aspects of your current approach.

Would you be interested in {{call_to_action}} to discuss these insights and see how they might apply to {{company_name}}'s strategy?

I'm confident you'll find the conversation valuable.

Best,
{{sender_name}}`,
          createdAt: new Date()
        }
      ],
      tags: ['cold outreach', 'professional', 'business', 'partnership', 'growth', 'technology']
    };

    logger.info('Creating template for user:', { userId, templateName: templateData.name });

    const result = await TemplateService.createTemplate(userId, templateData);

    if (result.success && result.data) {
      logger.info('Template created successfully:', {
        templateId: result.data._id,
        templateName: result.data.name,
        userId: userId
      });
    } else {
      logger.error('Failed to create template:', result.message);
    }

  } catch (error) {
    logger.error('Error during template seeding:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected.');
  }
}

// Run the seeding function
seedTemplate();
