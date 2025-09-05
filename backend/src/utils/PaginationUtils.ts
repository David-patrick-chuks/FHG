import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PaginationUtils {
  /**
   * Extract pagination parameters from request query
   */
  public static extractPaginationParams(req: Request): PaginationParams {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    const status = req.query.status as string;

    return {
      page,
      limit,
      offset,
      search,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      status
    };
  }

  /**
   * Create pagination result
   */
  public static createPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginationResult<T> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Validate pagination parameters
   */
  public static validatePaginationParams(params: PaginationParams): { isValid: boolean; error?: string } {
    if (params.page < 1) {
      return { isValid: false, error: 'Page must be greater than 0' };
    }

    if (params.limit < 1 || params.limit > 100) {
      return { isValid: false, error: 'Limit must be between 1 and 100' };
    }

    return { isValid: true };
  }

  /**
   * Create search regex for MongoDB
   */
  public static createSearchRegex(search: string): RegExp {
    return new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }

  /**
   * Create sort object for MongoDB
   */
  public static createSortObject(sortBy: string, sortOrder: 'asc' | 'desc'): Record<string, 1 | -1> {
    const order = sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: order };
  }

  /**
   * Get default sort for different entities
   */
  public static getDefaultSort(entityType: 'bot' | 'campaign' | 'subscription'): Record<string, 1 | -1> {
    switch (entityType) {
      case 'bot':
        return { createdAt: -1 };
      case 'campaign':
        return { createdAt: -1 };
      case 'subscription':
        return { createdAt: -1 };
      default:
        return { createdAt: -1 };
    }
  }
}
