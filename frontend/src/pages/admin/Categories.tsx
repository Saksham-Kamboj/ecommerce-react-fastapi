import { useState, useEffect, useCallback, useMemo, type SubmitEvent } from "react"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"

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
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { categoriesApi } from "@/lib/api/categories"
import type { CategoryOut, CategoryCreate } from "@/types/category"
import type { Pagination as PaginationType } from "@/types/api"
import { toast } from "sonner"

interface CategoryColumnsProps {
  onEdit: (category: CategoryOut) => void
  onDelete: (category: CategoryOut) => void
}

function getCategoryColumns({
  onEdit,
  onDelete,
}: CategoryColumnsProps): ColumnDef<CategoryOut>[] {
  return [
    {
      header: "Name",
      className: "pl-6 min-w-[200px]",
      cell: (category) => (
        <span className="font-semibold text-foreground">{category.name}</span>
      ),
    },
    {
      header: "Slug",
      className: "w-[200px]",
      cell: (category) => (
        <span className="text-muted-foreground">{category.slug}</span>
      ),
    },
    {
      header: "Actions",
      className: "w-[100px] pr-6 text-right",
      cell: (category) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(category)}
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(category.id)}
                >
                  Copy category ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(category)}
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
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryOut[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination & Search state
  const [page, setPage] = useState(1)
  const limit = 10
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryOut | null>(
    null
  )

  const [formData, setFormData] = useState<CategoryCreate>({
    name: "",
    slug: "",
  })

  const handleEditCategory = useCallback((category: CategoryOut) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
    })
    setIsFormOpen(true)
  }, [])

  const handleDeleteClick = useCallback((category: CategoryOut) => {
    setSelectedCategory(category)
    setIsDeleteOpen(true)
  }, [])

  const categoryColumns = useMemo(
    () =>
      getCategoryColumns({
        onEdit: handleEditCategory,
        onDelete: handleDeleteClick,
      }),
    [handleEditCategory, handleDeleteClick]
  )

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    let ignore = false
    const loadCategories = async () => {
      setIsLoading(true)
      try {
        const skip = (page - 1) * limit
        const res = await categoriesApi.getCategories({
          skip,
          limit,
          search: debouncedSearch,
        })
        if (!ignore) {
          setCategories(res.data)
          setPagination(res.pagination)
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch categories"
          )
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    loadCategories()
    return () => {
      ignore = true
    }
  }, [page, limit, refreshTrigger, debouncedSearch])

  const handleCreateCategory = () => {
    setSelectedCategory(null)
    setFormData({ name: "", slug: "" })
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (selectedCategory) {
        const res = await categoriesApi.updateCategory(
          selectedCategory.id,
          formData
        )
        toast.success(res.message)
      } else {
        const res = await categoriesApi.createCategory(formData)
        toast.success(res.message)
      }
      setIsFormOpen(false)
      setIsLoading(true)
      setError(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete product"
      )
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return
    try {
      const res = await categoriesApi.deleteCategory(selectedCategory.id)
      setIsDeleteOpen(false)
      setIsLoading(true)
      setError(null)
      setRefreshTrigger((prev) => prev + 1)
      toast.success(res.message)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete product"
      )
    }
  }

  const handlePageChange = (newPage: number) => {
    setIsLoading(true)
    setError(null)
    setPage(newPage)
  }

  return (
    <div className="flex-1 space-y-3">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product categories.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchInput
            containerClassName="sm:w-64"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={handleCreateCategory}
            className="cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      <DataTable
        data={categories}
        columns={categoryColumns}
        isLoading={isLoading}
        error={error}
        emptyMessage="No categories found."
        pagination={pagination}
        onPageChange={handlePageChange}
        showIndex={true}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value
                  setFormData({
                    ...formData,
                    name,
                    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  })
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">
                {selectedCategory ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the category "
              {selectedCategory?.name}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
