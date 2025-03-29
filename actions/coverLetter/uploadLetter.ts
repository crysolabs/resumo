"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { uploadDirect, generateLink } from "@/lib/clodynix"

export async function uploadCoverLetter(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to upload a cover letter" }
    }

    const coverLetterId = formData.get("coverLetterId") as string

    if (!coverLetterId) {
      return { error: "Cover letter ID is required" }
    }

    // Check if cover letter exists and belongs to user
    const coverLetter = await prisma.coverLetter.findUnique({
      where: { id: coverLetterId },
    })

    if (!coverLetter) {
      return { error: "Cover letter not found" }
    }

    if (coverLetter.userId !== session.user.id) {
      return { error: "You do not have permission to upload to this cover letter" }
    }

    // Upload file to Clodynix
    const fileData = await uploadDirect(formData)

    if (!fileData || !fileData.id) {
      return { error: "Failed to upload file" }
    }

    // Generate a link for the file
    const fileUrl = await generateLink(fileData.id)

    // Update cover letter with file info
    await prisma.coverLetter.update({
      where: { id: coverLetterId },
      data: {
        fileUrl,
        fileId: fileData.id,
      },
    })

    return {
      success: "Cover letter file uploaded successfully",
      fileUrl,
    }
  } catch (error) {
    console.error("Error uploading cover letter:", error)
    return { error: "Failed to upload cover letter file. Please try again." }
  }
}

