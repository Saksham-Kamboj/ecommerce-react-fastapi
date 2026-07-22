import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { addressApi } from "@/lib/api/addresses"
import type { Address, AddressCreate } from "@/types/address"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Loader2Icon,
  MapPinIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
  Edit2Icon,
} from "lucide-react"

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const res = await addressApi.getAddresses()
      setAddresses(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    addressApi
      .getAddresses()
      .then((res) => {
        if (mounted) {
          setAddresses(res.data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error(err)
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await addressApi.deleteAddress(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      if (editingAddress?.id === id) setEditingAddress(null)
      toast.success("Address deleted")
    } catch (err) {
      console.error(err)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await addressApi.setDefaultAddress(id)
      const updated = res.data
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === updated.id }))
      )
      toast.success("Default address updated")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Saved Addresses</CardTitle>
              <CardDescription>Manage your delivery addresses.</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingAddress(null)}
              className="h-8 gap-1"
            >
              <PlusIcon className="h-4 w-4" /> Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-150 overflow-y-auto px-6 pb-5">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
              <MapPinIcon className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No address saved</p>
              <p className="text-xs text-muted-foreground">
                Add your delivery address on the right.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`relative rounded-lg border p-4 ${
                    address.is_default
                      ? "border-primary bg-primary/5"
                      : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="flex items-center gap-2 text-sm font-medium">
                          {address.title}
                          {address.is_default && (
                            <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                              <StarIcon className="h-3 w-3 fill-current" />
                              Default
                            </span>
                          )}
                        </h4>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                        <br />
                        {address.city}, {address.state} {address.postal_code}
                        <br />
                        {address.country}
                      </p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                      disabled={address.is_default}
                      onClick={() => handleSetDefault(address.id)}
                    >
                      {address.is_default
                        ? "Default Address"
                        : "Set as Default"}
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => setEditingAddress(address)}
                      >
                        <Edit2Icon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(address.id)}
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddressFormCard
        address={editingAddress}
        onSuccess={(newAddr) => {
          if (editingAddress) {
            setAddresses((prev) =>
              prev.map((a) => (a.id === newAddr.id ? newAddr : a))
            )
          } else {
            // New address, might be default if it's the first one, let's just refetch
            fetchAddresses()
          }
          setEditingAddress(null)
        }}
        onCancel={editingAddress ? () => setEditingAddress(null) : undefined}
      />
    </div>
  )
}

function AddressFormCard({
  address,
  onSuccess,
  onCancel,
}: {
  address: Address | null
  onSuccess: (a: Address) => void
  onCancel?: () => void
}) {
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<AddressCreate>({
    defaultValues: {
      title: "Home",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
  })

  // Reset form when editing address changes
  useEffect(() => {
    if (address) {
      reset({
        title: address.title,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || "",
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      })
    } else {
      reset({
        title: "Home",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      })
    }
  }, [address, reset])

  const onSubmit = async (data: AddressCreate) => {
    setIsSaving(true)
    try {
      let res
      if (address) {
        res = await addressApi.updateAddress(address.id, data)
        toast.success(res.message || "Address updated")
      } else {
        res = await addressApi.createAddress(data)
        toast.success(res.message || "Address added")
      }
      onSuccess(res.data)
      if (!address) reset()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save address."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {address ? "Edit Address" : "Add New Address"}
        </CardTitle>
        <CardDescription>
          {address
            ? "Update this delivery address."
            : "Enter a new delivery address."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="title">Address Title</Label>
            <Input
              id="title"
              placeholder="Home, Office, etc."
              {...register("title", { required: true })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              placeholder="123, Main Street"
              {...register("address_line1", { required: true })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="address_line2">Address Line 2 (optional)</Label>
            <Input
              id="address_line2"
              placeholder="Apartment, suite, etc."
              {...register("address_line2")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Mumbai"
                {...register("city", { required: true })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Maharashtra"
                {...register("state", { required: true })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="400001"
                {...register("postal_code", { required: true })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="India"
                {...register("country", { required: true })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSaving || (!isDirty && !!address)}
              className="w-full flex-1 sm:w-auto"
            >
              {isSaving && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {address ? "Update Address" : "Save Address"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full flex-1 sm:w-auto"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
