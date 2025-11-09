/**
 * Development Context Switcher
 * Allows easy switching between organizations, locations, and roles during development
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/infrastructure/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Org {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  org_id: string;
  address: string;
}

interface DevContext {
  orgId: string | null;
  locationId: string | null;
  role: 'owner' | 'admin' | 'cashier';
}

export function DevContextSwitcher() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedContext, setSelectedContext] = useState<DevContext>({
    orgId: null,
    locationId: null,
    role: 'admin',
  });
  const [isVisible, setIsVisible] = useState(true);

  // Load organizations and locations
  useEffect(() => {
    loadData();
  }, []);

  // Filter locations based on selected org
  const filteredLocations = locations.filter(
    (loc) => loc.org_id === selectedContext.orgId
  );

  async function loadData() {
    // Load organizations
    const { data: orgsData } = await supabase
      .from('orgs')
      .select('id, name')
      .order('name');

    // Load locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('id, name, org_id, address')
      .order('name');

    if (orgsData) setOrgs(orgsData);
    if (locationsData) setLocations(locationsData);

    // Load saved context from localStorage
    const saved = localStorage.getItem('dev_context');
    if (saved) {
      setSelectedContext(JSON.parse(saved));
    }
  }

  function updateContext(updates: Partial<DevContext>) {
    const newContext = { ...selectedContext, ...updates };
    
    // If org changes, reset location
    if (updates.orgId && updates.orgId !== selectedContext.orgId) {
      newContext.locationId = null;
    }

    setSelectedContext(newContext);
    localStorage.setItem('dev_context', JSON.stringify(newContext));

    // Trigger a custom event so other components can react
    window.dispatchEvent(
      new CustomEvent('devContextChanged', { detail: newContext })
    );
  }

  function clearContext() {
    const clearedContext = {
      orgId: null,
      locationId: null,
      role: 'admin' as const,
    };
    setSelectedContext(clearedContext);
    localStorage.removeItem('dev_context');
    window.dispatchEvent(
      new CustomEvent('devContextChanged', { detail: clearedContext })
    );
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 z-50"
      >
        🔧 Dev Tools
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-2xl z-50 w-96 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-purple-900">🔧 Dev Context</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Organization Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization
        </label>
        <select
          value={selectedContext.orgId || ''}
          onChange={(e) => updateContext({ orgId: e.target.value || null })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select Organization...</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <select
          value={selectedContext.locationId || ''}
          onChange={(e) => updateContext({ locationId: e.target.value || null })}
          disabled={!selectedContext.orgId}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Location...</option>
          {filteredLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
        {selectedContext.orgId && filteredLocations.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            No locations for this organization
          </p>
        )}
      </div>

      {/* Role Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['owner', 'admin', 'cashier'] as const).map((role) => (
            <button
              key={role}
              onClick={() => updateContext({ role })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedContext.role === role
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current Context Display */}
      {selectedContext.orgId && (
        <div className="bg-white rounded-lg p-3 mb-4 border border-purple-200">
          <p className="text-xs font-semibold text-purple-900 mb-1">
            Current Context:
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-medium">Org:</span>{' '}
            {orgs.find((o) => o.id === selectedContext.orgId)?.name || 'N/A'}
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-medium">Location:</span>{' '}
            {locations.find((l) => l.id === selectedContext.locationId)?.name ||
              'None'}
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-medium">Role:</span>{' '}
            {selectedContext.role}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={clearContext}
          variant="outline"
          className="flex-1 text-xs"
        >
          Clear
        </Button>
        <Button
          onClick={loadData}
          variant="outline"
          className="flex-1 text-xs"
        >
          Refresh
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Context saved to localStorage
      </p>
    </Card>
  );
}

/**
 * Hook to use the dev context in components
 */
export function useDevContext() {
  const [context, setContext] = useState<DevContext>({
    orgId: null,
    locationId: null,
    role: 'admin',
  });

  useEffect(() => {
    // Load initial context
    const saved = localStorage.getItem('dev_context');
    if (saved) {
      setContext(JSON.parse(saved));
    }

    // Listen for context changes
    const handleContextChange = (event: CustomEvent<DevContext>) => {
      setContext(event.detail);
    };

    window.addEventListener(
      'devContextChanged',
      handleContextChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'devContextChanged',
        handleContextChange as EventListener
      );
    };
  }, []);

  return context;
}

