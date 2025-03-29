"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getResumes() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to view your resumes" }
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    })

    return { resumes }
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return { error: "Failed to fetch resumes. Please try again." }
  }
}

