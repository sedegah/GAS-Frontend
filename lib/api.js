// lib/api.ts
import { supabase } from "./supabase"

// ---------- TYPES ----------
export interface Correspondence {
  id: string
  subject: string
  reference_number: string
  sender: string
  recipient: string
  date_sent: string
  date_received: string
  priority: 'low' | 'medium' | 'high'
  status: 'draft' | 'sent' | 'received' | 'archived'
  category: string
  description?: string
  file_url?: string
  created_at: string
  updated_at: string
  created_by: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user' | 'auditor'
  department: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T = any> {
  data: T | null
  error: Error | null
  status: number
}

// ---------- UTILS ----------
const handleApiError = (error: any): ApiResponse => {
  console.error('API Error:', error)
  return {
    data: null,
    error: error instanceof Error ? error : new Error('An unexpected error occurred'),
    status: 500
  }
}

const createApiResponse = <T>(data: T | null, error: any = null, status: number = 200): ApiResponse<T> => ({
  data,
  error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
  status
})

// ---------- AUTH ----------
export const login = async (email: string, password: string): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return createApiResponse(data, error)
  } catch (error) {
    return handleApiError(error)
  }
}

export const register = async (fullName: string, email: string, password: string): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/verify-email`,
      },
    })
    return createApiResponse(data, error)
  } catch (error) {
    return handleApiError(error)
  }
}

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/update-password`,
    })
    return createApiResponse(data, error)
  } catch (error) {
    return handleApiError(error)
  }
}

export const signOut = async (): Promise<ApiResponse> => {
  try {
    const { error } = await supabase.auth.signOut()
    return createApiResponse(null, error)
  } catch (error) {
    return handleApiError(error)
  }
}

export const getCurrentUser = async (): Promise<ApiResponse> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return createApiResponse(user, error)
  } catch (error) {
    return handleApiError(error)
  }
}

// ---------- CORRESPONDENCE ----------
export const getCorrespondence = async (): Promise<ApiResponse<Correspondence[]>> => {
  try {
    const { data, error, status } = await supabase
      .from("correspondence")
      .select("*")
      .order('created_at', { ascending: false })
    
    return createApiResponse(data, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

export const getCorrespondenceById = async (id: string): Promise<ApiResponse<Correspondence>> => {
  try {
    const { data, error, status } = await supabase
      .from("correspondence")
      .select("*")
      .eq("id", id)
      .single()
    
    return createApiResponse(data, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

export const createCorrespondence = async (formData: Partial<Correspondence>): Promise<ApiResponse<Correspondence>> => {
  try {
    const { data, error, status } = await supabase
      .from("correspondence")
      .insert([{
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    return createApiResponse(data, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

export const updateCorrespondence = async (id: string, formData: Partial<Correspondence>): Promise<ApiResponse<Correspondence>> => {
  try {
    const { data, error, status } = await supabase
      .from("correspondence")
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()
    
    return createApiResponse(data, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

export const deleteCorrespondence = async (id: string): Promise<ApiResponse> => {
  try {
    const { error, status } = await supabase
      .from("correspondence")
      .delete()
      .eq("id", id)
    
    return createApiResponse(null, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

// Search correspondence with filters
export const searchCorrespondence = async (filters: {
  query?: string
  status?: string
  priority?: string
  category?: string
  dateFrom?: string
  dateTo?: string
}): Promise<ApiResponse<Correspondence[]>> => {
  try {
    let query = supabase.from("correspondence").select("*")

    if (filters.query) {
      query = query.or(`subject.ilike.%${filters.query}%,reference_number.ilike.%${filters.query}%,sender.ilike.%${filters.query}%,recipient.ilike.%${filters.query}%`)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.dateFrom) {
      query = query.gte('date_sent', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('date_sent', filters.dateTo)
    }

    const { data, error, status } = await query.order('created_at', { ascending: false })
    
    return createApiResponse(data, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

// Get correspondence statistics
export const getCorrespondenceStats = async (): Promise<ApiResponse> => {
  try {
    const { data, error, status } = await supabase
      .from("correspondence")
      .select("status, priority")
    
    if (error) {
      return createApiResponse(null, error, status)
    }

    const stats = {
      total: data?.length || 0,
      byStatus: data?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byPriority: data?.reduce((acc, item) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return createApiResponse(stats, null, status)
  } catch (error) {
    return handleApiError(error)
  }
}

// ---------- USERS (Admin) ----------
export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  try {
    const { data, error, status } = await supabase
      .from("users")
      .select("*")
      .order('created_at', { ascending: false })
    
    return createApiResponse(data, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

export const createUser = async (formData: Partial<User>): Promise<ApiResponse<User>> => {
  try {
    const { data, error, status } = await supabase
      .from("users")
      .insert([{
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    return createApiResponse(data, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

export const updateUser = async (id: string, formData: Partial<User>): Promise<ApiResponse<User>> => {
  try {
    const { data, error, status } = await supabase
      .from("users")
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()
    
    return createApiResponse(data, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

export const deleteUser = async (id: string): Promise<ApiResponse> => {
  try {
    const { error, status } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
    
    return createApiResponse(null, error, status)
  } catch (error) {
    return handleApiError(error)
  }
}

// ---------- FILE UPLOAD ----------
export const uploadFile = async (file: File): Promise<ApiResponse<{ signedUrl: string }>> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `correspondence/${fileName}`

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (error) {
      return createApiResponse(null, error)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return createApiResponse({ signedUrl: publicUrl }, null)
  } catch (error) {
    return handleApiError(error)
  }
}
