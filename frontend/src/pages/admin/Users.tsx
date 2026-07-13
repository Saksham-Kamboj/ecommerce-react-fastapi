import { useState, useEffect, useCallback } from "react"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { usersApi } from "@/lib/api/users"
import type { UserOut, UserCreate, UserUpdate } from "@/types/auth"
import { UserFormDialog } from "@/components/admin/users/UserFormDialog"
import { UserDeleteDialog } from "@/components/admin/users/UserDeleteDialog"

export function UsersPage() {
  const [users, setUsers] = useState<UserOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserOut | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Currently fetching first 50 users (could add real pagination later)
      const res = await usersApi.getUsers(0, 50)
      setUsers(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers()
  }, [fetchUsers])

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: UserOut) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (user: UserOut) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = async (data: UserCreate | UserUpdate) => {
    if (selectedUser) {
      await usersApi.updateUser(selectedUser.id, data)
    } else {
      await usersApi.createUser(data as UserCreate)
    }
    setIsFormOpen(false)
    fetchUsers() // Refresh list
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return
    try {
      await usersApi.deleteUser(selectedUser.id)
      setIsDeleteOpen(false)
      fetchUsers() // Refresh list
    } catch (err) {
      alert(
        "Failed to delete user: " +
          (err instanceof Error ? err.message : "Unknown error")
      )
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Button onClick={handleCreateUser}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-destructive"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || "—"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "superadmin" ? "default" : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-600"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-600"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.created_at
                      ? format(new Date(user.created_at), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger 
                        render={<Button variant="ghost" className="h-8 w-8 p-0" />}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(user.id)}
                        >
                          Copy user ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        onSubmit={handleFormSubmit}
      />

      <UserDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        userName={selectedUser?.full_name || selectedUser?.email || "this user"}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
