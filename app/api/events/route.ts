import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Event from "@/models/Event"

export async function GET() {
  try {
    await dbConnect()
    const events = await Event.find({}).sort({ createdAt: -1 })
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const data = await request.json()
    const event = await Event.create(data)
    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}