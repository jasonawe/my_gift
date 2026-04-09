import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/actions/events"

export default async function EntryIndexPage() {
  const activeEvent = await getActiveEvent()

  if (!activeEvent) {
    redirect("/events/new")
  }

  redirect(`/entry/${activeEvent.id}`)
}
