'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot } from '@/types';
import { Loader2 } from 'lucide-react';

interface BotDialogsProps {
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  editingBot: Bot | null;
  deletingBot: Bot | null;
  formData: {
    name: string;
    description: string;
  };
  onFormDataChange: (data: { name: string; description: string }) => void;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  onSaveEdit: () => void;
  onConfirmDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function BotDialogs({
  isEditDialogOpen,
  isDeleteDialogOpen,
  editingBot,
  deletingBot,
  formData,
  onFormDataChange,
  onCloseEdit,
  onCloseDelete,
  onSaveEdit,
  onConfirmDelete,
  isSaving,
  isDeleting
}: BotDialogsProps) {
  return (
    <>
      {/* Edit Bot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={onCloseEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bot</DialogTitle>
            <DialogDescription>
              Update the bot's name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="Enter bot name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                placeholder="Enter bot description"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onCloseEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={onSaveEdit}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Bot Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={onCloseDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingBot?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onCloseDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Bot
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
