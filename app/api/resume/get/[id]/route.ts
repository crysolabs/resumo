import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateLink } from "@/lib/clodynix"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const resumeId = params.id

    // Check if resume exists and belongs to user
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    })

    if (!resume) {
      return new NextResponse("Resume not found", { status: 404 })
    }

    if (resume.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    if (!resume.fileId) {
      return new NextResponse("No file associated with this resume", { status: 404 })
    }

    // Generate a fresh link for the file
    const fileUrl = await generateLink(resume.fileId)

    // Update download count
    await prisma.resume.update({
      where: { id: resumeId },
      data: { downloads: { increment: 1 } },
    })

    // Redirect to file URL
    return NextResponse.redirect(fileUrl)
  } catch (error) {
    console.error("Error fetching resume file:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

