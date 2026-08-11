-- Public quote RPCs used by /quote/[token] and POST /api/quotes/[token]/approve.
-- Run in the Supabase SQL editor (SECURITY DEFINER so anon can resolve a single token).

CREATE UNIQUE INDEX IF NOT EXISTS quotes_order_id_unique ON quotes (order_id);
CREATE UNIQUE INDEX IF NOT EXISTS quotes_share_token_unique ON quotes (share_token);

CREATE OR REPLACE FUNCTION get_quote_by_token(p_token text)
RETURNS TABLE (
  quote_status text,
  approved_at timestamptz,
  order_description text,
  order_price numeric,
  order_due_date date,
  order_status text,
  customer_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    q.status::text AS quote_status,
    q.approved_at,
    o.description AS order_description,
    o.price AS order_price,
    o.due_date AS order_due_date,
    o.status::text AS order_status,
    c.name AS customer_name
  FROM quotes q
  JOIN orders o ON o.id = q.order_id
  JOIN customers c ON c.id = o.customer_id
  WHERE q.share_token = p_token
  LIMIT 1;
$$;


CREATE OR REPLACE FUNCTION approve_quote_by_token(p_token text)
RETURNS TABLE (
  quote_status text,
  approved_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH updated_quote AS (
    UPDATE quotes
    SET
      status = 'approved',
      approved_at = COALESCE(approved_at, now())
    WHERE share_token = p_token
    RETURNING status, approved_at, order_id
  ),
  _updated_order AS (
    UPDATE orders o
    SET status = 'approved'
    FROM updated_quote uq
    WHERE o.id = uq.order_id
      AND o.status IN ('quote_sent', 'sent')
    RETURNING o.id
  )
  SELECT uq.status::text, uq.approved_at
  FROM updated_quote uq;
END;
$$;

REVOKE ALL ON FUNCTION get_quote_by_token(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_quote_by_id(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION approve_quote_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_quote_by_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_quote_by_id(uuid) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION approve_quote_by_token(text) TO anon, authenticated;


//////////////////////////////////////////////////////
CREATE OR REPLACE FUNCTION get_quote_by_id(p_quote_id uuid)
RETURNS TABLE (
    quote_status text,
    approved_at timestamptz,
    order_description text,
    quote_id uuid,
    order_price numeric,
    order_due_date date,
    order_status text,
    customer_name text
) 
LANGUAGE plpgsql
-- 1. Bypasses RLS by running as the function owner/creator
SECURITY DEFINER
-- 2. Prevents search_path hijacking security risks
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
    q.status::text AS quote_status,
    q.approved_at,
    o.description AS order_description,
    q.id AS quote_id,
    o.price AS order_price,
    o.due_date AS order_due_date,
    o.status::text AS order_status,
    c.name AS customer_name
  FROM quotes q
  JOIN orders o ON o.id = q.order_id
  JOIN customers c ON c.id = o.customer_id
  WHERE q.id = p_quote_id
  LIMIT 1;
END;
$$;


GRANT EXECUTE ON FUNCTION get_quote_by_id(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_quote_by_id(text) TO service_role;

DROP FUNCTION IF EXISTS public.get_quote_by_id(uuid);




/////////////////////////////////////////////////////////////
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- backfill existing rows (you must decide what value makes sense)
-- example: set to now() (adjust as needed)
UPDATE quotes
SET expires_at = now()
WHERE expires_at IS NULL;

ALTER TABLE quotes
  ALTER COLUMN expires_at SET NOT NULL;



  //////////////////////////////////////////////////////////////
  CREATE OR REPLACE FUNCTION get_allinfo_by_id(p_order_id uuid)
RETURNS TABLE (
    quote_status text,
    share_token text,
    approved_at timestamptz,
    order_description text,
    order_id uuid,
    quote_id uuid,
    order_price numeric,
    order_due_date date,
    order_status text,
    customer_name text,
    customer_email text,
    expires_at timestamptz
) 
LANGUAGE plpgsql
-- 1. Bypasses RLS by running as the function owner/creator
SECURITY DEFINER
-- 2. Prevents search_path hijacking security risks
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
    q.status::text AS quote_status,
    q.share_token,
    q.approved_at,
    o.description AS order_description,
    o.id AS order_id,
    q.id AS quote_id,
    o.price AS order_price,
    o.due_date AS order_due_date,
    o.status::text AS order_status,
    c.name AS customer_name,
    c.email AS customer_email,
    q.expires_at
  FROM quotes q
  JOIN orders o ON o.id = q.order_id
  JOIN customers c ON c.id = o.customer_id
  WHERE o.id = p_order_id
  LIMIT 1;
END;
$$;


GRANT EXECUTE ON FUNCTION get_allinfo_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_allinfo_by_id(uuid) TO service_role;

DROP FUNCTION IF EXISTS public.get_allinfo_by_id(uuid);
