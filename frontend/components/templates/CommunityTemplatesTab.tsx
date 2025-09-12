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
import { Calendar, Search, Star, Tag, ThumbsUp, TrendingUp, Users } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('popular');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Load templates based on active tab
  useEffect(() => {
    loadTemplates();
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
      const response = await TemplatesAPI.useTemplate(templateId);
      if (response.success) {
        toast.success('Template added to your collection!');
        // Refresh templates to update usage count
        loadTemplates();
        // Notify parent component to refresh my templates count
        if (onTemplateAdded) {
          onTemplateAdded();
        }
      } else {
        toast.error(response.message || 'Failed to use template');
      }
    } catch (error) {
      toast.error('Failed to use template');
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {template.description}
            </CardDescription>
          </div>
          {template.featured && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {getCategoryLabel(template.category)}
            </Badge>
            {template.industry && (
              <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 text-xs">
                {template.industry}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {template.samples.length} samples
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {template.usageCount} uses
            </div>
          </div>

          {template.rating.count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(template.rating.average)}
              </div>
              <span className="text-sm font-medium">{template.rating.average.toFixed(1)}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({template.rating.count})
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            {format(new Date(template.createdAt), 'MMM d, yyyy')}
          </div>

          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs">
                  +{template.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <Button 
            onClick={() => handleUseTemplate(template._id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Add to My Templates
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
