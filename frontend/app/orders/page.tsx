/**
 * Orders Page
 * View and manage all orders
 */

'use client'

import { useState } from 'react'
import { useOrders } from '@/lib/application/hooks/useOrders'
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'
import { OrderService } from '@/lib/application/services/OrderService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderStatus } from '@/lib/domain/entities/Order'

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined)
  const { currentLocation } = useAppStore()
  const { orders, loading, refresh } = useOrders({ status: selectedStatus })
  const orderService = new OrderService()

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      refresh()
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    }
  }

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Location Selected</h2>
          <p className="text-muted-foreground">
            Please select a location to view orders
          </p>
        </div>
      </div>
    )
  }

  const statuses: Array<{ value: OrderStatus | undefined; label: string }> = [
    { value: undefined, label: 'All' },
    { value: 'queued', label: 'Queued' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'ready', label: 'Ready' },
    { value: 'paid', label: 'Paid' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage all orders for {currentLocation.name}
          </p>
        </div>
        <Button onClick={refresh}>
          Refresh
        </Button>
      </div>

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Button
                key={status.label}
                variant={selectedStatus === status.value ? 'default' : 'outline'}
                onClick={() => setSelectedStatus(status.value)}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedStatus ? `${selectedStatus} Orders` : 'All Orders'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Order #{order.number}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {order.formatTotal()}
                      </div>
                      <div
                        className={`text-sm px-2 py-1 rounded inline-block ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : order.status === 'ready'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.getStatusDisplay()}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <div>
                          <span className="font-medium">{item.quantity}x</span>{' '}
                          {item.productName} ({item.sizeName})
                          {item.modifiers.length > 0 && (
                            <div className="text-xs text-muted-foreground ml-6">
                              + {item.modifiers.map(m => m.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="font-medium">
                          {item.formatLineTotal()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="text-sm p-2 bg-muted/50 rounded">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </div>
                  )}

                  {/* Status Actions */}
                  {order.canBeEdited() && (
                    <div className="flex gap-2 pt-2">
                      {order.getNextPossibleStatuses().map((nextStatus) => (
                        <Button
                          key={nextStatus}
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        >
                          Mark as {nextStatus.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

