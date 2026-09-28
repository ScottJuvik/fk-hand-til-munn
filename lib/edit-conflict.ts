import { NextResponse } from "next/server"

// Stops two admins overwriting each other. An edit page sends the
// `updated_at` it loaded as `version`, and the API only saves if the row
// still has it (database triggers keep `updated_at` current, see
// supabase/updated-at-triggers.sql). Otherwise it answers 409 with this
// message, which the page shows in its error toast.

export const EDIT_CONFLICT_MESSAGE =
  "Someone else changed this while you were editing. Reload the page to see their changes, then make yours again."

export function editConflictResponse() {
  return NextResponse.json({ error: EDIT_CONFLICT_MESSAGE, conflict: true }, { status: 409 })
}
