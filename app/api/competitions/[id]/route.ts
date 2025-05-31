import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Competition from "@/models/Competition"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const competition = await Competition.findById(params.id)
    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }
    return NextResponse.json(competition)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch competition" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const data = await request.json()
    const competition = await Competition.findByIdAndUpdate(params.id, data, { new: true })
    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }
    return NextResponse.json(competition)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update competition" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const competition = await Competition.findByIdAndDelete(params.id)
    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete competition" }, { status: 500 })
  }
}