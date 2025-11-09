import Link from 'next/link'

export default function HomePage() {
  const features = [
    { icon: '🔐', title: 'Authentication', description: 'Secure user management', href: '/auth/login' },
    { icon: '📊', title: 'Dashboard', description: 'Real-time analytics', href: '/dashboard' },
    { icon: '🛒', title: 'Point of Sale', description: 'Fast order processing', href: '/pos' },
    { icon: '📋', title: 'Orders', description: 'Order management', href: '/orders' },
    { icon: '📦', title: 'Inventory', description: 'Stock tracking', href: '/inventory' },
    { icon: '☕', title: 'Products', description: 'Catalog management', href: '/catalog' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Brewly
        </h1>
        <p className="text-2xl text-muted-foreground mb-8">
          Complete Coffee Shop Management System
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mb-12">
          Multi-tenant SaaS platform built with clean architecture. 
          Manage products, orders, inventory, and more across multiple locations.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-lg font-semibold"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-8 py-4 border-2 border-border rounded-lg hover:bg-accent transition text-lg font-semibold"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-8 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="p-6 border rounded-lg hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-muted/20 py-16">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Built With Modern Tech</h2>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span className="px-4 py-2 bg-background border rounded-full">Next.js 14</span>
            <span className="px-4 py-2 bg-background border rounded-full">TypeScript</span>
            <span className="px-4 py-2 bg-background border rounded-full">Supabase</span>
            <span className="px-4 py-2 bg-background border rounded-full">Tailwind CSS</span>
            <span className="px-4 py-2 bg-background border rounded-full">Clean Architecture</span>
            <span className="px-4 py-2 bg-background border rounded-full">Zustand</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-muted-foreground text-sm">
        <p>© 2025 Brewly. Built with clean architecture principles.</p>
      </div>
    </div>
  )
}

