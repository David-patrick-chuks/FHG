'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplatesAPI } from '@/lib/api/templates';
import { Template } from '@/types';
import { format } from 'date-fns';
import { Calendar, Eye, FileText, Search, Star, Tag, ThumbsUp, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CommunityTemplatesTabProps {
  popularTemplates: Template[];
  onTemplatesLoaded: (templates: Template[]) => void;
  onTemplateAdded?: () => void;
}

export function CommunityTemplatesTab({
  popularTemplates,
  onTemplatesLoaded,
  onTemplateAdded
}: CommunityTemplatesTabProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('popular');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [addingTemplate, setAddingTemplate] = useState<string | null>(null);
  const [addedTemplates, setAddedTemplates] = useState<Set<string>>(new Set());

  // Initialize with popular templates from props
  useEffect(() => {
    if (activeTab === 'popular' && popularTemplates.length > 0) {
      setTemplates(popularTemplates);
      onTemplatesLoaded(popularTemplates);
    }
  }, [popularTemplates, activeTab, onTemplatesLoaded]);

  // Load templates based on active tab (only for non-popular tabs or when popular templates are empty)
  useEffect(() => {
    if (activeTab !== 'popular' || popularTemplates.length === 0) {
      loadTemplates();
    }
  }, [activeTab, searchQuery, categoryFilter, sortBy]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (activeTab === 'popular') {
        response = await TemplatesAPI.getPopularTemplates(20);
      } else {
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (categoryFilter !== 'all') params.category = categoryFilter;
        if (sortBy === 'newest') params.sort = 'newest';
        if (sortBy === 'rating') params.sort = 'rating';
        
        response = await TemplatesAPI.getCommunityTemplates(params);
      }

      if (response.success && response.data) {
        setTemplates(response.data);
        onTemplatesLoaded(response.data);
      } else {
        setError(response.message || 'Failed to load templates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      setAddingTemplate(templateId);
      
      const response = await TemplatesAPI.useTemplate(templateId);
      if (response.success) {
        // Add to added templates set for visual feedback
        setAddedTemplates(prev => new Set(prev).add(templateId));
        
        // Update the specific template's usage count locally
        setTemplates(prev => prev.map(template => 
          template._id === templateId 
            ? { ...template, usageCount: template.usageCount + 1 }
            : template
        ));
        
        toast.success('Template added to your collection!', {
          description: 'You can now find it in your "My Templates" tab.',
          duration: 4000,
        });
        
        // Notify parent component to refresh my templates count (but don't reload all templates)
        if (onTemplateAdded) {
          onTemplateAdded();
        }
        
        // Reset the added state after a delay for visual feedback
        setTimeout(() => {
          setAddedTemplates(prev => {
            const newSet = new Set(prev);
            newSet.delete(templateId);
            return newSet;
          });
        }, 3000);
        
      } else {
        toast.error(response.message || 'Failed to add template');
      }
    } catch (error) {
      toast.error('Failed to add template');
    } finally {
      setAddingTemplate(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-blue-500 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const TemplateCard = ({ template }: { template: Template }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold line-clamp-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {template.name}
              </CardTitle>
              {template.featured && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {template.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Category and Industry */}
        <div className="flex items-center justify-between">
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-sm">
            {getCategoryLabel(template.category)}
          </Badge>
          {template.industry && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm text-xs">
              {template.industry}
            </Badge>
          )}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {template.samples?.length || 0}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Samples</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
              {template.variables?.length || 0}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Variables</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              {template.usageCount}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Uses</div>
          </div>
        </div>
        
        {/* Rating */}
        {template.rating && template.rating.count > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(template.rating.average) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              {template.rating.average.toFixed(1)}
            </span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              ({template.rating.count} reviews)
            </span>
          </div>
        )}

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs border-0">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs border-0">
                +{template.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Calendar className="w-3 h-3" />
          {format(new Date(template.createdAt), 'MMM d, yyyy')}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => router.push(`/dashboard/templates/preview/${template._id}`)}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={() => handleUseTemplate(template._id)}
            disabled={addingTemplate === template._id || addedTemplates.has(template._id)}
            className={`flex-1 transition-all duration-200 ${
              addedTemplates.has(template._id)
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl'
            }`}
            size="sm"
          >
            {addingTemplate === template._id ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Adding...
              </>
            ) : addedTemplates.has(template._id) ? (
              <>
                <div className="w-4 h-4 mr-2">✓</div>
                Added!
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search community templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="follow_up">Follow Up</SelectItem>
            <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
            <SelectItem value="networking">Networking</SelectItem>
            <SelectItem value="partnership">Partnership</SelectItem>
            <SelectItem value="customer_success">Customer Success</SelectItem>
            <SelectItem value="recruitment">Recruitment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            All Templates
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Featured
          </TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading popular templates...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={loadTemplates} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template._id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading templates...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={loadTemplates} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template._id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading featured templates...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={loadTemplates} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => t.featured).map((template) => (
                <TemplateCard key={template._id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!loading && !error && templates.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Tag className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters to find more templates.
          </p>
        </div>
      )}
    </div>
  );
}
