import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import GalleryImage from "@/models/GalleryImage"

export async function GET() {
  try {
    await dbConnect()
    const images = await GalleryImage.find({}).sort({ createdAt: -1 })
    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 })
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
    const image = await GalleryImage.create(data)
    return NextResponse.json(image)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 })
  }
}