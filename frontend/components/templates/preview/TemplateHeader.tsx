'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Template } from '@/types';
import { Calendar, FileText, Star, Tag, Users } from 'lucide-react';

interface TemplateHeaderProps {
  template: Template;
}

export function TemplateHeader({ template }: TemplateHeaderProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Template Title & Description */}
      <div className="text-center space-y-2 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          {template.name}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {template.description}
        </p>
      </div>

      {/* Template Overview Card */}
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs">
                  {template.category}
                </Badge>
                {template.industry && (
                  <Badge variant="outline" className="border-cyan-200 text-cyan-700 dark:border-cyan-800 dark:text-cyan-300 text-xs">
                    {template.industry}
                  </Badge>
                )}
                {template.featured && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  {template.samples?.length || 0} samples
                </div>
                <div className="flex items-center gap-1">
                  <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Tag className="w-3 h-3 text-white" />
                  </div>
                  {template.variables?.length || 0} variables
                </div>
                <div className="flex items-center gap-1">
                  <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  {template.usageCount} uses
                </div>
                <div className="flex items-center gap-1">
                  <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  {new Date(template.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-end gap-1 mb-1">
                <Star className="w-4 h-4 text-cyan-500 fill-current" />
                <span className="font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {template.rating?.average?.toFixed(1) || '0.0'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {template.rating?.count || 0} reviews
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Use Case</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{template.useCase}</p>
            </div>
            
            {template.targetAudience && (
              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Target Audience</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{template.targetAudience}</p>
              </div>
            )}

            {template.tags && template.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
