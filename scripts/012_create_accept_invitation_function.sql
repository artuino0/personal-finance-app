-- Function to accept a share invitation
-- This function runs with elevated privileges to bypass RLS policies
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

  -- Use accepted_at instead of updated_at
  UPDATE share_invitations
  SET status = 'accepted',
      accepted_at = now()
  WHERE id = v_invitation.id;

  -- Include shared_with_email in insert
  INSERT INTO account_shares (owner_id, shared_with_id, shared_with_email, is_active)
  VALUES (v_invitation.owner_id, p_user_id, v_user_email, true)
  RETURNING id INTO v_share_id;

  -- Removed specific_accounts column which doesn't exist
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION accept_share_invitation(uuid, uuid) TO authenticated;
