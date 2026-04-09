import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/actions/events"

export default async function ReportsIndexPage() {
  const activeEvent = await getActiveEvent()

  if (!activeEvent) {
    redirect("/dashboard")
  }

  redirect(`/reports/${activeEvent.id}`)
}
