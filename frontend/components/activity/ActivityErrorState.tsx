import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ActivityErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ActivityErrorState({ error, onRetry }: ActivityErrorStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          <Button 
            onClick={onRetry} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
