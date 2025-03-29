"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { deleteFile } from "@/lib/clodynix"

export async function deleteResume(resumeId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to delete a resume" }
    }

    // Check if resume exists and belongs to user
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    })

    if (!resume) {
      return { error: "Resume not found" }
    }

    if (resume.userId !== session.user.id) {
      return { error: "You do not have permission to delete this resume" }
    }

    // Delete file from Clodynix if exists
    if (resume.fileId) {
      try {
        await deleteFile(resume.fileId)
      } catch (error) {
        console.error("Error deleting file from Clodynix:", error)
        // Continue with resume deletion even if file deletion fails
      }
    }

    // Delete resume from database
    await prisma.resume.delete({
      where: { id: resumeId },
    })

    return { success: "Resume deleted successfully" }
  } catch (error) {
    console.error("Error deleting resume:", error)
    return { error: "Failed to delete resume. Please try again." }
  }
}

