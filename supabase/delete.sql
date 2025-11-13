-- Drop all objects in the 'public' schema
DROP SCHEMA public CASCADE;

-- Recreate the schema
CREATE SCHEMA public;

-- Grant privileges back to PostgREST (important!)
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO service_role;
