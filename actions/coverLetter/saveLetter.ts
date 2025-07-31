"use server"

import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const coverLetterSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.any(),
  company: z.string().optional(),
  position: z.string().optional(),
})

export async function saveCoverLetter(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to save a cover letter" }
    }

    // Parse form data
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const content = JSON.parse(formData.get("content") as string)
    const company = formData.get("company") as string
    const position = formData.get("position") as string

    const validatedData = coverLetterSchema.parse({
      id,
      title,
      content,
      company,
      position,
    })

    // Check if cover letter exists and belongs to user
    if (id) {
      const existingLetter = await prisma.coverLetter.findUnique({
        where: { id },
      })

      if (!existingLetter) {
        return { error: "Cover letter not found" }
      }

      if (existingLetter.userId !== session.user.id) {
        return { error: "You do not have permission to edit this cover letter" }
      }

      // Update existing cover letter
      const coverLetter = await prisma.coverLetter.update({
        where: { id },
        data: {
          title,
          content,
          company,
          position,
          updatedAt: new Date(),
        },
      })

      return {
        success: "Cover letter updated successfully",
        coverLetterId: coverLetter.id,
      }
    }

    // Create new cover letter
    const coverLetter = await prisma.coverLetter.create({
      data: {
        title,
        content,
        company,
        position,
        userId: session.user.id,
      },
    })

    return {
      success: "Cover letter saved successfully",
      coverLetterId: coverLetter.id,
    }
  } catch (error) {
    console.error("Error saving cover letter:", error)

    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }

    return { error: "Failed to save cover letter. Please try again." }
  }
}

