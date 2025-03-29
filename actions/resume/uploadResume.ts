"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { uploadDirect, generateLink } from "@/lib/clodynix"

export async function uploadResume(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to upload a resume" }
    }

    const resumeId = formData.get("resumeId") as string

    if (!resumeId) {
      return { error: "Resume ID is required" }
    }

    // Check if resume exists and belongs to user
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    })

    if (!resume) {
      return { error: "Resume not found" }
    }

    if (resume.userId !== session.user.id) {
      return { error: "You do not have permission to upload to this resume" }
    }

    // Upload file to Clodynix
    const fileData = await uploadDirect(formData)

    if (!fileData || !fileData.id) {
      return { error: "Failed to upload file" }
    }

    // Generate a link for the file
    const fileUrl = await generateLink(fileData.id)

    // Update resume with file info
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        fileUrl,
        fileId: fileData.id,
      },
    })

    return {
      success: "Resume file uploaded successfully",
      fileUrl,
    }
  } catch (error) {
    console.error("Error uploading resume:", error)
    return { error: "Failed to upload resume file. Please try again." }
  }
}

