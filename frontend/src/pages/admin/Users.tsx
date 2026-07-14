import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { usersApi } from "@/lib/api/users"
import type { UserOut, UserCreate, UserUpdate } from "@/types/auth"
import type { Pagination as PaginationType } from "@/types/api"
import { UserFormDialog } from "@/components/admin/users/UserFormDialog"
import { UserDeleteDialog } from "@/components/admin/users/UserDeleteDialog"

export function UsersPage() {
  const [users, setUsers] = useState<UserOut[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination & Search state
  const [page, setPage] = useState(1)
  const limit = 10
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Sort state
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reset to first page on new search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserOut | null>(null)

  useEffect(() => {
    let ignore = false
    const loadUsers = async () => {
      setIsLoading(true)
      try {
        const skip = (page - 1) * limit
        const res = await usersApi.getUsers(
          skip,
          limit,
          debouncedSearch,
          sortBy,
          sortOrder
        )
        if (!ignore) {
          setUsers(res.data)
          setPagination(res.pagination)
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to fetch users")
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    loadUsers()
    return () => {
      ignore = true
    }
  }, [page, limit, refreshTrigger, debouncedSearch, sortBy, sortOrder])

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
    setIsLoading(true)
    setError(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return
    try {
      await usersApi.deleteUser(selectedUser.id)
      setIsDeleteOpen(false)
      setIsLoading(true)
      setError(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      alert(
        "Failed to delete user: " +
          (err instanceof Error ? err.message : "Unknown error")
      )
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
    setPage(1) // Reset page on sort
  }

  // Helper to generate initials for avatar
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "??"
  }

  const userColumns: ColumnDef<UserOut>[] = [
    {
      header: "User",
      className: "pl-6",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border shadow-xs">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`}
              alt={user.full_name || user.email}
            />
            <AvatarFallback className="bg-primary/5 text-xs font-semibold text-primary">
              {getInitials(user.full_name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="leading-none font-medium text-foreground">
              {user.full_name || "Unknown User"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (user) => (
        <Badge
          variant={user.role === "superadmin" ? "default" : "secondary"}
          className={
            user.role === "superadmin"
              ? "bg-indigo-500 shadow-xs hover:bg-indigo-600"
              : ""
          }
        >
          {user.role}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (user) =>
        user.is_active ? (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
          >
            Inactive
          </Badge>
        ),
    },
    {
      header: "Joined",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "created_at",
      cell: (user) => (
        <span className="text-sm text-muted-foreground">
          {user.created_at
            ? format(new Date(user.created_at), "MMM d, yyyy")
            : "—"}
        </span>
      ),
    },
    {
      header: "Updated",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "updated_at",
      cell: (user) => (
        <span className="text-sm text-muted-foreground">
          {user.updated_at
            ? format(new Date(user.updated_at), "MMM d, yyyy")
            : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "w-[100px] pr-6 text-right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => handleEditUser(user)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                />
              }
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user.id)}
                >
                  Copy user ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(user)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const handlePageChange = (newPage: number) => {
    setIsLoading(true)
    setError(null)
    setPage(newPage)
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team members and their account permissions here.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchInput
            containerClassName="sm:w-64"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={handleCreateUser}
            className="cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <DataTable
        data={users}
        columns={userColumns}
        isLoading={isLoading}
        error={error}
        emptyMessage="No users found."
        pagination={pagination}
        onPageChange={handlePageChange}
        showIndex={true}
        sortColumn={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

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
