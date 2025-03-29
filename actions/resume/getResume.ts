"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getResume(resumeId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to view a resume" }
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    })

    if (!resume) {
      return { error: "Resume not found" }
    }

    if (resume.userId !== session.user.id) {
      return { error: "You do not have permission to view this resume" }
    }

    return { resume }
  } catch (error) {
    console.error("Error fetching resume:", error)
    return { error: "Failed to fetch resume. Please try again." }
  }
}

