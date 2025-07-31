"use server"

import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const resumeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.any(),
})

export async function saveResume(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to save a resume" }
    }

    // Parse form data
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const content = JSON.parse(formData.get("content") as string)

    const validatedData = resumeSchema.parse({
      id,
      title,
      content,
    })

    // Check if resume exists and belongs to user
    if (id) {
      const existingResume = await prisma.resume.findUnique({
        where: { id },
      })

      if (!existingResume) {
        return { error: "Resume not found" }
      }

      if (existingResume.userId !== session.user.id) {
        return { error: "You do not have permission to edit this resume" }
      }

      // Update existing resume
      const resume = await prisma.resume.update({
        where: { id },
        data: {
          title,
          content,
          updatedAt: new Date(),
        },
      })

      return {
        success: "Resume updated successfully",
        resumeId: resume.id,
      }
    }

    // Create new resume
    const resume = await prisma.resume.create({
      data: {
        title,
        content,
        userId: session.user.id,
      },
    })

    return {
      success: "Resume saved successfully",
      resumeId: resume.id,
    }
  } catch (error) {
    console.error("Error saving resume:", error)

    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }

    return { error: "Failed to save resume. Please try again." }
  }
}

