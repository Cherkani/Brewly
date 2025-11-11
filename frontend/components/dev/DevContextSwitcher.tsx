/**
 * Development Context Switcher
 * Allows easy switching between organizations, locations, and roles during development
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/infrastructure/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore';
import { useAuth } from '@/lib/application/hooks/useAuth';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuperuserHelper, setShowSuperuserHelper] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState<boolean | null>(null);
  const { setCurrentLocation, setCurrentOrganization, setLocations: setStoreLocations } = useAppStore();
  const { user, loading: authLoading, signOut } = useAuth();

  // Load organizations and locations
  useEffect(() => {
    loadData();
  }, []);

  // Filter locations based on selected org
  const filteredLocations = locations.filter(
    (loc) => loc.org_id === selectedContext.orgId
  );

  async function checkSuperuserStatus() {
    if (!user) {
      setIsSuperuser(false);
      return;
    }

    // Note: We can't directly query platform_superusers due to RLS policy
    // (only superusers can SELECT from it, creating a chicken-and-egg problem)
    // Instead, we'll infer superuser status from whether we can access orgs/locations
    // This will be set after we try to load data
    setIsSuperuser(null);
  }

  async function loadData() {
    setLoading(true);
    setError(null);
    
    // Check superuser status first
    await checkSuperuserStatus();
    
    try {
      // Load organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('orgs')
        .select('id, name')
        .order('name');

      if (orgsError) {
        console.error('Error loading organizations:', orgsError);
        
        // If we get permission denied, user is likely not a superuser
        if (orgsError.message.includes('permission denied for schema public')) {
          setIsSuperuser(false);
          setError(
            `Database permission error: ${orgsError.message}. ` +
            `This usually means you need to be a superuser. ` +
            `If you just ran the SQL to make yourself a superuser, try: ` +
            `1) Logging out and back in, or 2) Wait a few seconds and click Refresh.`
          );
        } else {
          setIsSuperuser(false);
          setError(`Failed to load organizations: ${orgsError.message}. You may need to be a superuser or have org membership.`);
        }
      } else {
        // Successfully loaded orgs - user has access (either superuser or member)
        // If they can see all orgs without being a member, they're likely a superuser
        // For now, we'll assume they have proper access
        setIsSuperuser(true);
        setOrgs(orgsData || []);
        if (!orgsData || orgsData.length === 0) {
          setError('No organizations found. You may need to create test data.');
        } else {
          // Clear error if we successfully loaded data
          setError(null);
        }
      }

      // Load locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name, org_id, address')
        .order('name');

      if (locationsError) {
        console.error('Error loading locations:', locationsError);
        if (!orgsError) {
          // Only set error if orgs loaded successfully
          if (locationsError.message.includes('permission denied for schema public')) {
            setIsSuperuser(false);
            setError(
              `Database permission error: ${locationsError.message}. ` +
              `This usually means you need to be a superuser. ` +
              `If you just ran the SQL to make yourself a superuser, try: ` +
              `1) Logging out and back in, or 2) Wait a few seconds and click Refresh.`
            );
          } else {
            setError(`Failed to load locations: ${locationsError.message}.`);
          }
        }
      } else {
        // Successfully loaded locations
        if (orgsData && orgsData.length > 0) {
          setIsSuperuser(true);
        }
        setLocations(locationsData || []);
        if (!locationsData || locationsData.length === 0 && orgsData && orgsData.length > 0) {
          setError(prev => prev 
            ? `${prev} No locations found.`
            : 'No locations found for the available organizations.'
          );
        }
      }

      // Load saved context from localStorage
      const saved = localStorage.getItem('dev_context');
      if (saved) {
        try {
          setSelectedContext(JSON.parse(saved));
        } catch (e) {
          console.error('Error parsing saved context:', e);
        }
      }
    } catch (err) {
      console.error('Unexpected error loading data:', err);
      setError('An unexpected error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  }

  async function updateContext(updates: Partial<DevContext>) {
    const newContext = { ...selectedContext, ...updates };
    
    // If org changes, reset location
    if (updates.orgId && updates.orgId !== selectedContext.orgId) {
      newContext.locationId = null;
      setCurrentLocation(null);
    }

    setSelectedContext(newContext);
    localStorage.setItem('dev_context', JSON.stringify(newContext));

    // Update app store
    if (updates.orgId) {
      const org = orgs.find((o) => o.id === updates.orgId);
      if (org) {
        setCurrentOrganization({
          id: org.id,
          name: org.name,
        });
      }
    }

    if (updates.locationId) {
      const location = locations.find((l) => l.id === updates.locationId);
      if (location) {
        const fullLocation = {
          id: location.id,
          name: location.name,
          orgId: location.org_id,
          address: location.address,
          timezone: 'UTC',
          isActive: true,
        };
        setCurrentLocation(fullLocation);
        
        // Also update locations array
        const currentLocations = useAppStore.getState().locations;
        if (!currentLocations.find((l) => l.id === location.id)) {
          setStoreLocations([...currentLocations, fullLocation]);
        }
      }
    } else if (updates.locationId === null) {
      setCurrentLocation(null);
    }

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
    
    // Clear app store
    setCurrentOrganization(null);
    setCurrentLocation(null);
    
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

      {/* Authentication Status */}
      {!authLoading && (
        <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-700">
            <span className="font-medium">Auth Status:</span>{' '}
            {user ? (
              <span className="text-green-700">✓ Logged in ({user.email})</span>
            ) : (
              <span className="text-amber-700">⚠ Not logged in</span>
            )}
          </p>
          {user && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-medium">User ID:</span>{' '}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{user.id}</code>
              </p>
              {isSuperuser !== null && (
                <p className="text-xs mb-1">
                  <span className="font-medium">Superuser Status:</span>{' '}
                  {isSuperuser ? (
                    <span className="text-green-700">✓ Yes</span>
                  ) : (
                    <span className="text-amber-700">✗ No</span>
                  )}
                </p>
              )}
              <button
                onClick={() => setShowSuperuserHelper(!showSuperuserHelper)}
                className="text-xs text-purple-600 hover:text-purple-800 underline"
              >
                {showSuperuserHelper ? 'Hide' : 'Show'} superuser setup
              </button>
            </div>
          )}
        </div>
      )}

      {/* Superuser Helper */}
      {showSuperuserHelper && user && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-800 font-medium mb-2">🔑 Make Yourself Superuser</p>
          <p className="text-xs text-purple-700 mb-2">
            Run this SQL in your Supabase SQL Editor:
          </p>
          <div className="bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words">
{`-- Step 1: Create is_superuser() function if it doesn't exist
CREATE OR REPLACE FUNCTION is_superuser()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM platform_superusers 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Insert yourself as superuser
INSERT INTO platform_superusers (user_id)
VALUES ('${user.id}')
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Verify the insert worked
SELECT * FROM platform_superusers WHERE user_id = '${user.id}';

-- Step 4: Grant schema permissions (if needed)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;`}
            </pre>
          </div>
          <button
            onClick={async () => {
              const sql = `-- Step 1: Create is_superuser() function if it doesn't exist
CREATE OR REPLACE FUNCTION is_superuser()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM platform_superusers 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Insert yourself as superuser
INSERT INTO platform_superusers (user_id)
VALUES ('${user.id}')
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Verify the insert worked
SELECT * FROM platform_superusers WHERE user_id = '${user.id}';

-- Step 4: Grant schema permissions (if needed)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;`;
              await navigator.clipboard.writeText(sql);
              alert('Complete SQL script copied to clipboard! Paste it in Supabase SQL Editor and run all steps.');
            }}
            className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
          >
            📋 Copy Complete SQL Script
          </button>
          <p className="text-xs text-purple-700 mb-2">
            <strong>This script will:</strong>
          </p>
          <ul className="text-xs text-purple-600 list-disc list-inside mb-2 space-y-1">
            <li>Create the is_superuser() function (if missing)</li>
            <li>Insert your user ID into platform_superusers</li>
            <li>Verify the insert worked</li>
            <li>Grant necessary schema permissions to authenticated users</li>
          </ul>
          <p className="text-xs text-purple-600 mt-2">
            <strong>Steps:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Copy the complete SQL script above</li>
              <li>Go to Supabase Dashboard → SQL Editor</li>
              <li>Paste and run ALL the SQL statements</li>
              <li><strong>Important:</strong> Log out and log back in to refresh your session</li>
              <li>Click "Refresh" below to reload data</li>
            </ol>
          </p>
          {isSuperuser === false && (
            <div className="text-xs text-amber-700 mt-2 font-medium space-y-1">
              <p>⚠️ Current status: Not a superuser.</p>
              <p>
                If you just ran the SQL, you need to <strong>log out and log back in</strong> for the change to take effect.
                The RLS policies check your session, which needs to be refreshed.
              </p>
              <button
                onClick={async () => {
                  if (confirm('This will log you out. After logging back in, your superuser status should be active. Continue?')) {
                    await signOut();
                  }
                }}
                className="mt-2 text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
              >
                🔄 Log Out Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800 font-medium mb-1">⚠️ Error</p>
          <p className="text-xs text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-2">
            Tip: Check browser console for details. You may need to:
            <ul className="list-disc list-inside mt-1">
              <li>Be logged in as a superuser</li>
              <li>Have org/location memberships</li>
              <li>Create test data in the database</li>
            </ul>
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">Loading data...</p>
        </div>
      )}

      {/* Organization Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization
        </label>
        <select
          value={selectedContext.orgId || ''}
          onChange={(e) => updateContext({ orgId: e.target.value || null })}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Organization...</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        {!loading && orgs.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            No organizations available
          </p>
        )}
      </div>

      {/* Location Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <select
          value={selectedContext.locationId || ''}
          onChange={(e) => updateContext({ locationId: e.target.value || null })}
          disabled={!selectedContext.orgId || loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Location...</option>
          {filteredLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
        {selectedContext.orgId && filteredLocations.length === 0 && !loading && (
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
          disabled={loading}
        >
          Clear
        </Button>
        <Button
          onClick={loadData}
          variant="outline"
          className="flex-1 text-xs"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
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

