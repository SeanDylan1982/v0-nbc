import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import Document from "@/models/Document"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const document = await Document.findById(params.id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    return NextResponse.json(document)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
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
    const document = await Document.findByIdAndUpdate(params.id, data, { new: true })
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    return NextResponse.json(document)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const document = await Document.findByIdAndDelete(params.id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}