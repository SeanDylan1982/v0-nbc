import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import GalleryImage from "@/models/GalleryImage"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const image = await GalleryImage.findById(params.id)
    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 })
    }
    return NextResponse.json(image)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery image" }, { status: 500 })
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
    const image = await GalleryImage.findByIdAndUpdate(params.id, data, { new: true })
    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 })
    }
    return NextResponse.json(image)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update gallery image" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const image = await GalleryImage.findByIdAndDelete(params.id)
    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete gallery image" }, { status: 500 })
  }
}