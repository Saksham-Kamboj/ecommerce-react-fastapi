import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UserDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  userName: string
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
}: UserDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription className="pt-2">
            This action cannot be undone. This will permanently delete the user
            "{userName}" and remove their data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
