import dotenv from 'dotenv';
import mongoose from 'mongoose';
import TemplateModel from '../models/Template';
import UserModel from '../models/User';
import { TemplateCategory, TemplateStatus } from '../types';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/email-outreach-bot');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Get admin user ID
const getAdminUserId = async (): Promise<string> => {
  const admin = await UserModel.findOne({ isAdmin: true });
  if (!admin) {
    throw new Error('No admin user found. Please create an admin user first.');
  }
  return String(admin._id);
};

// Template seed data with new structure
const templateSeedData = [
  {
    name: "Cold Outreach - SaaS Introduction",
    description: "Professional cold outreach templates for introducing SaaS products to potential customers. Perfect for B2B sales teams looking to generate qualified leads.",
    category: TemplateCategory.COLD_OUTREACH,
    industry: "SaaS",
    targetAudience: "B2B Decision Makers",
    isPublic: true,
    isApproved: true,
    status: TemplateStatus.APPROVED,
    featured: true,
    useCase: "Initial cold outreach to introduce a SaaS product to potential customers",
    variables: [
      { key: "company_name", value: "Recipient's company name", required: true },
      { key: "industry", value: "Industry of the recipient's company", required: true },
      { key: "our_product", value: "Name of your SaaS product", required: true },
      { key: "similar_company", value: "Name of a similar company that uses your product", required: true },
      { key: "metric", value: "Key metric improved (e.g., efficiency, revenue)", required: true },
      { key: "percentage", value: "Percentage improvement", required: true },
      { key: "product_description", value: "Brief description of your product", required: true },
      { key: "pain_point", value: "Specific problem your product solves", required: true }
    ],
    tags: ["saas", "b2b", "cold-outreach", "sales", "introduction"],
    samples: [
      {
        subject: "Quick question about {{company_name}}'s {{pain_point}}",
        body: "Hi there,\n\nI noticed {{company_name}} is in the {{industry}} space, and I thought you might be interested in how {{our_product}} has helped similar companies like {{similar_company}} increase their {{metric}} by {{percentage}}%.\n\n{{our_product}} is a {{product_description}} that specifically addresses {{pain_point}} that many {{industry}} companies face.\n\nWould you be open to a brief 15-minute call this week to discuss how this might apply to {{company_name}}?\n\nBest regards"
      },
      {
        subject: "How {{our_product}} could impact {{company_name}}'s growth",
        body: "Hello,\n\nI'm reaching out because I believe {{our_product}} could significantly impact {{company_name}}'s growth.\n\nHere's what caught my attention:\n- Your recent achievements in {{industry}}\n- Your focus on innovation\n\n{{our_product}} helps companies like yours increase efficiency by 40%. For example, {{similar_company}} saw 60% improvement in their key metrics after implementing our solution.\n\nI'd love to share a quick 10-minute demo showing exactly how this could work for {{company_name}}.\n\nAre you available for a brief call this week?\n\nThanks"
      },
      {
        subject: "Solving {{pain_point}} for {{industry}} companies",
        body: "Hi there,\n\nI've been following {{company_name}}'s growth in {{industry}}, and I'm impressed by your progress.\n\nHowever, I've noticed that many {{industry}} companies struggle with {{pain_point}}. This often leads to decreased efficiency and higher costs.\n\n{{our_product}} was specifically designed to solve this exact challenge. We've helped 200+ companies in {{industry}} achieve their goals.\n\nA quick example: {{similar_company}} was facing the same issue and now sees 50% improvement in their key metrics.\n\nWould you be interested in a brief conversation about how {{our_product}} could help {{company_name}} overcome this challenge?\n\nBest"
      },
      {
        subject: "Industry insights for {{company_name}}",
        body: "Hello,\n\nI came across {{company_name}} while researching {{industry}} trends, and I was particularly interested in your approach to innovation.\n\nIn my work with {{our_product}}, I've noticed that {{industry}} companies are increasingly focused on digital transformation. This is creating new opportunities but also new challenges around efficiency.\n\n{{our_product}} has been helping companies like {{similar_company}} navigate this shift by providing automated solutions.\n\nThe results have been impressive: 45% improvement in key performance indicators.\n\nI'd love to share some insights about how {{company_name}} might benefit from similar approaches. Would you be open to a brief 15-minute conversation?\n\nRegards"
      },
      {
        subject: "Partnership opportunity with {{our_product}}",
        body: "Hi there,\n\nI've been following {{company_name}}'s impressive growth in {{industry}}, particularly your recent achievements.\n\nI'm reaching out because I believe there might be a valuable partnership opportunity between {{company_name}} and our company.\n\n{{our_product}} has been helping companies in your target market achieve their goals, and I think your customers could benefit significantly from this solution.\n\nWe've already partnered with companies like {{similar_company}} to create mutual value, and I'd love to explore how we might create similar value for {{company_name}}'s customers.\n\nWould you be interested in a brief conversation about potential collaboration opportunities?\n\nBest regards"
      },
      {
        subject: "Research insights for {{company_name}}",
        body: "Hello,\n\nI'm conducting research on industry trends in the {{industry}} space, and {{company_name}}'s approach caught my attention.\n\nAs part of this research, I've been analyzing how companies like {{company_name}} are addressing current challenges, and I've discovered some interesting patterns.\n\n{{our_product}} has been helping companies in {{industry}} improve their efficiency, and I believe the insights from our research could be valuable for {{company_name}}.\n\nI'd love to share some of our findings and discuss how {{our_product}} might help {{company_name}} achieve its goals.\n\nWould you be open to a brief 20-minute research interview? I'd be happy to share our insights in return.\n\nThanks"
      },
      {
        subject: "How {{our_product}} compares to your current solution",
        body: "Hello,\n\nI noticed {{company_name}} is currently using a solution for your business needs. While your current approach is solid, I wanted to share how {{our_product}} has been helping companies like {{similar_company}} achieve better results.\n\nHere's what makes {{our_product}} different:\n- 40% faster implementation\n- 50% cost reduction\n- 24/7 automated support\n\n{{similar_company}} switched to {{our_product}} and saw 60% improvement in their key metrics.\n\nI'd love to show you a quick comparison of how {{our_product}} could help {{company_name}} achieve better results.\n\nWould you be interested in a brief 15-minute demo?\n\nBest"
      },
      {
        subject: "Following up from industry event",
        body: "Hi there,\n\nI hope you enjoyed the recent industry event! I noticed {{company_name}} had a presence there, and I was particularly interested in your presentation.\n\nI'm reaching out because I believe {{our_product}} could be valuable for {{company_name}}'s growth goals. We've been helping {{industry}} companies improve efficiency, and I thought you might find our approach interesting.\n\nFor example, {{similar_company}} (who we met at a previous event) has been using {{our_product}} to automate their processes, resulting in 50% time savings.\n\nGiven {{company_name}}'s focus on innovation, I'd love to share how {{our_product}} might help you achieve your goals.\n\nWould you be interested in a brief 15-minute conversation this week?\n\nBest regards"
      },
      {
        subject: "Thoughts on your recent article",
        body: "Hello,\n\nI just read your recent article and found your insights particularly valuable.\n\nYour point about industry challenges really resonated with me, especially given my experience working with {{our_product}} in the {{industry}} space.\n\nI've noticed that many companies in {{industry}} are facing similar challenges, and {{our_product}} has been helping them find solutions.\n\nFor instance, {{similar_company}} was dealing with the same issues and now sees 45% improvement in their metrics.\n\nI'd love to share some thoughts on how {{company_name}} might benefit from similar approaches. Would you be open to a brief conversation?\n\nThanks for the great content!\n\nBest"
      },
      {
        subject: "Case study: How {{similar_company}} achieved success",
        body: "Hi there,\n\nI wanted to share an exciting update that might be relevant to {{company_name}}.\n\nWe just published a case study about {{similar_company}}, a {{industry}} company similar to {{company_name}}. They were facing efficiency challenges and used {{our_product}} to streamline their operations.\n\nThe results were impressive:\n- 40% improvement in efficiency\n- 30% reduction in costs\n- 50% faster implementation\n\nI thought you might find this interesting given {{company_name}}'s current situation.\n\nWould you like to see the full case study? I'd also be happy to discuss how similar approaches might work for {{company_name}}.\n\nBest regards"
      }
    ],
    usageCount: 0,
    rating: { average: 0, count: 0 },
    reviews: []
  },
  {
    name: "Simple Welcome Email",
    description: "A clean, simple welcome email template for new subscribers. Perfect for newsletters, product updates, and general communications.",
    category: TemplateCategory.WELCOME,
    industry: "General",
    targetAudience: "New Subscribers",
    isPublic: true,
    isApproved: true,
    status: TemplateStatus.APPROVED,
    featured: true,
    useCase: "Welcome new subscribers to your newsletter or service",
    variables: [],
    tags: ["welcome", "newsletter", "simple", "clean"],
    samples: [
      {
        subject: "Welcome to our community!",
        body: "Hi there,\n\nWelcome to our community! We're thrilled to have you on board.\n\nYou'll receive our weekly newsletter with industry insights, tips, and updates every Tuesday.\n\nIf you have any questions or need help getting started, just reply to this email - we're here to help!\n\nThanks for joining us,\nThe Team"
      },
      {
        subject: "Thanks for subscribing!",
        body: "Hello,\n\nThank you for subscribing to our updates! We're excited to share valuable content with you.\n\nHere's what you can expect:\n- Weekly industry insights\n- Exclusive tips and strategies\n- Early access to new features\n\nWe promise to keep our emails valuable and relevant. If you ever want to unsubscribe, just click the link at the bottom of any email.\n\nWelcome aboard!\nBest regards"
      },
      {
        subject: "You're all set!",
        body: "Hi,\n\nGreat news - you're all set to receive our updates!\n\nWe'll be sending you our best content, including:\n- Industry news and trends\n- Expert tips and advice\n- Special offers and announcements\n\nFeel free to reply to this email if you have any questions or suggestions.\n\nThanks for being part of our community!\nCheers"
      },
      {
        subject: "Welcome aboard!",
        body: "Hello,\n\nWelcome to our newsletter! We're excited to have you as part of our community.\n\nYou'll now receive our carefully curated content delivered straight to your inbox every week. Our goal is to provide you with valuable insights, tips, and updates that matter to you.\n\nIf you have any questions or feedback, don't hesitate to reach out. We love hearing from our readers!\n\nWelcome to the family!\nBest wishes"
      },
      {
        subject: "You're in! Welcome to our updates",
        body: "Hi,\n\nGreat news - you're now subscribed to our updates!\n\nWe're committed to delivering high-quality content that helps you stay informed and ahead of the curve. You can expect:\n- Fresh industry insights\n- Practical tips and advice\n- Exclusive content and offers\n\nWe respect your inbox and promise to only send you content that adds value to your day.\n\nThanks for trusting us with your time!\nWarm regards"
      },
      {
        subject: "Welcome! Here's what's next",
        body: "Hello,\n\nThank you for joining our community! We're thrilled to have you here.\n\nStarting today, you'll receive our weekly digest with the latest news, insights, and tips from our team of experts.\n\nWe're passionate about sharing knowledge and helping our community grow. If you ever have questions or want to share feedback, just reply to any of our emails.\n\nWelcome to the journey!\nCheers"
      },
      {
        subject: "Welcome to our newsletter family!",
        body: "Hi there,\n\nWelcome to our newsletter family! We're so excited to have you join us.\n\nYou're now part of a community of like-minded individuals who value quality content and insights. We work hard to bring you the best information every week.\n\nHere's what you can look forward to:\n- Expert analysis and insights\n- Industry trends and updates\n- Exclusive tips and strategies\n\nWe're here to help you succeed. Welcome aboard!\nBest regards"
      },
      {
        subject: "You're officially part of our community!",
        body: "Hello,\n\nCongratulations! You're now officially part of our community.\n\nWe're committed to providing you with valuable, actionable content that helps you stay informed and make better decisions. Our team works tirelessly to curate the best information for you.\n\nYou can expect to receive our newsletter every week, packed with insights, tips, and updates that matter to you.\n\nIf you have any questions or suggestions, we'd love to hear from you. Just reply to this email!\n\nWelcome to the team!\nWarm wishes"
      },
      {
        subject: "Welcome! Let's get started",
        body: "Hi,\n\nWelcome to our community! We're excited to have you here and can't wait to share our best content with you.\n\nOur mission is simple: to provide you with valuable, relevant information that helps you stay ahead of the curve. We believe in quality over quantity, so every email we send is carefully crafted with you in mind.\n\nYou'll receive our weekly newsletter with insights, tips, and updates that we think you'll find valuable.\n\nWelcome to the journey - we're glad you're here!\nBest regards"
      },
      {
        subject: "Welcome! Your journey starts now",
        body: "Hello,\n\nWelcome to our community! We're thrilled to have you join us on this journey.\n\nYou're now part of a growing community of professionals who value quality content and insights. We're committed to delivering value in every email we send.\n\nHere's what you can expect:\n- Weekly insights and analysis\n- Practical tips and strategies\n- Industry updates and trends\n- Exclusive content and offers\n\nWe're here to help you succeed. If you ever need anything, just reach out!\n\nWelcome aboard!\nCheers"
      },
      {
        subject: "You're in! Welcome to our updates",
        body: "Hi there,\n\nFantastic! You're now subscribed to our updates and part of our community.\n\nWe're passionate about sharing knowledge and insights that help our readers stay informed and make better decisions. Every piece of content we create is designed with you in mind.\n\nYou'll receive our carefully curated newsletter every week, featuring the latest insights, tips, and updates from our team of experts.\n\nWe're excited to have you here and look forward to sharing valuable content with you!\n\nWelcome to the community!\nBest wishes"
      },
      {
        subject: "Welcome! Here's what to expect",
        body: "Hello,\n\nWelcome to our newsletter! We're excited to have you as part of our community.\n\nWe believe in the power of quality content and are committed to delivering value in every email we send. Our team works hard to bring you the most relevant and actionable insights.\n\nYou can expect to receive our weekly newsletter with:\n- Expert insights and analysis\n- Practical tips and strategies\n- Industry trends and updates\n- Exclusive content and offers\n\nIf you have any questions or feedback, we'd love to hear from you. Just reply to any of our emails!\n\nWelcome to the family!\nWarm regards"
      },
      {
        subject: "Welcome aboard! You're all set",
        body: "Hi,\n\nWelcome aboard! You're now all set to receive our updates and insights.\n\nWe're committed to providing you with high-quality content that helps you stay informed and ahead of the curve. Our team of experts works tirelessly to bring you the best information every week.\n\nYou'll receive our newsletter with valuable insights, practical tips, and industry updates that we think you'll find useful.\n\nWe're excited to have you here and look forward to sharing our best content with you!\n\nWelcome to the community!\nBest regards"
      },
      {
        subject: "Welcome! You're now part of our family",
        body: "Hello,\n\nWelcome to our family! We're thrilled to have you join our community of readers.\n\nWe're passionate about sharing knowledge and insights that make a difference. Every email we send is crafted with care to provide you with valuable, actionable information.\n\nYou can expect to receive our weekly newsletter with insights, tips, and updates that help you stay informed and make better decisions.\n\nIf you ever have questions or want to share feedback, don't hesitate to reach out. We love hearing from our community!\n\nWelcome to the journey!\nCheers"
      },
      {
        subject: "You're officially in! Welcome",
        body: "Hi there,\n\nYou're officially in! Welcome to our community of informed readers.\n\nWe're excited to have you here and can't wait to share our best content with you. Our mission is to provide you with valuable insights and information that helps you succeed.\n\nYou'll receive our weekly newsletter with carefully curated content, including:\n- Expert analysis and insights\n- Practical tips and strategies\n- Industry trends and updates\n- Exclusive content and offers\n\nWe're committed to delivering value in every email. Welcome to the team!\n\nBest wishes"
      }
    ],
    usageCount: 0,
    rating: { average: 0, count: 0 },
    reviews: []
  }
];

// Main seed function
const seedTemplates = async () => {
  try {
    await connectDB();
    
    const adminUserId = await getAdminUserId();
    
    // Clear existing templates (optional - remove this if you want to keep existing templates)
    // await TemplateModel.deleteMany({});
    
    console.log('Starting template seeding...');
    
    for (const templateData of templateSeedData) {
      const template = new TemplateModel({
        ...templateData,
        userId: adminUserId,
        approvedBy: adminUserId,
        approvedAt: new Date(),
        featuredAt: templateData.featured ? new Date() : undefined
      });
      
      await template.save();
      console.log(`✅ Created template: ${templateData.name}`);
    }
    
    console.log('🎉 Template seeding completed successfully!');
    console.log(`Created ${templateSeedData.length} templates`);
    
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
if (require.main === module) {
  seedTemplates();
}

export { seedTemplates };

