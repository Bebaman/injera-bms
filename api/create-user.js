// Vercel Serverless Function: POST /api/create-user
// Creates a Supabase Auth account + matching profile row in `users` in one step.
// Only callable by an already-authenticated owner/manager.
//
// REQUIRED Vercel environment variables (set in Vercel dashboard, never in code):
//   SUPABASE_URL                -> https://mfxkkaavgzyttasgqnmw.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   -> from Supabase: Project Settings > API > service_role key (SECRET)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars' });
  }

  // 1. Verify the caller is logged in
  const authHeader = req.headers.authorization || '';
  const callerToken = authHeader.replace('Bearer ', '').trim();
  if (!callerToken) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const callerRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${callerToken}`
      }
    });
    if (!callerRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    const callerUser = await callerRes.json();

    // 2. Verify the caller is an active owner/manager
    const profRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${callerUser.id}&select=role,is_active`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    const profRows = await profRes.json();
    const callerProfile = profRows && profRows[0];
    if (!callerProfile || !callerProfile.is_active || !['owner', 'manager'].includes(callerProfile.role)) {
      return res.status(403).json({ error: 'Only an owner or manager can create new users.' });
    }

    // 3. Validate input
    const { email, password, role, name } = req.body || {};
    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'email, password, role, and name are all required.' });
    }
    if (!['owner', 'manager', 'worker'].includes(role)) {
      return res.status(400).json({ error: 'role must be owner, manager, or worker.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    // 4. Create the Supabase Auth account (auto-confirmed, no email step needed)
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: String(email).trim(), password, email_confirm: true })
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      const msg = createData.msg || createData.error_description || createData.message || 'Failed to create account.';
      return res.status(createRes.status).json({ error: msg });
    }
    const newUserId = createData.id;

    // 5. Create the matching profile row
    const profileInsertRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        id: newUserId,
        email: String(email).trim(),
        role,
        name,
        is_active: true,
        created_by: callerUser.id
      })
    });
    const profileData = await profileInsertRes.json();

    if (!profileInsertRes.ok) {
      // Roll back the auth account so we don't leave an orphaned login with no profile
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${newUserId}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }
      });
      return res.status(500).json({ error: 'Failed to create profile record; account creation was rolled back.', detail: profileData });
    }

    return res.status(200).json({ success: true, user: profileData[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error.', detail: String(err) });
  }
}
