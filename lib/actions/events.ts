"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const EventSchema = z.object({
  title: z.string().min(1, "请输入事件名称"),
  event_type: z.string().min(1, "请选择事件类型"),
  event_start_date: z.string().min(1, "请选择开始日期"),
  event_end_date: z.string().min(1, "请选择结束日期"),
  location: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  voice_enable: z.boolean().default(false),
  voice_id: z.string().optional(),
  theme_color: z.string().optional(),
  is_active: z.boolean().optional(),
})

export async function createEvent(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "请先登录" }

  const validatedFields = EventSchema.safeParse({
    title: formData.get("title"),
    event_type: formData.get("event_type"),
    event_start_date: formData.get("event_start_date"),
    event_end_date: formData.get("event_end_date"),
    location: formData.get("location"),
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
    voice_enable: formData.get("voice_enable") === "on",
    voice_id: formData.get("voice_id"),
    theme_color: formData.get("theme_color") || "auto",
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { data, error } = await supabase
    .from("gl_events")
    .insert([
      {
        ...validatedFields.data,
        is_active: true,
        user_id: user.id
      }
    ])
    .select()

  if (error) {
    console.error("Database Error:", error)
    return { error: `数据库提交失败: ${error.message}` }
  }

  revalidatePath("/dashboard")
  revalidatePath("/events")
  return { success: true, eventId: data[0].id }
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "请先登录" }

  const validatedFields = EventSchema.safeParse({
    title: formData.get("title"),
    event_type: formData.get("event_type"),
    event_start_date: formData.get("event_start_date"),
    event_end_date: formData.get("event_end_date"),
    location: formData.get("location"),
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
    voice_enable: formData.get("voice_enable") === "on",
    voice_id: formData.get("voice_id"),
    theme_color: formData.get("theme_color") || "auto",
    is_active: formData.get("is_active") === "on",
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .from("gl_events")
    .update({
      ...validatedFields.data,
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { error: `数据库更新失败: ${error.message}` }
  }

  revalidatePath("/dashboard")
  revalidatePath("/events")
  revalidatePath(`/events/${id}/edit`)
  return { success: true }
}

export async function getActiveEvent() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("gl_events")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  if (error) {
    console.error("Fetch Error:", error)
    return null
  }

  return data
}

export async function getEventById(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("gl_events")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Fetch Error:", error)
    return null
  }

  return data
}
