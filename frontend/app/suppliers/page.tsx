/**
 * Suppliers Page
 * Manage suppliers for the organization
 */

'use client'

import { useSuppliers, useSupplierCategories, useTopRatedSuppliers } from '@/lib/application/hooks/useSuppliers'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SuppliersPage() {
  const { currentOrganization } = useAppStore()
  const { suppliers, loading, refresh } = useSuppliers(true)
  const { categories } = useSupplierCategories()
  const { suppliers: topSuppliers } = useTopRatedSuppliers(5)

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Organization Selected</h2>
          <p className="text-muted-foreground">
            Please select an organization to manage suppliers
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supplier Management</h1>
          <p className="text-muted-foreground">
            Manage suppliers for {currentOrganization.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refresh} variant="outline">
            Refresh
          </Button>
          <Button>Add Supplier</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Suppliers</CardDescription>
            <CardTitle className="text-4xl">{suppliers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Active suppliers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Categories</CardDescription>
            <CardTitle className="text-4xl">{categories.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Unique categories
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Top Rated</CardDescription>
            <CardTitle className="text-4xl">{topSuppliers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              4+ star suppliers
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers */}
      {topSuppliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>⭐ Top Rated Suppliers</CardTitle>
            <CardDescription>Your highest-rated suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                >
                  <div>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {supplier.category || 'No category'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{supplier.getDisplayRating()}</div>
                    <div className="text-xs text-muted-foreground">
                      {supplier.getDeliveryTimeDisplay()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle>All Suppliers</CardTitle>
          <CardDescription>Complete supplier directory</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading suppliers...
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📦</div>
              <p>No suppliers found. Add your first supplier to get started!</p>
              <Button className="mt-4">Add Supplier</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {supplier.category || 'No category'} · {supplier.getPaymentTermsDisplay()}
                    </div>
                    {supplier.hasContactInfo() && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {supplier.contactEmail} {supplier.contactPhone && `· ${supplier.contactPhone}`}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">
                        {supplier.getDisplayRating()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {supplier.getDeliveryTimeDisplay()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        Create PO
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Filter suppliers by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button key={category} variant="outline" size="sm">
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

