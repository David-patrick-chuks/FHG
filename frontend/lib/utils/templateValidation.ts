export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Template field validation rules matching backend schema
 */
export const TEMPLATE_VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Template name must be between 2 and 100 characters'
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500,
    message: 'Description must be between 10 and 500 characters'
  },
  useCase: {
    required: true,
    minLength: 10,
    maxLength: 500,
    message: 'Use case must be between 10 and 500 characters'
  },
  industry: {
    required: false,
    maxLength: 50,
    message: 'Industry must be 50 characters or less'
  },
  targetAudience: {
    required: false,
    maxLength: 100,
    message: 'Target audience must be 100 characters or less'
  },
  category: {
    required: true,
    validValues: ['sales', 'marketing', 'support', 'follow-up', 'cold-outreach', 'warm-outreach', 'retention', 'onboarding'],
    message: 'Please select a valid category'
  },
  variables: {
    key: {
      minLength: 1,
      maxLength: 50,
      message: 'Variable key must be between 1 and 50 characters'
    },
    value: {
      maxLength: 200,
      message: 'Variable value must be 200 characters or less'
    }
  },
  tags: {
    maxLength: 30,
    message: 'Each tag must be 30 characters or less'
  },
  samples: {
    minCount: 10,
    maxCount: 100,
    subject: {
      maxLength: 200,
      message: 'Subject line must be 200 characters or less'
    },
    body: {
      maxLength: 5000,
      message: 'Email body must be 5000 characters or less'
    }
  }
};

/**
 * Validate template name
 */
export function validateTemplateName(name: string): ValidationError | null {
  if (!name || !name.trim()) {
    return {
      field: 'name',
      message: 'Template name is required'
    };
  }

  const trimmed = name.trim();
  if (trimmed.length < TEMPLATE_VALIDATION_RULES.name.minLength) {
    return {
      field: 'name',
      message: `Template name must be at least ${TEMPLATE_VALIDATION_RULES.name.minLength} characters`,
      value: trimmed
    };
  }

  if (trimmed.length > TEMPLATE_VALIDATION_RULES.name.maxLength) {
    return {
      field: 'name',
      message: `Template name must be ${TEMPLATE_VALIDATION_RULES.name.maxLength} characters or less`,
      value: trimmed
    };
  }

  return null;
}

/**
 * Validate template description
 */
export function validateTemplateDescription(description: string): ValidationError | null {
  if (!description || !description.trim()) {
    return {
      field: 'description',
      message: 'Description is required'
    };
  }

  const trimmed = description.trim();
  if (trimmed.length < TEMPLATE_VALIDATION_RULES.description.minLength) {
    return {
      field: 'description',
      message: `Description must be at least ${TEMPLATE_VALIDATION_RULES.description.minLength} characters`,
      value: trimmed
    };
  }

  if (trimmed.length > TEMPLATE_VALIDATION_RULES.description.maxLength) {
    return {
      field: 'description',
      message: `Description must be ${TEMPLATE_VALIDATION_RULES.description.maxLength} characters or less`,
      value: trimmed
    };
  }

  return null;
}

/**
 * Validate template use case
 */
export function validateTemplateUseCase(useCase: string): ValidationError | null {
  if (!useCase || !useCase.trim()) {
    return {
      field: 'useCase',
      message: 'Use case is required'
    };
  }

  const trimmed = useCase.trim();
  if (trimmed.length < TEMPLATE_VALIDATION_RULES.useCase.minLength) {
    return {
      field: 'useCase',
      message: `Use case must be at least ${TEMPLATE_VALIDATION_RULES.useCase.minLength} characters`,
      value: trimmed
    };
  }

  if (trimmed.length > TEMPLATE_VALIDATION_RULES.useCase.maxLength) {
    return {
      field: 'useCase',
      message: `Use case must be ${TEMPLATE_VALIDATION_RULES.useCase.maxLength} characters or less`,
      value: trimmed
    };
  }

  return null;
}

/**
 * Validate template category
 */
export function validateTemplateCategory(category: string): ValidationError | null {
  if (!category) {
    return {
      field: 'category',
      message: 'Category is required'
    };
  }

  if (!TEMPLATE_VALIDATION_RULES.category.validValues.includes(category)) {
    return {
      field: 'category',
      message: TEMPLATE_VALIDATION_RULES.category.message,
      value: category
    };
  }

  return null;
}

