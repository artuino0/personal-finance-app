-- Fix the accept_share_invitation function to handle duplicates properly
CREATE OR REPLACE FUNCTION accept_share_invitation(
  p_invitation_token uuid,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation record;
  v_share_id uuid;
  v_permission record;
  v_user_email text;
  v_existing_share_id uuid;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  -- Get the invitation
  SELECT * INTO v_invitation
  FROM share_invitations
  WHERE invitation_token = p_invitation_token
    AND status = 'pending';

  -- Check if invitation exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invitación no encontrada o ya procesada'
    );
  END IF;

  -- Check if share already exists
  SELECT id INTO v_existing_share_id
  FROM account_shares
  WHERE owner_id = v_invitation.owner_id
    AND shared_with_id = p_user_id;

  IF v_existing_share_id IS NOT NULL THEN
    -- Share already exists, just update the invitation status
    UPDATE share_invitations
    SET status = 'accepted',
        accepted_at = now()
    WHERE id = v_invitation.id;

    -- Delete old permissions
    DELETE FROM share_permissions WHERE share_id = v_existing_share_id;

    v_share_id := v_existing_share_id;
  ELSE
    -- Create new share
    UPDATE share_invitations
    SET status = 'accepted',
        accepted_at = now()
    WHERE id = v_invitation.id;

    INSERT INTO account_shares (owner_id, shared_with_id, shared_with_email, is_active)
    VALUES (v_invitation.owner_id, p_user_id, v_user_email, true)
    RETURNING id INTO v_share_id;
  END IF;

  -- Create permissions from invitation JSON
  FOR v_permission IN 
    SELECT * FROM jsonb_each(v_invitation.permissions)
  LOOP
    INSERT INTO share_permissions (
      share_id,
      resource_type,
      can_view,
      can_create,
      can_edit,
      can_delete
    )
    VALUES (
      v_share_id,
      v_permission.key,
      COALESCE((v_permission.value->>'view')::boolean, false),
      COALESCE((v_permission.value->>'create')::boolean, false),
      COALESCE((v_permission.value->>'edit')::boolean, false),
      COALESCE((v_permission.value->>'delete')::boolean, false)
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'share_id', v_share_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Re-create the profile trigger to ensure it's properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Run the helper script to create missing profiles for existing users
-- This will catch any users created before the trigger was properly set up
INSERT INTO public.profiles (id, full_name)
SELECT 
  id,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ) as full_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE
SET full_name = COALESCE(
  EXCLUDED.full_name,
  profiles.full_name
);
