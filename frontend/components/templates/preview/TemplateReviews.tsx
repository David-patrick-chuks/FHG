'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Template } from '@/types';
import { MessageSquare, Star } from 'lucide-react';

interface TemplateReviewsProps {
  template: Template;
  userRating: number;
  userReview: string;
  submittingReview: boolean;
  onRatingChange: (rating: number) => void;
  onReviewChange: (review: string) => void;
  onSubmitReview: () => void;
}

export function TemplateReviews({
  template,
  userRating,
  userReview,
  submittingReview,
  onRatingChange,
  onReviewChange,
  onSubmitReview
}: TemplateReviewsProps) {
  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-t-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Reviews & Ratings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Share your experience with this template
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* User Review Form */}
          <div className="p-3 sm:p-4 border border-cyan-200 dark:border-cyan-800 rounded-lg bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/10 dark:to-blue-900/10">
            <h4 className="font-medium mb-3 text-cyan-700 dark:text-cyan-300 text-sm sm:text-base">Rate this template</h4>
            <div className="flex items-center justify-center sm:justify-start gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onRatingChange(star)}
                  className="text-xl sm:text-2xl hover:scale-110 transition-transform"
                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      star <= userRating
                        ? 'text-cyan-500 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={userReview}
              onChange={(e) => onReviewChange(e.target.value)}
              placeholder="Share your thoughts about this template..."
              className="w-full p-3 border border-cyan-200 dark:border-cyan-800 rounded-lg resize-none bg-white/50 dark:bg-gray-800/50 focus:border-cyan-500 focus:ring-cyan-500 dark:focus:border-cyan-400 text-sm sm:text-base"
              rows={3}
            />
            <Button
              onClick={onSubmitReview}
              disabled={submittingReview || !userRating || !userReview.trim()}
              className="mt-3 w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 h-10 sm:h-9 text-sm sm:text-base"
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>

          {/* Recent Reviews */}
          {template.reviews && template.reviews.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 text-cyan-700 dark:text-cyan-300 text-sm sm:text-base">Recent Reviews</h4>
              <div className="space-y-3">
                {template.reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="p-3 border border-cyan-200 dark:border-cyan-800 rounded-lg bg-white/30 dark:bg-gray-800/30">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-cyan-500 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
