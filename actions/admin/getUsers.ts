"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getUsers() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to access this resource" }
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "ADMIN") {
      return { error: "You do not have permission to access this resource" }
    }

    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        _count: {
          select: {
            resumes: true,
            coverLetters: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { users }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { error: "Failed to fetch users. Please try again." }
  }
}

