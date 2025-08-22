// lib/api.ts
import { supabase } from "./supabase"

// ---------- AUTH ----------
export const login = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const register = async (fullName: string, email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      redirectTo: `${window.location.origin}/auth/verify-email`,
    },
  })
}

export const forgotPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  })
}

// ---------- CORRESPONDENCE ----------
export const getCorrespondence = async () => {
  return await supabase.from("correspondence").select("*")
}

export const getCorrespondenceById = async (id: string) => {
  return await supabase.from("correspondence").select("*").eq("id", id).single()
}

export const createCorrespondence = async (formData: any) => {
  return await supabase.from("correspondence").insert([formData])
}

export const updateCorrespondence = async (id: string, formData: any) => {
  return await supabase.from("correspondence").update(formData).eq("id", id)
}

export const deleteCorrespondence = async (id: string) => {
  return await supabase.from("correspondence").delete().eq("id", id)
}

// ---------- USERS (Admin) ----------
export const getUsers = async () => {
  return await supabase.from("users").select("*")
}

export const createUser = async (formData: any) => {
  return await supabase.from("users").insert([formData])
}

export const updateUser = async (id: string, formData: any) => {
  return await supabase.from("users").update(formData).eq("id", id)
}

export const deleteUser = async (id: string) => {
  return await supabase.from("users").delete().eq("id", id)
}
