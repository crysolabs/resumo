"use server"

import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateCoverLetterContent } from "@/lib/ai"
import { type AIProviderId, getDefaultProvider } from "@/lib/ai-providers"
import { isUserPro } from "@/lib/utils"

const coverLetterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  recipient: z.string().optional(),
  strengths: z.string().optional(),
  experience: z.string().optional(),
  motivation: z.string().optional(),
  aiProvider: z.string().optional(),
})

export async function generateCoverLetter(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to generate a cover letter" }
    }

    // Get user subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    })

    if (!user) {
      return { error: "User not found" }
    }

    // Check if user is on free plan and has reached the limit
    if (!isUserPro(user.subscription)) {
      const letterCount = await prisma.coverLetter.count({
        where: {
          userId: user.id,
          aiGenerated: true,
        },
      })

      if (letterCount >= 1) {
        return { error: "Free plan limited to 1 AI-generated cover letter. Please upgrade to Pro." }
      }
    }

    // Parse form data
    const aiProvider = (formData.get("aiProvider") as string) || getDefaultProvider()

    const validatedData = coverLetterSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      position: formData.get("position"),
      recipient: formData.get("recipient"),
      strengths: formData.get("strengths"),
      experience: formData.get("experience"),
      motivation: formData.get("motivation"),
      aiProvider,
    })

    // Generate cover letter content using the selected AI provider
    const content = await generateCoverLetterContent(
      validatedData.name,
      validatedData.email,
      validatedData.phone || "",
      validatedData.company,
      validatedData.position,
      validatedData.recipient || "",
      validatedData.strengths || "",
      validatedData.experience || "",
      validatedData.motivation || "",
      aiProvider as AIProviderId,
    )

    // Create cover letter in database
    const coverLetter = await prisma.coverLetter.create({
      data: {
        title: `Cover Letter for ${validatedData.position} at ${validatedData.company}`,
        content: {
          ...validatedData,
          generatedContent: content,
          aiProvider: aiProvider,
        },
        userId: session.user.id,
        aiGenerated: true,
        company: validatedData.company,
        position: validatedData.position,
      },
    })

    return {
      success: "Cover letter generated successfully",
      coverLetterId: coverLetter.id,
    }
  } catch (error) {
    console.error("Error generating cover letter:", error)

    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { error: "Failed to generate cover letter. Please try again." }
  }
}