/**
 * Validate industry field
 */
export function validateIndustry(industry: string): ValidationError | null {
  if (!industry || !industry.trim()) {
    return null; // Optional field
  }

  const trimmed = industry.trim();
  if (trimmed.length > TEMPLATE_VALIDATION_RULES.industry.maxLength) {
    return {
      field: 'industry',
      message: TEMPLATE_VALIDATION_RULES.industry.message,
      value: trimmed
    };
  }

  return null;
}

/**
 * Validate target audience field
 */
export function validateTargetAudience(targetAudience: string): ValidationError | null {
  if (!targetAudience || !targetAudience.trim()) {
    return null; // Optional field
  }

  const trimmed = targetAudience.trim();
  if (trimmed.length > TEMPLATE_VALIDATION_RULES.targetAudience.maxLength) {
    return {
      field: 'targetAudience',
      message: TEMPLATE_VALIDATION_RULES.targetAudience.message,
      value: trimmed
    };
  }

  return null;
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(variables: Array<{ key: string; value: string; required: boolean }>): ValidationError[] {
  const errors: ValidationError[] = [];

  variables.forEach((variable, index) => {
    // Validate variable key
    if (!variable.key || !variable.key.trim()) {
      errors.push({
        field: `variables[${index}].key`,
        message: 'Variable key is required'
      });
    } else {
      const trimmedKey = variable.key.trim();
      if (trimmedKey.length < TEMPLATE_VALIDATION_RULES.variables.key.minLength) {
        errors.push({
          field: `variables[${index}].key`,
          message: `Variable key must be at least ${TEMPLATE_VALIDATION_RULES.variables.key.minLength} character`,
          value: trimmedKey
        });
      }
      if (trimmedKey.length > TEMPLATE_VALIDATION_RULES.variables.key.maxLength) {
        errors.push({
          field: `variables[${index}].key`,
          message: `Variable key must be ${TEMPLATE_VALIDATION_RULES.variables.key.maxLength} characters or less`,
          value: trimmedKey
        });
      }
    }

    // Validate variable value
    if (!variable.value || !variable.value.trim()) {
      errors.push({
        field: `variables[${index}].value`,
        message: 'Variable value is required'
      });
    } else {
      const trimmedValue = variable.value.trim();
      if (trimmedValue.length > TEMPLATE_VALIDATION_RULES.variables.value.maxLength) {
        errors.push({
          field: `variables[${index}].value`,
          message: TEMPLATE_VALIDATION_RULES.variables.value.message,
          value: trimmedValue
        });
      }
    }
  });

  return errors;
}

/**
 * Validate template tags
 */
export function validateTemplateTags(tags: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  tags.forEach((tag, index) => {
    if (tag && tag.trim()) {
      const trimmedTag = tag.trim();
      if (trimmedTag.length > TEMPLATE_VALIDATION_RULES.tags.maxLength) {
        errors.push({
          field: `tags[${index}]`,
          message: TEMPLATE_VALIDATION_RULES.tags.message,
          value: trimmedTag
        });
      }
    }
  });

  return errors;
}

/**
 * Validate template samples
 */
export function validateTemplateSamples(samples: Array<{ subject: string; body: string }>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check sample count
  if (samples.length < TEMPLATE_VALIDATION_RULES.samples.minCount) {
    errors.push({
      field: 'samples',
      message: `Template must have at least ${TEMPLATE_VALIDATION_RULES.samples.minCount} samples`
    });
  }

  if (samples.length > TEMPLATE_VALIDATION_RULES.samples.maxCount) {
    errors.push({
      field: 'samples',
      message: `Template cannot have more than ${TEMPLATE_VALIDATION_RULES.samples.maxCount} samples`
    });
  }

  // Validate each sample
  samples.forEach((sample, index) => {
    // Validate subject
    if (!sample.subject || !sample.subject.trim()) {
      errors.push({
        field: `samples[${index}].subject`,
        message: 'Subject line is required'
      });
    } else {
      const trimmedSubject = sample.subject.trim();
      if (trimmedSubject.length > TEMPLATE_VALIDATION_RULES.samples.subject.maxLength) {
        errors.push({
          field: `samples[${index}].subject`,
          message: TEMPLATE_VALIDATION_RULES.samples.subject.message,
          value: trimmedSubject
        });
      }
    }

    // Validate body
    if (!sample.body || !sample.body.trim()) {
      errors.push({
        field: `samples[${index}].body`,
        message: 'Email body is required'
      });
    } else {
      const trimmedBody = sample.body.trim();
      if (trimmedBody.length > TEMPLATE_VALIDATION_RULES.samples.body.maxLength) {
        errors.push({
          field: `samples[${index}].body`,
          message: TEMPLATE_VALIDATION_RULES.samples.body.message,
          value: trimmedBody
        });
      }
    }
  });

  return errors;
}

/**
 * Validate complete template data
 */
export function validateTemplateData(templateData: {
  name: string;
  description: string;
  useCase: string;
  category: string;
  industry?: string;
  targetAudience?: string;
  variables: Array<{ key: string; value: string; required: boolean }>;
  tags: string[];
  samples: Array<{ subject: string; body: string }>;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate required fields
  const nameError = validateTemplateName(templateData.name);
  if (nameError) errors.push(nameError);

  const descriptionError = validateTemplateDescription(templateData.description);
  if (descriptionError) errors.push(descriptionError);

  const useCaseError = validateTemplateUseCase(templateData.useCase);
  if (useCaseError) errors.push(useCaseError);

  const categoryError = validateTemplateCategory(templateData.category);
  if (categoryError) errors.push(categoryError);

  // Validate optional fields
  if (templateData.industry) {
    const industryError = validateIndustry(templateData.industry);
    if (industryError) errors.push(industryError);
  }

  if (templateData.targetAudience) {
    const targetAudienceError = validateTargetAudience(templateData.targetAudience);
    if (targetAudienceError) errors.push(targetAudienceError);
  }

  // Validate arrays
  errors.push(...validateTemplateVariables(templateData.variables));
  errors.push(...validateTemplateTags(templateData.tags));
  errors.push(...validateTemplateSamples(templateData.samples));

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get character count for a field with limits
 */
export function getCharacterCountInfo(value: string, field: keyof typeof TEMPLATE_VALIDATION_RULES): {
  current: number;
  max: number;
  isValid: boolean;
  message?: string;
} {
  const trimmed = value?.trim() || '';
  const current = trimmed.length;
  
  switch (field) {
    case 'name':
      return {
        current,
        max: TEMPLATE_VALIDATION_RULES.name.maxLength,
        isValid: current >= TEMPLATE_VALIDATION_RULES.name.minLength && current <= TEMPLATE_VALIDATION_RULES.name.maxLength,
        message: current < TEMPLATE_VALIDATION_RULES.name.minLength 
          ? `Minimum ${TEMPLATE_VALIDATION_RULES.name.minLength} characters required`
          : undefined
      };
    case 'description':
      return {
        current,
        max: TEMPLATE_VALIDATION_RULES.description.maxLength,
        isValid: current >= TEMPLATE_VALIDATION_RULES.description.minLength && current <= TEMPLATE_VALIDATION_RULES.description.maxLength,
        message: current < TEMPLATE_VALIDATION_RULES.description.minLength 
          ? `Minimum ${TEMPLATE_VALIDATION_RULES.description.minLength} characters required`
          : undefined
      };
    case 'useCase':
      return {
        current,
        max: TEMPLATE_VALIDATION_RULES.useCase.maxLength,
        isValid: current >= TEMPLATE_VALIDATION_RULES.useCase.minLength && current <= TEMPLATE_VALIDATION_RULES.useCase.maxLength,
        message: current < TEMPLATE_VALIDATION_RULES.useCase.minLength 
          ? `Minimum ${TEMPLATE_VALIDATION_RULES.useCase.minLength} characters required`
          : undefined
      };
    case 'industry':
      return {
        current,
        max: TEMPLATE_VALIDATION_RULES.industry.maxLength,
        isValid: current <= TEMPLATE_VALIDATION_RULES.industry.maxLength
      };
    case 'targetAudience':
      return {
        current,
        max: TEMPLATE_VALIDATION_RULES.targetAudience.maxLength,
        isValid: current <= TEMPLATE_VALIDATION_RULES.targetAudience.maxLength
      };
    default:
      return {
        current,
        max: 0,
        isValid: true
      };
  }
}
