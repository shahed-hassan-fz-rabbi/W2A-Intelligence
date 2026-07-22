import { cookies } from "next/headers";

const COOKIE = "w2a_session";

export async function setSession(user) {
  const store = await cookies();
  store.set(
    COOKIE,
    JSON.stringify({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      zone_id: user.zone_id,
      company_id: user.company_id ?? null,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30,
    }
  );
}

export async function getSession() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function requireRole(...allowed) {
  const session = await getSession();
  if (!session) return { ok: false, status: 401, message: "Not logged in" };
  if (allowed.length && !allowed.includes(session.role)) {
    return { ok: false, status: 403, message: "Access denied for your role" };
  }
  return { ok: true, session };
}