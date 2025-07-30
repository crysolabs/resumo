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

export async function generateResume({
  personalInfo,
  experiences,
  education,
  skills,
  selectedProvider,

}: {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    summary: string;
  },
  experiences:
  {
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
  }[],
  education: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[],
  skills: string,
  selectedProvider: "OPENAI" | "MODELSLAB"
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { error: "You must be logged in to generate a resume" }
    }

    // Get user subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    })

    // Use safer logging approach
    console.log("Session:", session ? { ...session, user: session.user ? { id: session.user.id, email: session.user.email } : null } : null)
    console.log("User:", user ? { id: user.id, email: user.email, hasSubscription: !!user.subscription } : null)

    if (!user) {
      return { error: "User not found" }
    }

    console.log("User subscription status:", user.subscription ? "Active" : "None")

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

    const validatedData = resumeSchema.parse({
      personalInfo,
      experiences,
      education,
      skills,
      selectedProvider,
    })

    console.log("Validated data:", JSON.stringify({
      personalInfoName: validatedData.personalInfo.name,
      experiencesCount: validatedData.experiences.length,
      educationCount: validatedData.education.length,
      hasSkills: !!validatedData.skills,
      provider: selectedProvider
    }))

    // Generate resume content using the selected AI provider
    const { content, aiScore } = await generateResumeContent(
      validatedData.personalInfo,
      validatedData.experiences,
      validatedData.education,
      validatedData.skills || "",
      selectedProvider as AIProviderId,
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
          aiProvider: selectedProvider,
        },
        userId: user.id,
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
    // Safe error logging that handles circular references and null values
    console.error("Error generating resume:", error instanceof Error ? error.message : String(error))

    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { error: "Failed to generate resume. Please try again." }
  }
}