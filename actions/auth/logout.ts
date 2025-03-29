"use server"
import { cookies } from "next/headers"

export async function logout() {
  // Clear any auth cookies
  const cookieStore = await cookies();
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("next-auth.csrf-token");
  cookieStore.delete("next-auth.callback-url");

  // Redirect to home page
  return { success: true }
}

