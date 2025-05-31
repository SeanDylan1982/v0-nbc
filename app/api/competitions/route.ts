import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Competition from "@/models/Competition"

export async function GET() {
  try {
    await dbConnect()
    const competitions = await Competition.find({}).sort({ createdAt: -1 })
    return NextResponse.json(competitions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch competitions" }, { status: 500 })
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
    const competition = await Competition.create(data)
    return NextResponse.json(competition)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create competition" }, { status: 500 })
  }
}