export interface VariableValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  unusedVariables: string[];
  undeclaredVariables: string[];
  formattedSamples: Array<{
    subject: string;
    body: string;
  }>;
}

export interface TemplateSample {
  _id: string;
  subject: string;
  body: string;
  createdAt: Date;
}

export interface TemplateVariable {
  key: string;
  value: string;
  required: boolean;
}

/**
 * Extract all variables from text using regex pattern {{variable_name}}
 */
export function extractVariablesFromText(text: string): string[] {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = text.match(variableRegex);
  if (!matches) return [];
  
  return matches.map(match => match.replace(/\{\{|\}\}/g, '').trim());
}

/**
 * Format variable syntax in text - fix common syntax errors
 */
export function formatVariableSyntax(text: string): string {
  return text
    // Fix single braces: {variable} -> {{variable}}
    .replace(/\{([^}]+)\}/g, '{{$1}}')
    // Fix triple braces: {{{variable}}} -> {{variable}}
    .replace(/\{\{\{([^}]+)\}\}\}/g, '{{$1}}')
    // Fix spaces in braces: {{ variable }} -> {{variable}}
    .replace(/\{\{\s*([^}]+)\s*\}\}/g, '{{$1}}')
    // Fix mixed quotes: {{"variable"}} -> {{variable}}
    .replace(/\{\{["']([^"']+)["']\}\}/g, '{{$1}}')
    // Fix extra spaces: {{ variable_name }} -> {{variable_name}}
    .replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, '{{$1}}');
}

/**
 * Validate variables in template samples
 */
export function validateTemplateVariables(
  samples: TemplateSample[],
  declaredVariables: TemplateVariable[]
): VariableValidationResult {
  const declaredVarKeys = declaredVariables.map(v => v.key.toLowerCase());
  const usedVariables = new Set<string>();
  const undeclaredVariables = new Set<string>();
  const errors: string[] = [];
  const warnings: string[] = [];
  const formattedSamples: Array<{ subject: string; body: string }> = [];

  // Process each sample
  samples.forEach((sample, index) => {
    // Format the sample text
    const formattedSubject = formatVariableSyntax(sample.subject);
    const formattedBody = formatVariableSyntax(sample.body);
    
    formattedSamples.push({
      subject: formattedSubject,
      body: formattedBody
    });

    // Extract variables from both subject and body
    const subjectVars = extractVariablesFromText(formattedSubject);
    const bodyVars = extractVariablesFromText(formattedBody);
    const allVars = [...subjectVars, ...bodyVars];

    // Check for undeclared variables
    allVars.forEach(varName => {
      const varKey = varName.toLowerCase();
      if (!declaredVarKeys.includes(varKey)) {
        undeclaredVariables.add(varName);
        errors.push(`Sample ${index + 1}: Variable "{{${varName}}}" is used but not declared`);
      } else {
        usedVariables.add(varName);
      }
    });
  });

  // Check for unused declared variables
  const unusedVariables = declaredVariables
    .filter(v => !usedVariables.has(v.key.toLowerCase()))
    .map(v => v.key);

  if (unusedVariables.length > 0) {
    warnings.push(`Declared variables not used in any sample: ${unusedVariables.join(', ')}`);
  }

  // Check if any formatting was applied
  const hasFormattingChanges = samples.some((sample, index) => 
    sample.subject !== formattedSamples[index].subject || 
    sample.body !== formattedSamples[index].body
  );

  if (hasFormattingChanges) {
    warnings.push('Variable syntax has been automatically formatted');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    unusedVariables,
    undeclaredVariables: Array.from(undeclaredVariables),
    formattedSamples
  };
}

/**
 * Get variable usage statistics
 */
export function getVariableUsageStats(
  samples: TemplateSample[],
  declaredVariables: TemplateVariable[]
): {
  totalVariables: number;
  usedVariables: number;
  unusedVariables: number;
  undeclaredVariables: number;
  variableFrequency: Record<string, number>;
} {
  const declaredVarKeys = declaredVariables.map(v => v.key.toLowerCase());
  const usedVariables = new Set<string>();
  const undeclaredVariables = new Set<string>();
  const variableFrequency: Record<string, number> = {};

  samples.forEach(sample => {
    const subjectVars = extractVariablesFromText(sample.subject);
    const bodyVars = extractVariablesFromText(sample.body);
    const allVars = [...subjectVars, ...bodyVars];

    allVars.forEach(varName => {
      const varKey = varName.toLowerCase();
      variableFrequency[varName] = (variableFrequency[varName] || 0) + 1;
      
      if (!declaredVarKeys.includes(varKey)) {
        undeclaredVariables.add(varName);
      } else {
        usedVariables.add(varName);
      }
    });
  });

  return {
    totalVariables: declaredVariables.length,
    usedVariables: usedVariables.size,
    unusedVariables: declaredVariables.length - usedVariables.size,
    undeclaredVariables: undeclaredVariables.size,
    variableFrequency
  };
}
