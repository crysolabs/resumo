"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { deleteFile } from "@/lib/clodynix"

export async function deleteUser(userId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to access this resource" }
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!adminUser || adminUser.role !== "ADMIN") {
      return { error: "You do not have permission to access this resource" }
    }

    // Get user's resumes and cover letters to delete files
    const resumes = await prisma.resume.findMany({
      where: { userId },
      select: { fileId: true },
    })

    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId },
      select: { fileId: true },
    })

    // Delete files from Clodynix
    for (const resume of resumes) {
      if (resume.fileId) {
        try {
          await deleteFile(resume.fileId)
        } catch (error) {
          console.error("Error deleting resume file:", error)
          // Continue with user deletion even if file deletion fails
        }
      }
    }

    for (const letter of coverLetters) {
      if (letter.fileId) {
        try {
          await deleteFile(letter.fileId)
        } catch (error) {
          console.error("Error deleting cover letter file:", error)
          // Continue with user deletion even if file deletion fails
        }
      }
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id: userId },
    })

    return { success: "User deleted successfully" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "Failed to delete user. Please try again." }
  }
}

