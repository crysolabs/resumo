"use server"

import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateResumeContent } from "@/lib/ai"
import { type AIProviderId, getDefaultProvider } from "@/lib/ai-providers"
import { isUserPro } from "@/lib/utils"

const resumeSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    location: z.string().optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
  }),
  experiences: z.array(
    z.object({
      company: z.string().optional(),
      title: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
  education: z.array(
    z.object({
      school: z.string().optional(),
      degree: z.string().optional(),
      field: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  ),
  skills: z.string().optional(),
  aiProvider: z.string().optional(),
})

export async function generateResume(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to generate a resume" }
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
      const resumeCount = await prisma.resume.count({
        where: {
          userId: user.id,
          aiGenerated: true,
        },
      })

      if (resumeCount >= 2) {
        return { error: "Free plan limited to 2 AI-generated resumes. Please upgrade to Pro." }
      }
    }

    // Parse form data
    const personalInfo = JSON.parse(formData.get("personalInfo") as string)
    const experiences = JSON.parse(formData.get("experiences") as string)
    const education = JSON.parse(formData.get("education") as string)
    const skills = formData.get("skills") as string
    const aiProvider = (formData.get("aiProvider") as string) || getDefaultProvider()

    const validatedData = resumeSchema.parse({
      personalInfo,
      experiences,
      education,
      skills,
      aiProvider,
    })

    // Generate resume content using the selected AI provider
    const { content, aiScore } = await generateResumeContent(
      validatedData.personalInfo,
      validatedData.experiences,
      validatedData.education,
      validatedData.skills || "",
      aiProvider as AIProviderId,
    )

    // Create resume in database
    const resume = await prisma.resume.create({
      data: {
        title: `${personalInfo.name}'s Resume`,
        content: {
          personalInfo,
          experiences,
          education,
          skills,
          generatedContent: content,
          aiProvider: aiProvider,
        },
        userId: session.user.id,
        aiGenerated: true,
        aiScore,
      },
    })

    return {
      success: "Resume generated successfully",
      resumeId: resume.id,
      aiScore,
    }
  } catch (error) {
    console.error("Error generating resume:", error)

    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { error: "Failed to generate resume. Please try again." }
  }
}

