# Template Seed Data Script

This script populates the database with community templates for the email outreach bot.

## Prerequisites

1. Make sure you have an admin user in your database
2. Ensure your MongoDB connection is properly configured
3. Have the backend dependencies installed

## Usage

### Run the seed script:

```bash
# From the backend directory
npm run seed:templates
```

### Or run directly with tsx:

```bash
# From the backend directory
npx tsx scripts/seed-templates.ts
```

## What the script does:

1. **Connects to MongoDB** using the configured connection string
2. **Finds an admin user** to assign as the template creator
3. **Creates 2 comprehensive template packs** with 10+ samples each:
   - **Cold Outreach - SaaS Introduction** (12 samples)
   - **Follow-up Email Templates** (12 samples)

## Template Features:

Each template includes:
- ✅ **10+ samples** (minimum requirement for campaign use)
- ✅ **Variable placeholders** for personalization
- ✅ **Use case descriptions** for each sample
- ✅ **Professional content** ready for B2B outreach
- ✅ **Approved status** for immediate use
- ✅ **Featured status** for visibility
- ✅ **Comprehensive tags** for easy discovery

## Template Categories Covered:

- **Cold Outreach**: Initial contact templates for SaaS products
- **Follow-up**: Nurturing and relationship maintenance templates

## Variables Available:

Each template sample includes variables like:
- `{{recipient_name}}` - Name of the recipient
- `{{company_name}}` - Recipient's company name
- `{{industry}}` - Industry of the recipient's company
- `{{our_product}}` - Name of your SaaS product
- `{{sender_name}}` - Your name
- And many more context-specific variables

## After Running:

1. Templates will be available in the community templates section
2. Users can select these templates when creating campaigns
3. The AI will use these samples to generate 20 variations per sample
4. Templates are immediately usable for campaigns

## Customization:

To add more templates or modify existing ones:
1. Edit the `templateSeedData` array in `seed-templates.ts`
2. Follow the same structure as existing templates
3. Ensure each template has at least 10 samples
4. Run the script again

## Notes:

- The script will not delete existing templates (commented out for safety)
- Templates are created with admin user as the creator
- All templates are automatically approved and published
- Featured templates appear prominently in the community section
