/**
 * Inventory Page
 * Manage ingredients and stock levels
 */

'use client'

import { useIngredients, useInventoryAlerts, useInventoryValue } from '@/lib/application/hooks/useInventory'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/shared/utils/currency'

export default function InventoryPage() {
  const { currentLocation } = useAppStore()
  const { ingredients, loading, refresh } = useIngredients()
  const { alerts, loading: alertsLoading } = useInventoryAlerts()
  const { totalValue, loading: valueLoading } = useInventoryValue()

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Location Selected</h2>
          <p className="text-muted-foreground">
            Please select a location to manage inventory
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
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage ingredients for {currentLocation.name}
          </p>
        </div>
        <Button onClick={refresh}>
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Ingredients</CardDescription>
            <CardTitle className="text-4xl">{ingredients.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Active ingredients in stock
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Stock Alerts</CardDescription>
            <CardTitle className="text-4xl text-orange-600">
              {alertsLoading ? '...' : alerts.totalAlerts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {alerts.outOfStock.length} out of stock · {alerts.lowStock.length} low stock
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Inventory Value</CardDescription>
            <CardTitle className="text-4xl">
              {valueLoading ? '...' : formatCents(totalValue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Total value of on-hand stock
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {!alertsLoading && alerts.totalAlerts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-orange-600">⚠️</span>
              Stock Alerts
            </CardTitle>
            <CardDescription>Ingredients that need attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.outOfStock.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50"
              >
                <div>
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-sm text-red-600">Out of Stock</div>
                </div>
                <Button size="sm" variant="destructive">
                  Reorder
                </Button>
              </div>
            ))}
            {alerts.lowStock.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50"
              >
                <div>
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-sm text-orange-600">
                    Low Stock: {ingredient.getOnHandDisplay()} (threshold: {ingredient.lowStockThreshold} {ingredient.unit})
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Reorder
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Ingredients List */}
      <Card>
        <CardHeader>
          <CardTitle>All Ingredients</CardTitle>
          <CardDescription>Complete inventory list</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading ingredients...
            </div>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No ingredients found. Add your first ingredient to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                >
                  <div className="flex-1">
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Unit cost: {formatCents(ingredient.unitCostInCents)} per {ingredient.unit}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        {ingredient.getOnHandDisplay()}
                      </div>
                      <div
                        className={`text-sm ${
                          ingredient.isOutOfStock()
                            ? 'text-red-600'
                            : ingredient.isLowStock()
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {ingredient.getStockStatusDisplay()}
                      </div>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <div className="font-medium">
                        {ingredient.formatStockValue()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total value
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      Adjust
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && ingredients.length > 0 && (
            <Button variant="outline" className="w-full mt-4">
              Add New Ingredient
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

