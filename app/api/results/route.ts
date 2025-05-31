import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Result from "@/models/Result"

export async function GET() {
  try {
    await dbConnect()
    const results = await Result.find({}).sort({ createdAt: -1 })
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
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
    const result = await Result.create(data)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create result" }, { status: 500 })
  }
}