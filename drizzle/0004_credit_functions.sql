-- Atomic charge/refund functions backing src/lib/credits.ts. Both run
-- SECURITY DEFINER and are only ever called via the service_role client, so
-- EXECUTE is granted to service_role only -- `authenticated` never gets
-- direct access to either, which is what makes "forge a billing update"
-- impossible even in principle, not just in the app's own code paths.

CREATE OR REPLACE FUNCTION public.charge_credits(p_user_id uuid, p_render_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  SELECT credits_balance INTO current_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'profile not found for user %', p_user_id;
  END IF;

  IF current_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  UPDATE public.profiles SET credits_balance = credits_balance - p_amount WHERE id = p_user_id
    RETURNING credits_balance INTO new_balance;

  INSERT INTO public.credits_ledger (user_id, delta, reason, render_id, balance_after)
  VALUES (p_user_id, -p_amount, 'render_charge', p_render_id, new_balance);

  RETURN new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_credits(p_user_id uuid, p_render_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  UPDATE public.profiles SET credits_balance = credits_balance + p_amount WHERE id = p_user_id
    RETURNING credits_balance INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'profile not found for user %', p_user_id;
  END IF;

  INSERT INTO public.credits_ledger (user_id, delta, reason, render_id, balance_after)
  VALUES (p_user_id, p_amount, 'render_refund', p_render_id, new_balance);

  RETURN new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION public.charge_credits(uuid, uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, uuid, integer) TO service_role;
