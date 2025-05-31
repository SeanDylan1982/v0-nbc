import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Document from "@/models/Document"

export async function GET() {
  try {
    await dbConnect()
    const documents = await Document.find({}).sort({ createdAt: -1 })
    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
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
    const document = await Document.create(data)
    return NextResponse.json(document)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}