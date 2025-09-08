'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Campaign } from '@/types';

interface CampaignDialogsProps {
  campaign: Campaign;
  isPauseDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isUpdating: boolean;
  onPauseDialogClose: () => void;
  onDeleteDialogClose: () => void;
  onPauseCampaign: () => void;
  onDeleteCampaign: () => void;
}

export function CampaignDialogs({
  campaign,
  isPauseDialogOpen,
  isDeleteDialogOpen,
  isUpdating,
  onPauseDialogClose,
  onDeleteDialogClose,
  onPauseCampaign,
  onDeleteCampaign
}: CampaignDialogsProps) {
  return (
    <>
      {/* Pause Campaign Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={onPauseDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to pause "{campaign.name}"? This will stop sending emails to remaining recipients.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onPauseDialogClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={onPauseCampaign}
              disabled={isUpdating}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isUpdating ? 'Pausing...' : 'Pause Campaign'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Campaign Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{campaign.name}"? This action cannot be undone and will permanently remove all campaign data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onDeleteDialogClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={onDeleteCampaign}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isUpdating ? 'Deleting...' : 'Delete Campaign'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
