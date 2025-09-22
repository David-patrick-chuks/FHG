'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Campaign } from '@/types';

interface CampaignModalsProps {
  isPauseDialogOpen: boolean;
  setIsPauseDialogOpen: (open: boolean) => void;
  isStopDialogOpen: boolean;
  setIsStopDialogOpen: (open: boolean) => void;
  pausingCampaign: Campaign | null;
  stoppingCampaign: Campaign | null;
  isPausing: boolean;
  isStopping: boolean;
  onPauseConfirm: () => void;
  onStopConfirm: () => void;
}

export function CampaignModals({
  isPauseDialogOpen,
  setIsPauseDialogOpen,
  isStopDialogOpen,
  setIsStopDialogOpen,
  pausingCampaign,
  stoppingCampaign,
  isPausing,
  isStopping,
  onPauseConfirm,
  onStopConfirm
}: CampaignModalsProps) {
  return (
    <>
      {/* Pause Campaign Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to pause "{pausingCampaign?.name}"? This will stop sending emails to remaining recipients.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPauseDialogOpen(false);
              }}
              disabled={isPausing}
            >
              Cancel
            </Button>
            <Button 
              onClick={onPauseConfirm}
              disabled={isPausing}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isPausing ? 'Pausing...' : 'Pause Campaign'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stop Campaign Dialog */}
      <Dialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop "{stoppingCampaign?.name}"? This will permanently stop the campaign and cannot be resumed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsStopDialogOpen(false);
              }}
              disabled={isStopping}
            >
              Cancel
            </Button>
            <Button 
              onClick={onStopConfirm}
              disabled={isStopping}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isStopping ? 'Stopping...' : 'Stop Campaign'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
