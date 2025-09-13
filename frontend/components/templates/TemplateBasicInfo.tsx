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
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Sales Follow-up Template"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: TemplateCategory) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
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
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this template is used for..."
          rows={3}
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry (Optional)</Label>
          <Input
            id="industry"
            value={formData.industry}
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            placeholder="e.g., Technology, Healthcare"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
          <Input
            id="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
            placeholder="e.g., B2B Sales Teams"
          />
        </div>
      </div>
    </div>
  );
}
