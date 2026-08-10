// ================================================
// Helper Auth — dipakai di index.html, login.html, admin-users.html
// Wajib load setelah supabase-client.js
// ================================================

async function getSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

// Redirect ke login.html kalau belum login. Kembalikan session kalau sudah.
async function requireAuth(redirectTo = "login.html") {
  const session = await getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

async function getMyProfile() {
  const { data: userData } = await supabaseClient.auth.getUser();
  const user = userData?.user;
  if (!user) return null;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) {
    console.error("Gagal ambil profil:", error);
    return null;
  }
  return data;
}

async function touchLastLogin() {
  const { data: userData } = await supabaseClient.auth.getUser();
  const user = userData?.user;
  if (!user) return;
  await supabaseClient
    .from("profiles")
    .update({ last_login: new Date().toISOString() })
    .eq("id", user.id);
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

function isAdminOrManager(profile) {
  return profile && (profile.role === "admin" || profile.role === "manager");
}
