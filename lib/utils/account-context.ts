import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getSelectedAccountId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Try to get selected account from cookie
  const cookieStore = await cookies()
  const selectedAccountCookie = cookieStore.get("selected_account_id") // Fixed: was "selectedAccountId"

  if (selectedAccountCookie?.value && selectedAccountCookie.value !== user.id) {
    // Verify user has access to this account
    const { data: share } = await supabase
      .from("account_shares")
      .select("owner_id")
      .eq("owner_id", selectedAccountCookie.value)
      .eq("shared_with_id", user.id)
      .eq("is_active", true)
      .single()

    if (share) {
      return selectedAccountCookie.value
    }
  }

  return user.id
}

export async function getAccountPermissions(targetUserId: string, resource: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { view: false, create: false, edit: false, delete: false }

  // If it's own account, full permissions
  if (user.id === targetUserId) {
    return { view: true, create: true, edit: true, delete: true }
  }

  // Check shared permissions
  const { data: permissions } = await supabase
    .from("account_shares")
    .select("share_permissions!inner(*)")
    .eq("owner_id", targetUserId)
    .eq("shared_with_id", user.id)
    .eq("is_active", true)
    .eq("share_permissions.resource_type", resource)
    .single()

  if (permissions?.share_permissions) {
    const perms = Array.isArray(permissions.share_permissions)
      ? permissions.share_permissions[0]
      : permissions.share_permissions

    return {
      view: perms.can_view || false,
      create: perms.can_create || false,
      edit: perms.can_edit || false,
      delete: perms.can_delete || false,
    }
  }

  return { view: false, create: false, edit: false, delete: false }
}
