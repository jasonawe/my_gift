import { getEventById } from "@/lib/actions/events"
import { EditEventForm } from "@/components/events/edit-event-form"
import { notFound, redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const event = await getEventById(id)

  if (!event) {
    notFound()
  }

  return <EditEventForm event={event} />
}
