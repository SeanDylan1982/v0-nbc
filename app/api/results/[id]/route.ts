import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Result from "@/models/Result"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const result = await Result.findById(params.id)
    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 })
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
    const result = await Result.findByIdAndUpdate(params.id, data, { new: true })
    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update result" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const result = await Result.findByIdAndDelete(params.id)
    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete result" }, { status: 500 })
  }
}