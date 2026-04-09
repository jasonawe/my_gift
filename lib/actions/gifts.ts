"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const GiftSchema = z.object({
  event_id: z.string().uuid(),
  donor_name: z.string().min(1, "请输入姓名"),
  amount: z.coerce.number().positive("金额必须为正数"),
  gift_type: z.string().default("现金"),
  relationship: z.string().optional(),
  remark: z.string().optional(),
})

export type GiftEntryData = z.infer<typeof GiftSchema>

export async function createGift(data: GiftEntryData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "请先登录" }

  const validatedFields = GiftSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  // 1. 检查重名逻辑
  const { data: existingGift } = await supabase
    .from("gl_gifts")
    .select("id")
    .eq("event_id", data.event_id)
    .eq("donor_name", data.donor_name)
    .maybeSingle()

  if (existingGift) {
    return { error: `系统中已存在“${data.donor_name}”的礼金记录，请勿重复录入（如需修改请在列表中操作）。` }
  }

  // 2. 插入数据
  const { error } = await supabase
    .from("gl_gifts")
    .insert([{
      ...validatedFields.data,
      user_id: user.id
    }])

  if (error) {
    console.error("Database Error:", error)
    return { error: `礼金录入失败: ${error.message}` }
  }

  // 3. 强制刷新缓存
  revalidatePath("/dashboard")
  revalidatePath(`/entry/${data.event_id}`)
  return { success: true }
}

export async function updateGift(id: string, data: Partial<GiftEntryData>) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "请先登录" }

  const { error } = await supabase
    .from("gl_gifts")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { error: `更新失败: ${error.message}` }
  }

  revalidatePath("/dashboard")
  revalidatePath(`/entry/${data.event_id || ''}`)
  return { success: true }
}

export async function deleteGift(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "请先登录" }

  const { error } = await supabase
    .from("gl_gifts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Database Error:", error)
    return { error: `删除失败: ${error.message}` }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function getGiftsWithFilters(params: {
  eventId: string,
  search?: string,
  giftType?: string,
  relationship?: string,
  page?: number,
  pageSize?: number
}) {
  const { eventId, search, giftType, relationship, page = 1, pageSize = 12 } = params
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from("gl_gifts")
    .select("*", { count: 'exact' })
    .eq("event_id", eventId)

  if (search) {
    query = query.or(`donor_name.ilike.%${search}%,remark.ilike.%${search}%`)
  }
  if (giftType && giftType !== "all") {
    query = query.eq("gift_type", giftType)
  }
  if (relationship && relationship !== "all") {
    query = query.eq("relationship", relationship)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  // 获取总计金额
  const { data: allData } = await supabase
    .from("gl_gifts")
    .select("amount")
    .eq("event_id", eventId)

  const totalAmount = allData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

  if (error) {
    console.error("Fetch Error:", error)
    return { gifts: [], count: 0, totalAmount: 0 }
  }

  return {
    gifts: data || [],
    count: count || 0,
    totalAmount
  }
}
