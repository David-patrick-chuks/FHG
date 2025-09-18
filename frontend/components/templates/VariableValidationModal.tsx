'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { VariableValidationResult } from '@/lib/utils/variableValidation';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface VariableValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: VariableValidationResult;
  onApplyFormatting: () => void;
  onIgnore: () => void;
}

export function VariableValidationModal({
  isOpen,
  onClose,
  validationResult,
  onApplyFormatting,
  onIgnore
}: VariableValidationModalProps) {
  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings.length > 0;
  const hasFormattingChanges = validationResult.warnings.some(w => w.includes('automatically formatted'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasErrors ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : hasWarnings ? (
              <Info className="w-5 h-5 text-yellow-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            Variable Validation Results
          </DialogTitle>
          <DialogDescription>
            {hasErrors 
              ? 'Issues found with variable usage in your template samples'
              : hasWarnings 
                ? 'Variable validation completed with some warnings'
                : 'All variables are properly declared and used'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Errors */}
          {hasErrors && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="font-semibold mb-2">Errors Found:</div>
                <ul className="space-y-1 text-sm">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <div className="font-semibold mb-2">Warnings:</div>
                <ul className="space-y-1 text-sm">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Variable Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Undeclared Variables
              </div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {validationResult.undeclaredVariables.length}
              </div>
              {validationResult.undeclaredVariables.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {validationResult.undeclaredVariables.map((variable, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
                Unused Variables
              </div>
              <div className="text-lg font-bold text-orange-800 dark:text-orange-200">
                {validationResult.unusedVariables.length}
              </div>
              {validationResult.unusedVariables.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {validationResult.unusedVariables.map((variable, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formatting Notice */}
          {hasFormattingChanges && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <div className="font-semibold mb-1">Auto-Formatting Available</div>
                <div className="text-sm">
                  We found some variable syntax issues that can be automatically fixed. 
                  Click "Apply Formatting" to fix them, or "Ignore" to keep the current format.
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          
          {hasFormattingChanges && (
            <Button
              onClick={onApplyFormatting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply Formatting
            </Button>
          )}
          
          <Button
            onClick={onIgnore}
            variant={hasErrors ? "destructive" : "default"}
            className="w-full sm:w-auto"
          >
            {hasErrors ? 'Ignore Errors' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
