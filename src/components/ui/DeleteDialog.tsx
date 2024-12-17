import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Dialog from './Dialog';
import Button from './Button';
import { cn } from '@/utils/cn';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  isLoading?: boolean;
}

export default function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading
}: DeleteDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm">{description}</p>
        </div>
        
        <div className={cn(
          "grid gap-3",
          "sm:grid-flow-col sm:justify-end"
        )}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className="!bg-red-600 hover:!bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}