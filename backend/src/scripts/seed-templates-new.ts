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
      { key: "recipient_name", value: "Name of the recipient", required: true },
      { key: "company_name", value: "Recipient's company name", required: true },
      { key: "industry", value: "Industry of the recipient's company", required: true },
      { key: "our_product", value: "Name of your SaaS product", required: true },
      { key: "similar_company", value: "Name of a similar company that uses your product", required: true },
      { key: "metric", value: "Key metric improved (e.g., efficiency, revenue)", required: true },
      { key: "percentage", value: "Percentage improvement", required: true },
      { key: "product_description", value: "Brief description of your product", required: true },
      { key: "pain_point", value: "Specific problem your product solves", required: true },
      { key: "sender_name", value: "Your name", required: true }
    ],
    tags: ["saas", "b2b", "cold-outreach", "sales", "introduction"],
    samples: [
      {
        subject: "Quick question about {{company_name}}'s {{pain_point}}",
        body: "Hi {{recipient_name}},\n\nI noticed {{company_name}} is in the {{industry}} space, and I thought you might be interested in how {{our_product}} has helped similar companies like {{similar_company}} increase their {{metric}} by {{percentage}}%.\n\n{{our_product}} is a {{product_description}} that specifically addresses {{pain_point}} that many {{industry}} companies face.\n\nWould you be open to a brief 15-minute call this week to discuss how this might apply to {{company_name}}?\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "How {{our_product}} could impact {{company_name}}'s growth",
        body: "Hello {{recipient_name}},\n\nI'm reaching out because I believe {{our_product}} could significantly impact {{company_name}}'s growth.\n\nHere's what caught my attention:\n- Your recent achievements in {{industry}}\n- Your focus on innovation\n\n{{our_product}} helps companies like yours increase efficiency by 40%. For example, {{similar_company}} saw 60% improvement in their key metrics after implementing our solution.\n\nI'd love to share a quick 10-minute demo showing exactly how this could work for {{company_name}}.\n\nAre you available for a brief call this week?\n\nThanks,\n{{sender_name}}"
      },
      {
        subject: "Solving {{pain_point}} for {{industry}} companies",
        body: "Hi {{recipient_name}},\n\nI've been following {{company_name}}'s growth in {{industry}}, and I'm impressed by your progress.\n\nHowever, I've noticed that many {{industry}} companies struggle with {{pain_point}}. This often leads to decreased efficiency and higher costs.\n\n{{our_product}} was specifically designed to solve this exact challenge. We've helped 200+ companies in {{industry}} achieve their goals.\n\nA quick example: {{similar_company}} was facing the same issue and now sees 50% improvement in their key metrics.\n\nWould you be interested in a brief conversation about how {{our_product}} could help {{company_name}} overcome this challenge?\n\nBest,\n{{sender_name}}"
      },
      {
        subject: "Industry insights for {{company_name}}",
        body: "Hello {{recipient_name}},\n\nI came across {{company_name}} while researching {{industry}} trends, and I was particularly interested in your approach to innovation.\n\nIn my work with {{our_product}}, I've noticed that {{industry}} companies are increasingly focused on digital transformation. This is creating new opportunities but also new challenges around efficiency.\n\n{{our_product}} has been helping companies like {{similar_company}} navigate this shift by providing automated solutions.\n\nThe results have been impressive: 45% improvement in key performance indicators.\n\nI'd love to share some insights about how {{company_name}} might benefit from similar approaches. Would you be open to a brief 15-minute conversation?\n\nRegards,\n{{sender_name}}"
      },
      {
        subject: "{{referrer_name}} suggested I reach out",
        body: "Hi {{recipient_name}},\n\n{{referrer_name}} from {{referrer_company}} suggested I reach out to you regarding {{company_name}}'s growth strategy.\n\n{{referrer_name}} mentioned that {{company_name}} is focused on innovation, and they thought you might be interested in how {{our_product}} has helped similar companies achieve their goals.\n\nSpecifically, {{our_product}} provides automated solutions, which has resulted in 40% efficiency improvements for companies like {{similar_company}}.\n\n{{referrer_name}} thought this might be particularly relevant given {{company_name}}'s current initiatives.\n\nWould you be open to a brief call to discuss how {{our_product}} might apply to {{company_name}}'s situation?\n\nThanks,\n{{sender_name}}"
      },
      {
        subject: "Following up from {{event_name}}",
        body: "Hello {{recipient_name}},\n\nI hope you enjoyed {{event_name}}! I noticed {{company_name}} had a presence there, and I was particularly interested in your presentation.\n\nI'm reaching out because I believe {{our_product}} could be valuable for {{company_name}}'s growth goals. We've been helping {{industry}} companies improve efficiency, and I thought you might find our approach interesting.\n\nFor example, {{similar_company}} (who we met at a previous event) has been using {{our_product}} to automate their processes, resulting in 50% time savings.\n\nGiven {{company_name}}'s focus on innovation, I'd love to share how {{our_product}} might help you achieve your goals.\n\nWould you be interested in a brief 15-minute conversation this week?\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "Thoughts on your recent article about {{article_topic}}",
        body: "Hi {{recipient_name}},\n\nI just read your article on {{article_topic}} and found your insights particularly valuable.\n\nYour point about industry challenges really resonated with me, especially given my experience working with {{our_product}} in the {{industry}} space.\n\nI've noticed that many companies in {{industry}} are facing similar challenges, and {{our_product}} has been helping them find solutions.\n\nFor instance, {{similar_company}} was dealing with the same issues and now sees 45% improvement in their metrics.\n\nI'd love to share some thoughts on how {{company_name}} might benefit from similar approaches. Would you be open to a brief conversation?\n\nThanks for the great content!\n\nBest,\n{{sender_name}}"
      },
      {
        subject: "Partnership opportunity with {{our_company}}",
        body: "Hello {{recipient_name}},\n\nI've been following {{company_name}}'s impressive growth in {{industry}}, particularly your recent achievements.\n\nI'm reaching out because I believe there might be a valuable partnership opportunity between {{company_name}} and {{our_company}}.\n\n{{our_product}} has been helping companies in your target market achieve their goals, and I think your customers could benefit significantly from this solution.\n\nWe've already partnered with companies like {{similar_company}} to create mutual value, and I'd love to explore how we might create similar value for {{company_name}}'s customers.\n\nWould you be interested in a brief conversation about potential collaboration opportunities?\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "Research insights for {{company_name}}",
        body: "Hi {{recipient_name}},\n\nI'm conducting research on industry trends in the {{industry}} space, and {{company_name}}'s approach caught my attention.\n\nAs part of this research, I've been analyzing how companies like {{company_name}} are addressing current challenges, and I've discovered some interesting patterns.\n\n{{our_product}} has been helping companies in {{industry}} improve their efficiency, and I believe the insights from our research could be valuable for {{company_name}}.\n\nI'd love to share some of our findings and discuss how {{our_product}} might help {{company_name}} achieve its goals.\n\nWould you be open to a brief 20-minute research interview? I'd be happy to share our insights in return.\n\nThanks,\n{{sender_name}}"
      },
      {
        subject: "How {{our_product}} compares to your current solution",
        body: "Hello {{recipient_name}},\n\nI noticed {{company_name}} is currently using a solution for your business needs. While your current approach is solid, I wanted to share how {{our_product}} has been helping companies like {{similar_company}} achieve better results.\n\nHere's what makes {{our_product}} different:\n- 40% faster implementation\n- 50% cost reduction\n- 24/7 automated support\n\n{{similar_company}} switched to {{our_product}} and saw 60% improvement in their key metrics.\n\nI'd love to show you a quick comparison of how {{our_product}} could help {{company_name}} achieve better results.\n\nWould you be interested in a brief 15-minute demo?\n\nBest,\n{{sender_name}}"
      }
    ],
    usageCount: 0,
    rating: { average: 0, count: 0 },
    reviews: []
  },
  {
    name: "Follow-up Email Templates",
    description: "Professional follow-up email templates for nurturing leads and maintaining relationships. Perfect for sales teams who need to stay top-of-mind with prospects.",
    category: TemplateCategory.FOLLOW_UP,
    industry: "General",
    targetAudience: "Sales Teams",
    isPublic: true,
    isApproved: true,
    status: TemplateStatus.APPROVED,
    featured: true,
    useCase: "Follow-up emails for nurturing leads and maintaining relationships",
    variables: [
      { key: "recipient_name", value: "Name of the recipient", required: true },
      { key: "company_name", value: "Recipient's company name", required: true },
      { key: "our_product", value: "Name of your product", required: true },
      { key: "sender_name", value: "Your name", required: true },
      { key: "industry", value: "Industry of the recipient's company", required: true },
      { key: "similar_company", value: "Name of a similar company", required: true }
    ],
    tags: ["follow-up", "nurturing", "sales", "relationship", "prospects"],
    samples: [
      {
        subject: "Following up on {{our_product}} for {{company_name}}",
        body: "Hi {{recipient_name}},\n\nI wanted to follow up on my email from last week about {{our_product}}.\n\nI understand you're probably busy with {{company_name}}'s priorities, but I wanted to share a quick update that might be relevant.\n\n{{our_product}} just released new features that help companies like yours improve efficiency. {{similar_company}} has already seen 30% improvement after implementing these updates.\n\nWould you be interested in a brief 10-minute call to discuss how this might apply to {{company_name}}?\n\nIf now isn't a good time, I completely understand. Just let me know when would be more convenient.\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "Industry insights that might interest {{company_name}}",
        body: "Hello {{recipient_name}},\n\nI hope you're doing well! I wanted to share something that might be valuable for {{company_name}}.\n\nI came across this article about {{industry}} trends and thought of you, especially given {{company_name}}'s focus on innovation.\n\nThis reminded me of how {{our_product}} has been helping companies in {{industry}} improve their processes. {{similar_company}} is a great example - they achieved 40% efficiency gains after implementing our solution.\n\nI'd love to discuss how these insights might apply to {{company_name}}'s situation. Are you available for a brief call this week?\n\nThanks,\n{{sender_name}}"
      },
      {
        subject: "Quick check-in about {{our_product}}",
        body: "Hi {{recipient_name}},\n\nI hope this email finds you well. I wanted to gently follow up on my previous message about {{our_product}}.\n\nI know you're probably juggling multiple priorities at {{company_name}}, so I'll keep this brief.\n\nI'm reaching out because I believe {{our_product}} could help {{company_name}} improve efficiency. We've helped 200+ companies in {{industry}} achieve similar results.\n\nIf you're interested in learning more, I'd be happy to schedule a quick 15-minute call at your convenience. If not, no worries at all - just let me know and I'll stop reaching out.\n\nEither way, I wish you continued success with {{company_name}}!\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "Great meeting you at {{event_name}}",
        body: "Hello {{recipient_name}},\n\nIt was great meeting you at {{event_name}}! I enjoyed our conversation about {{company_name}}'s goals.\n\nAs promised, I'm following up with the information about {{our_product}} that we discussed. {{our_product}} helps companies like {{company_name}} improve efficiency and reduce costs.\n\nHere's a quick summary of what we covered:\n- Your current challenges\n- How {{our_product}} can help\n- Next steps for implementation\n\nI'd love to continue our conversation and show you how {{our_product}} could specifically help {{company_name}} achieve its goals.\n\nWould you be available for a brief call this week?\n\nThanks again for the great conversation!\n\nBest,\n{{sender_name}}"
      },
      {
        subject: "Final follow-up about {{our_product}}",
        body: "Hi {{recipient_name}},\n\nI hope you're doing well. This will be my final follow-up regarding {{our_product}}.\n\nI understand you're busy, and I don't want to keep reaching out if {{our_product}} isn't a good fit for {{company_name}} at this time.\n\nHowever, I wanted to share one final piece of information that might be relevant: we just announced new features that could significantly impact companies in {{industry}}.\n\nIf this sounds interesting and you'd like to learn more, I'd be happy to schedule a brief call. If not, I completely understand and will stop reaching out.\n\nEither way, I wish you continued success with {{company_name}}!\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "Seasonal insights for {{company_name}}",
        body: "Hello {{recipient_name}},\n\nI hope you're enjoying this season! As we approach the end of the quarter, I wanted to reach out with a quick update.\n\nWe've been busy helping companies like {{company_name}} prepare for upcoming challenges. {{our_product}} has been particularly effective in helping {{industry}} companies improve their efficiency.\n\nFor example, {{similar_company}} used {{our_product}} to streamline their processes and saw 35% improvement in their metrics.\n\nGiven {{company_name}}'s focus on growth, I thought you might find this relevant.\n\nWould you be interested in a brief conversation about how {{our_product}} could help {{company_name}} achieve its goals this quarter?\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "Case study: How {{similar_company}} achieved success",
        body: "Hi {{recipient_name}},\n\nI wanted to share an exciting update that might be relevant to {{company_name}}.\n\nWe just published a case study about {{similar_company}}, a {{industry}} company similar to {{company_name}}. They were facing efficiency challenges and used {{our_product}} to streamline their operations.\n\nThe results were impressive:\n- 40% improvement in efficiency\n- 30% reduction in costs\n- 50% faster implementation\n\nI thought you might find this interesting given {{company_name}}'s current situation.\n\nWould you like to see the full case study? I'd also be happy to discuss how similar approaches might work for {{company_name}}.\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "New features in {{our_product}}",
        body: "Hello {{recipient_name}},\n\nI hope you're doing well! I wanted to share some exciting news about {{our_product}}.\n\nWe just released new features that address common challenges that many {{industry}} companies face. This feature helps companies like {{company_name}} improve their efficiency.\n\nHere's what's new:\n- Automated workflow management\n- Real-time analytics dashboard\n- Enhanced integration capabilities\n\n{{similar_company}} has been testing these features and already sees 25% improvement in their processes.\n\nGiven {{company_name}}'s focus on innovation, I thought you might find this update interesting.\n\nWould you like to see a quick demo of these new features?\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "Reconnecting about {{our_product}}",
        body: "Hi {{recipient_name}},\n\nI hope this email finds you well. It's been a while since we last connected about {{our_product}}.\n\nI wanted to reach out because we've made significant improvements to {{our_product}} since we last spoke. We've added new capabilities that I believe could be valuable for {{company_name}}.\n\nSpecifically, {{our_product}} now helps companies in {{industry}} achieve better results. {{similar_company}} is a great example - they achieved 45% improvement after implementing our updated solution.\n\nI know priorities change, but I wanted to make sure you're aware of these improvements in case they're relevant to {{company_name}}'s current goals.\n\nWould you be interested in a brief update call to discuss how {{our_product}} might fit into your current plans?\n\nBest regards,\n{{sender_name}}"
      },
      {
        subject: "Success story: {{similar_company}}'s achievements",
        body: "Hello {{recipient_name}},\n\nI wanted to share some exciting news that might be relevant to {{company_name}}.\n\n{{similar_company}}, a {{industry}} company similar to {{company_name}}, just achieved impressive results using {{our_product}}. They were able to improve their efficiency by 50% in just 3 months.\n\nWhat's particularly interesting is that {{similar_company}} was facing similar challenges to what many {{industry}} companies experience, including {{company_name}}'s focus on growth.\n\nI thought you might find this success story valuable, especially given {{company_name}}'s current situation.\n\nWould you be interested in learning more about how {{our_product}} helped {{similar_company}} achieve these results?\n\nBest regards,\n{{sender_name}}"
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
