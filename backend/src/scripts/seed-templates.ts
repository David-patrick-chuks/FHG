import mongoose from 'mongoose';
import { TemplateCategory, TemplateStatus } from '../types';
import TemplateModel  from '../models/Template';
import UserModel, { IUserDocument } from '../models/User';
import dotenv from 'dotenv';

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

// Template seed data
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
    tags: ["saas", "b2b", "cold-outreach", "sales", "introduction"],
    samples: [
      {
        title: "SaaS Product Introduction",
        content: "Hi {{recipient_name}},\n\nI noticed {{company_name}} is in the {{industry}} space, and I thought you might be interested in how {{our_product}} has helped similar companies like {{similar_company}} increase their {{metric}} by {{percentage}}%.\n\n{{our_product}} is a {{product_description}} that specifically addresses {{pain_point}} that many {{industry}} companies face.\n\nWould you be open to a brief 15-minute call this week to discuss how this might apply to {{company_name}}?\n\nBest regards,\n{{sender_name}}",
        useCase: "Initial cold outreach to introduce a SaaS product",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "similar_company", description: "Name of a similar company that uses your product", required: true },
          { name: "metric", description: "Key metric improved (e.g., efficiency, revenue)", required: true },
          { name: "percentage", description: "Percentage improvement", required: true },
          { name: "product_description", description: "Brief description of your product", required: true },
          { name: "pain_point", description: "Specific problem your product solves", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Value Proposition Focus",
        content: "Hello {{recipient_name}},\n\nI'm reaching out because I believe {{our_product}} could significantly impact {{company_name}}'s {{business_area}}.\n\nHere's what caught my attention:\n- {{company_achievement}} (impressive!)\n- Your focus on {{company_focus}}\n\n{{our_product}} helps companies like yours {{key_benefit}}. For example, {{case_study_company}} saw {{specific_result}} after implementing our solution.\n\nI'd love to share a quick 10-minute demo showing exactly how this could work for {{company_name}}.\n\nAre you available for a brief call this week?\n\nThanks,\n{{sender_name}}",
        useCase: "Cold outreach focusing on value proposition and social proof",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "business_area", description: "Specific business area your product impacts", required: true },
          { name: "company_achievement", description: "Recent achievement of the company", required: true },
          { name: "company_focus", description: "What the company focuses on", required: true },
          { name: "key_benefit", description: "Main benefit your product provides", required: true },
          { name: "case_study_company", description: "Name of a company in your case study", required: true },
          { name: "specific_result", description: "Specific result achieved", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Problem-Solution Fit",
        content: "Hi {{recipient_name}},\n\nI've been following {{company_name}}'s growth in {{industry}}, and I'm impressed by {{company_strength}}.\n\nHowever, I've noticed that many {{industry}} companies struggle with {{common_problem}}. This often leads to {{consequence}}.\n\n{{our_product}} was specifically designed to solve this exact challenge. We've helped {{number}} companies in {{industry}} {{desired_outcome}}.\n\nA quick example: {{success_story_company}} was facing the same issue and now {{success_metric}}.\n\nWould you be interested in a brief conversation about how {{our_product}} could help {{company_name}} {{specific_benefit}}?\n\nBest,\n{{sender_name}}",
        useCase: "Cold outreach highlighting problem-solution fit",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "company_strength", description: "Something the company does well", required: true },
          { name: "common_problem", description: "Common problem in their industry", required: true },
          { name: "consequence", description: "Negative consequence of the problem", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "number", description: "Number of companies you've helped", required: true },
          { name: "desired_outcome", description: "What companies achieve with your product", required: true },
          { name: "success_story_company", description: "Name of a successful customer", required: true },
          { name: "success_metric", description: "Specific success metric achieved", required: true },
          { name: "specific_benefit", description: "Specific benefit for their company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Industry Insight Approach",
        content: "Hello {{recipient_name}},\n\nI came across {{company_name}} while researching {{industry}} trends, and I was particularly interested in {{company_initiative}}.\n\nIn my work with {{our_product}}, I've noticed that {{industry}} companies are increasingly focused on {{trend}}. This is creating new opportunities but also new challenges around {{challenge}}.\n\n{{our_product}} has been helping companies like {{example_company}} navigate this shift by {{solution_approach}}.\n\nThe results have been impressive: {{specific_improvement}}.\n\nI'd love to share some insights about how {{company_name}} might benefit from similar approaches. Would you be open to a brief 15-minute conversation?\n\nRegards,\n{{sender_name}}",
        useCase: "Cold outreach using industry insights and trends",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "company_initiative", description: "Specific initiative or project of the company", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "trend", description: "Current industry trend", required: true },
          { name: "challenge", description: "Challenge created by the trend", required: true },
          { name: "example_company", description: "Name of a company you've helped", required: true },
          { name: "solution_approach", description: "How your product addresses the challenge", required: true },
          { name: "specific_improvement", description: "Specific improvement achieved", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Referral-Based Introduction",
        content: "Hi {{recipient_name}},\n\n{{referrer_name}} from {{referrer_company}} suggested I reach out to you regarding {{company_name}}'s {{business_need}}.\n\n{{referrer_name}} mentioned that {{company_name}} is {{company_description}}, and they thought you might be interested in how {{our_product}} has helped similar companies {{key_benefit}}.\n\nSpecifically, {{our_product}} {{product_capability}}, which has resulted in {{typical_result}} for companies like {{success_company}}.\n\n{{referrer_name}} thought this might be particularly relevant given {{company_context}}.\n\nWould you be open to a brief call to discuss how {{our_product}} might apply to {{company_name}}'s situation?\n\nThanks,\n{{sender_name}}",
        useCase: "Cold outreach leveraging a referral or mutual connection",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "referrer_name", description: "Name of the person who referred you", required: true },
          { name: "referrer_company", description: "Company of the referrer", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "business_need", description: "Business need your product addresses", required: true },
          { name: "company_description", description: "Description of the recipient's company", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "key_benefit", description: "Main benefit your product provides", required: true },
          { name: "product_capability", description: "What your product does", required: true },
          { name: "typical_result", description: "Typical result companies see", required: true },
          { name: "success_company", description: "Name of a successful customer", required: true },
          { name: "company_context", description: "Specific context about the company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Event-Based Follow-up",
        content: "Hello {{recipient_name}},\n\nI hope you enjoyed {{event_name}}! I noticed {{company_name}} had a presence there, and I was particularly interested in {{company_highlight}}.\n\nI'm reaching out because I believe {{our_product}} could be valuable for {{company_name}}'s {{business_goal}}. We've been helping {{industry}} companies {{key_benefit}}, and I thought you might find our approach interesting.\n\nFor example, {{case_study_company}} (who we met at {{previous_event}}) has been using {{our_product}} to {{specific_use_case}}, resulting in {{measurable_outcome}}.\n\nGiven {{company_name}}'s focus on {{company_focus}}, I'd love to share how {{our_product}} might help you {{specific_benefit}}.\n\nWould you be interested in a brief 15-minute conversation this week?\n\nBest regards,\n{{sender_name}}",
        useCase: "Follow-up after meeting at an event or conference",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "event_name", description: "Name of the event you both attended", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "company_highlight", description: "Something notable about their company at the event", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "business_goal", description: "Business goal your product helps achieve", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "key_benefit", description: "Main benefit your product provides", required: true },
          { name: "case_study_company", description: "Name of a customer you met at an event", required: true },
          { name: "previous_event", description: "Previous event where you met the customer", required: true },
          { name: "specific_use_case", description: "How the customer uses your product", required: true },
          { name: "measurable_outcome", description: "Measurable outcome achieved", required: true },
          { name: "company_focus", description: "What the company focuses on", required: true },
          { name: "specific_benefit", description: "Specific benefit for their company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Content-Based Engagement",
        content: "Hi {{recipient_name}},\n\nI just read your article on {{article_topic}} and found your insights on {{key_insight}} particularly valuable.\n\nYour point about {{specific_point}} really resonated with me, especially given my experience working with {{our_product}} in the {{industry}} space.\n\nI've noticed that many companies in {{industry}} are facing {{common_challenge}}, and {{our_product}} has been helping them {{solution_approach}}.\n\nFor instance, {{success_company}} was dealing with {{similar_challenge}} and now {{success_metric}}.\n\nI'd love to share some thoughts on how {{company_name}} might benefit from similar approaches. Would you be open to a brief conversation?\n\nThanks for the great content!\n\nBest,\n{{sender_name}}",
        useCase: "Cold outreach based on content engagement (article, post, etc.)",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "article_topic", description: "Topic of the article they wrote", required: true },
          { name: "key_insight", description: "Key insight from their article", required: true },
          { name: "specific_point", description: "Specific point that resonated with you", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "common_challenge", description: "Common challenge in their industry", required: true },
          { name: "solution_approach", description: "How your product addresses the challenge", required: true },
          { name: "success_company", description: "Name of a successful customer", required: true },
          { name: "similar_challenge", description: "Similar challenge the customer faced", required: true },
          { name: "success_metric", description: "Success metric achieved", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Partnership Opportunity",
        content: "Hello {{recipient_name}},\n\nI've been following {{company_name}}'s impressive growth in {{industry}}, particularly your {{company_achievement}}.\n\nI'm reaching out because I believe there might be a valuable partnership opportunity between {{company_name}} and {{our_company}}.\n\n{{our_product}} has been helping {{target_market}} {{key_benefit}}, and I think your customers could benefit significantly from this solution.\n\nWe've already partnered with companies like {{partner_company}} to {{partnership_outcome}}, and I'd love to explore how we might create similar value for {{company_name}}'s customers.\n\nWould you be interested in a brief conversation about potential collaboration opportunities?\n\nBest regards,\n{{sender_name}}",
        useCase: "Cold outreach proposing a partnership opportunity",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "company_achievement", description: "Recent achievement of the company", required: true },
          { name: "our_company", description: "Name of your company", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "target_market", description: "Your target market", required: true },
          { name: "key_benefit", description: "Main benefit your product provides", required: true },
          { name: "partner_company", description: "Name of an existing partner", required: true },
          { name: "partnership_outcome", description: "Outcome of the partnership", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Research-Based Approach",
        content: "Hi {{recipient_name}},\n\nI'm conducting research on {{research_topic}} in the {{industry}} space, and {{company_name}}'s approach to {{company_approach}} caught my attention.\n\nAs part of this research, I've been analyzing how companies like {{company_name}} are addressing {{industry_challenge}}, and I've discovered some interesting patterns.\n\n{{our_product}} has been helping companies in {{industry}} {{solution_benefit}}, and I believe the insights from our research could be valuable for {{company_name}}.\n\nI'd love to share some of our findings and discuss how {{our_product}} might help {{company_name}} {{specific_benefit}}.\n\nWould you be open to a brief 20-minute research interview? I'd be happy to share our insights in return.\n\nThanks,\n{{sender_name}}",
        useCase: "Cold outreach using research as a hook",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "research_topic", description: "Topic of your research", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "company_approach", description: "Specific approach the company takes", required: true },
          { name: "industry_challenge", description: "Challenge in their industry", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "solution_benefit", description: "Benefit your solution provides", required: true },
          { name: "specific_benefit", description: "Specific benefit for their company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Competitive Advantage",
        content: "Hello {{recipient_name}},\n\nI noticed {{company_name}} is currently using {{current_solution}} for {{business_function}}. While {{current_solution}} is a solid choice, I wanted to share how {{our_product}} has been helping companies like {{success_company}} achieve {{competitive_advantage}}.\n\nHere's what makes {{our_product}} different:\n- {{differentiator_1}}\n- {{differentiator_2}}\n- {{differentiator_3}}\n\n{{success_company}} switched from {{current_solution}} to {{our_product}} and saw {{improvement_metric}}.\n\nI'd love to show you a quick comparison of how {{our_product}} could help {{company_name}} {{specific_benefit}}.\n\nWould you be interested in a brief 15-minute demo?\n\nBest,\n{{sender_name}}",
        useCase: "Cold outreach highlighting competitive advantages",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "current_solution", description: "Solution they're currently using", required: true },
          { name: "business_function", description: "Business function the solution serves", required: true },
          { name: "our_product", description: "Name of your SaaS product", required: true },
          { name: "success_company", description: "Name of a successful customer", required: true },
          { name: "competitive_advantage", description: "Competitive advantage your product provides", required: true },
          { name: "differentiator_1", description: "First key differentiator", required: true },
          { name: "differentiator_2", description: "Second key differentiator", required: true },
          { name: "differentiator_3", description: "Third key differentiator", required: true },
          { name: "improvement_metric", description: "Specific improvement metric", required: true },
          { name: "specific_benefit", description: "Specific benefit for their company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
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
    tags: ["follow-up", "nurturing", "sales", "relationship", "prospects"],
    samples: [
      {
        title: "First Follow-up",
        content: "Hi {{recipient_name}},\n\nI wanted to follow up on my email from {{previous_date}} about {{topic}}.\n\nI understand you're probably busy with {{company_priority}}, but I wanted to share a quick update that might be relevant to {{company_name}}.\n\n{{our_company}} just released {{new_feature}} that helps companies like yours {{key_benefit}}. {{success_company}} has already seen {{improvement_metric}} after implementing this.\n\nWould you be interested in a brief 10-minute call to discuss how this might apply to {{company_name}}?\n\nIf now isn't a good time, I completely understand. Just let me know when would be more convenient.\n\nBest regards,\n{{sender_name}}",
        useCase: "First follow-up after initial outreach",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "previous_date", description: "Date of previous email", required: true },
          { name: "topic", description: "Topic of previous email", required: true },
          { name: "company_priority", description: "Current priority of their company", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "our_company", description: "Name of your company", required: true },
          { name: "new_feature", description: "New feature or update", required: true },
          { name: "key_benefit", description: "Main benefit of the new feature", required: true },
          { name: "success_company", description: "Name of a successful customer", required: true },
          { name: "improvement_metric", description: "Improvement metric achieved", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Value-Add Follow-up",
        content: "Hello {{recipient_name}},\n\nI hope you're doing well! I wanted to share something that might be valuable for {{company_name}}.\n\nI came across this article about {{industry_trend}} and thought of you, especially given {{company_name}}'s focus on {{company_focus}}.\n\n[Article Link: {{article_url}}]\n\nThis reminded me of how {{our_product}} has been helping companies in {{industry}} {{key_benefit}}. {{case_study_company}} is a great example - they {{specific_achievement}} after implementing our solution.\n\nI'd love to discuss how these insights might apply to {{company_name}}'s situation. Are you available for a brief call this week?\n\nThanks,\n{{sender_name}}",
        useCase: "Follow-up providing value through industry insights",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "industry_trend", description: "Current industry trend", required: true },
          { name: "company_focus", description: "What the company focuses on", required: true },
          { name: "article_url", description: "URL of the relevant article", required: true },
          { name: "our_product", description: "Name of your product", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "key_benefit", description: "Main benefit your product provides", required: true },
          { name: "case_study_company", description: "Name of a successful customer", required: true },
          { name: "specific_achievement", description: "Specific achievement of the customer", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Gentle Reminder",
        content: "Hi {{recipient_name}},\n\nI hope this email finds you well. I wanted to gently follow up on my previous message about {{topic}}.\n\nI know you're probably juggling multiple priorities at {{company_name}}, so I'll keep this brief.\n\nI'm reaching out because I believe {{our_product}} could help {{company_name}} {{specific_benefit}}. We've helped {{number}} companies in {{industry}} achieve similar results.\n\nIf you're interested in learning more, I'd be happy to schedule a quick 15-minute call at your convenience. If not, no worries at all - just let me know and I'll stop reaching out.\n\nEither way, I wish you continued success with {{company_name}}!\n\nBest regards,\n{{sender_name}}",
        useCase: "Gentle follow-up with an easy opt-out",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "topic", description: "Topic of previous emails", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "our_product", description: "Name of your product", required: true },
          { name: "specific_benefit", description: "Specific benefit for their company", required: true },
          { name: "number", description: "Number of companies you've helped", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Event Follow-up",
        content: "Hello {{recipient_name}},\n\nIt was great meeting you at {{event_name}}! I enjoyed our conversation about {{conversation_topic}}.\n\nAs promised, I'm following up with the information about {{our_product}} that we discussed. {{our_product}} helps companies like {{company_name}} {{key_benefit}}.\n\nHere's a quick summary of what we covered:\n- {{point_1}}\n- {{point_2}}\n- {{point_3}}\n\nI'd love to continue our conversation and show you how {{our_product}} could specifically help {{company_name}} {{specific_benefit}}.\n\nWould you be available for a brief call this week?\n\nThanks again for the great conversation!\n\nBest,\n{{sender_name}}",
        useCase: "Follow-up after meeting at an event",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "event_name", description: "Name of the event", required: true },
          { name: "conversation_topic", description: "Topic you discussed", required: true },
          { name: "our_product", description: "Name of your product", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "key_benefit", description: "Main benefit your product provides", required: true },
          { name: "point_1", description: "First point from your conversation", required: true },
          { name: "point_2", description: "Second point from your conversation", required: true },
          { name: "point_3", description: "Third point from your conversation", required: true },
          { name: "specific_benefit", description: "Specific benefit for their company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Last Attempt Follow-up",
        content: "Hi {{recipient_name}},\n\nI hope you're doing well. This will be my final follow-up regarding {{topic}}.\n\nI understand you're busy, and I don't want to keep reaching out if {{our_product}} isn't a good fit for {{company_name}} at this time.\n\nHowever, I wanted to share one final piece of information that might be relevant: {{our_company}} just announced {{announcement}} that could significantly impact companies in {{industry}}.\n\nIf this sounds interesting and you'd like to learn more, I'd be happy to schedule a brief call. If not, I completely understand and will stop reaching out.\n\nEither way, I wish you continued success with {{company_name}}!\n\nBest regards,\n{{sender_name}}",
        useCase: "Final follow-up with clear opt-out",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "topic", description: "Topic of previous emails", required: true },
          { name: "our_product", description: "Name of your product", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "our_company", description: "Name of your company", required: true },
          { name: "announcement", description: "Recent announcement or news", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Seasonal Follow-up",
        content: "Hello {{recipient_name}},\n\nI hope you're enjoying {{season}}! As we approach {{time_period}}, I wanted to reach out with a quick update.\n\n{{our_company}} has been busy helping companies like {{company_name}} prepare for {{seasonal_challenge}}. {{our_product}} has been particularly effective in helping {{industry}} companies {{seasonal_benefit}}.\n\nFor example, {{success_company}} used {{our_product}} to {{seasonal_use_case}} and saw {{improvement_metric}}.\n\nGiven {{company_name}}'s focus on {{company_priority}}, I thought you might find this relevant.\n\nWould you be interested in a brief conversation about how {{our_product}} could help {{company_name}} {{specific_benefit}} this {{season}}?\n\nBest regards,\n{{sender_name}}",
        useCase: "Seasonal follow-up with relevant timing",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "season", description: "Current season or time period", required: true },
          { name: "time_period", description: "Specific time period (e.g., end of quarter)", required: true },
          { name: "our_company", description: "Name of your company", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "seasonal_challenge", description: "Challenge related to the season", required: true },
          { name: "our_product", description: "Name of your product", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "seasonal_benefit", description: "Benefit related to the season", required: true },
          { name: "success_company", description: "Name of a successful customer", required: true },
          { name: "seasonal_use_case", description: "How they used your product for seasonal needs", required: true },
          { name: "improvement_metric", description: "Improvement metric achieved", required: true },
          { name: "company_priority", description: "Current priority of their company", required: true },
          { name: "specific_benefit", description: "Specific benefit for their company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Case Study Follow-up",
        content: "Hi {{recipient_name}},\n\nI wanted to share an exciting update that might be relevant to {{company_name}}.\n\n{{our_company}} just published a case study about {{case_study_company}}, a {{industry}} company similar to {{company_name}}. They were facing {{challenge}} and used {{our_product}} to {{solution_approach}}.\n\nThe results were impressive:\n- {{result_1}}\n- {{result_2}}\n- {{result_3}}\n\nI thought you might find this interesting given {{company_name}}'s {{company_situation}}.\n\nWould you like to see the full case study? I'd also be happy to discuss how similar approaches might work for {{company_name}}.\n\nBest regards,\n{{sender_name}}",
        useCase: "Follow-up sharing a relevant case study",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "our_company", description: "Name of your company", required: true },
          { name: "case_study_company", description: "Name of the company in the case study", required: true },
          { name: "industry", description: "Industry of both companies", required: true },
          { name: "challenge", description: "Challenge the case study company faced", required: true },
          { name: "our_product", description: "Name of your product", required: true },
          { name: "solution_approach", description: "How they used your product", required: true },
          { name: "result_1", description: "First result achieved", required: true },
          { name: "result_2", description: "Second result achieved", required: true },
          { name: "result_3", description: "Third result achieved", required: true },
          { name: "company_situation", description: "Similar situation of the recipient's company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Product Update Follow-up",
        content: "Hello {{recipient_name}},\n\nI hope you're doing well! I wanted to share some exciting news about {{our_product}}.\n\nWe just released {{new_feature}} that addresses {{common_pain_point}} that many {{industry}} companies face. This feature helps companies like {{company_name}} {{key_benefit}}.\n\nHere's what's new:\n- {{feature_1}}\n- {{feature_2}}\n- {{feature_3}}\n\n{{early_adopter_company}} has been testing this feature and already sees {{early_results}}.\n\nGiven {{company_name}}'s focus on {{company_priority}}, I thought you might find this update interesting.\n\nWould you like to see a quick demo of these new features?\n\nBest regards,\n{{sender_name}}",
        useCase: "Follow-up announcing product updates",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "our_product", description: "Name of your product", required: true },
          { name: "new_feature", description: "Name of the new feature", required: true },
          { name: "common_pain_point", description: "Common pain point the feature addresses", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "key_benefit", description: "Main benefit of the new feature", required: true },
          { name: "feature_1", description: "First new feature", required: true },
          { name: "feature_2", description: "Second new feature", required: true },
          { name: "feature_3", description: "Third new feature", required: true },
          { name: "early_adopter_company", description: "Name of an early adopter", required: true },
          { name: "early_results", description: "Results from early adopters", required: true },
          { name: "company_priority", description: "Current priority of their company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Re-engagement Follow-up",
        content: "Hi {{recipient_name}},\n\nI hope this email finds you well. It's been a while since we last connected about {{topic}}.\n\nI wanted to reach out because {{our_company}} has made significant improvements to {{our_product}} since we last spoke. We've added {{new_capabilities}} that I believe could be valuable for {{company_name}}.\n\nSpecifically, {{our_product}} now helps companies in {{industry}} {{enhanced_benefit}}. {{recent_customer}} is a great example - they {{specific_achievement}} after implementing our updated solution.\n\nI know priorities change, but I wanted to make sure you're aware of these improvements in case they're relevant to {{company_name}}'s current goals.\n\nWould you be interested in a brief update call to discuss how {{our_product}} might fit into your current plans?\n\nBest regards,\n{{sender_name}}",
        useCase: "Re-engaging after a long period of no contact",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "topic", description: "Topic of previous conversations", required: true },
          { name: "our_company", description: "Name of your company", required: true },
          { name: "our_product", description: "Name of your product", required: true },
          { name: "new_capabilities", description: "New capabilities added", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "industry", description: "Industry of the recipient's company", required: true },
          { name: "enhanced_benefit", description: "Enhanced benefit your product now provides", required: true },
          { name: "recent_customer", description: "Name of a recent customer", required: true },
          { name: "specific_achievement", description: "Specific achievement of the customer", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
      },
      {
        title: "Success Story Follow-up",
        content: "Hello {{recipient_name}},\n\nI wanted to share some exciting news that might be relevant to {{company_name}}.\n\n{{success_company}}, a {{industry}} company similar to {{company_name}}, just achieved {{major_achievement}} using {{our_product}}. They were able to {{specific_outcome}} in just {{timeframe}}.\n\nWhat's particularly interesting is that {{success_company}} was facing {{similar_challenge}} to what many {{industry}} companies experience, including {{company_name}}'s focus on {{company_priority}}.\n\nI thought you might find this success story valuable, especially given {{company_name}}'s {{company_situation}}.\n\nWould you be interested in learning more about how {{our_product}} helped {{success_company}} achieve these results?\n\nBest regards,\n{{sender_name}}",
        useCase: "Follow-up sharing a success story",
        variables: [
          { name: "recipient_name", description: "Name of the recipient", required: true },
          { name: "company_name", description: "Recipient's company name", required: true },
          { name: "success_company", description: "Name of the successful customer", required: true },
          { name: "industry", description: "Industry of both companies", required: true },
          { name: "major_achievement", description: "Major achievement of the successful customer", required: true },
          { name: "our_product", description: "Name of your product", required: true },
          { name: "specific_outcome", description: "Specific outcome achieved", required: true },
          { name: "timeframe", description: "Time it took to achieve the outcome", required: true },
          { name: "similar_challenge", description: "Challenge similar to what the recipient faces", required: true },
          { name: "company_priority", description: "Current priority of the recipient's company", required: true },
          { name: "company_situation", description: "Current situation of the recipient's company", required: true },
          { name: "sender_name", description: "Your name", required: true }
        ]
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
