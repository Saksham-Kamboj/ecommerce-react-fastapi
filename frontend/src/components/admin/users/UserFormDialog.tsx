import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { UserCreate, UserUpdate, UserOut } from "@/types/auth"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["superadmin", "user"]),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: UserOut | null
  onSubmit: (data: UserCreate | UserUpdate) => Promise<void>
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserFormDialogProps) {
  const isEditing = !!user

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      role: "user",
      is_active: true,
    },
  })

  useEffect(() => {
    if (open && user) {
      form.reset({
        email: user.email,
        full_name: user.full_name || "",
        password: "", // Never populate password for editing
        role: user.role as "superadmin" | "user",
        is_active: user.is_active,
      })
    } else if (open && !user) {
      form.reset({
        email: "",
        full_name: "",
        password: "",
        role: "user",
        is_active: true,
      })
    }
  }, [open, user, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      const submitData = { ...values }

      // If editing and password is empty, don't send it
      if (isEditing && !submitData.password) {
        delete (submitData as Record<string, unknown>).password
      }

      await onSubmit(submitData)
      form.reset()
    } catch {
      // Error handled by parent
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>{isEditing ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to the user profile here. Click save when you're done."
              : "Add a new user to the platform. They will be able to log in immediately."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              {...form.register("full_name")}
            />
            {form.formState.errors.full_name && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="m@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password{" "}
              {isEditing && (
                <span className="text-xs font-normal text-muted-foreground">
                  (Leave blank to keep unchanged)
                </span>
              )}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="superadmin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.role && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="is_active">Active Account</Label>
              <p className="text-sm text-muted-foreground">
                Allow this user to log into the platform.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
