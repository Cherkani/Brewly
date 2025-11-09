/**
 * Dashboard Page
 * Main dashboard with metrics and quick actions
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/application/hooks/useAuth'
import { useOrderStats, useRecentOrders } from '@/lib/application/hooks/useOrders'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/shared/utils/currency'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { currentLocation } = useAppStore()
  const { stats, loading: statsLoading } = useOrderStats()
  const { orders: recentOrders, loading: ordersLoading } = useRecentOrders(5)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Location Selected</h2>
          <p className="text-muted-foreground">
            Please select a location to view the dashboard
          </p>
        </div>
      </div>
    )
  }

  const totalActiveOrders = stats.queued + stats.in_progress + stats.ready
  const totalToday = recentOrders.reduce((sum, order) => sum + order.calculateTotal(), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening at {currentLocation.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Orders</CardDescription>
            <CardTitle className="text-4xl">{totalActiveOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.queued} queued · {stats.in_progress} in progress · {stats.ready} ready
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Today's Sales</CardDescription>
            <CardTitle className="text-4xl">{formatCents(totalToday)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {recentOrders.length} orders completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed Today</CardDescription>
            <CardTitle className="text-4xl">{stats.completed}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.paid} paid orders
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cancelled</CardDescription>
            <CardTitle className="text-4xl">{stats.cancelled}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Orders cancelled today
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/pos')}
            >
              <span className="text-2xl">🛒</span>
              <span>New Order (POS)</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/orders')}
            >
              <span className="text-2xl">📋</span>
              <span>View Orders</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/inventory')}
            >
              <span className="text-2xl">📦</span>
              <span>Manage Inventory</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/catalog')}
            >
              <span className="text-2xl">☕</span>
              <span>Manage Products</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/suppliers')}
            >
              <span className="text-2xl">🚚</span>
              <span>Suppliers</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/reports')}
            >
              <span className="text-2xl">📊</span>
              <span>Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your location</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading orders...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders yet. Create your first order in the POS!
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <div>
                    <div className="font-medium">Order #{order.number}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} item(s) · {order.getStatusDisplay()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{order.formatTotal()}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!ordersLoading && recentOrders.length > 0 && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.push('/orders')}
            >
              View All Orders
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

