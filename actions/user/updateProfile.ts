"use server"

import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
})

export async function updateProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to update your profile" }
    }

    const validatedFields = profileSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    })

    const { name, email, phone } = validatedFields

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return { error: "Email is already taken" }
      }
    }

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        // Store phone in a custom field or extend the User model
      },
    })

    return { success: "Profile updated successfully" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }

    return { error: "Something went wrong. Please try again." }
  }
}

