'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateTemplateRequest, TemplateCategory } from '@/types';

interface TemplateBasicInfoProps {
  formData: CreateTemplateRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateTemplateRequest>>;
}

const categoryOptions: { value: TemplateCategory; label: string }[] = [
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'networking', label: 'Networking' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'customer_success', label: 'Customer Success' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'event_invitation', label: 'Event Invitation' },
  { value: 'thank_you', label: 'Thank You' },
  { value: 'apology', label: 'Apology' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'feedback_request', label: 'Feedback Request' },
  { value: 'other', label: 'Other' }
];

export function TemplateBasicInfo({ formData, setFormData }: TemplateBasicInfoProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Template Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Basic details about your email template
        </p>
      </div>

      {/* Basic Information */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">
            Template Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Sales Follow-up Template"
            required
            className="h-10 sm:h-11 text-sm sm:text-base border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:focus:border-blue-400 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value: TemplateCategory) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:focus:border-blue-400">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">
          Description *
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this template is used for..."
          rows={3}
          required
          className="text-sm sm:text-base border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:focus:border-blue-400 transition-all duration-200"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">
            Industry (Optional)
          </Label>
          <Input
            id="industry"
            value={formData.industry}
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            placeholder="e.g., Technology, Healthcare"
            className="h-10 sm:h-11 text-sm sm:text-base border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:focus:border-blue-400 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience" className="text-blue-700 dark:text-blue-300 font-medium text-sm sm:text-base">
            Target Audience (Optional)
          </Label>
          <Input
            id="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
            placeholder="e.g., B2B Sales Teams"
            className="h-10 sm:h-11 text-sm sm:text-base border-blue-200 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-800 dark:focus:border-blue-400 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}
