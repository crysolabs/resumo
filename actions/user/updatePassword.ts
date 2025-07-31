"use server"

import { getServerSession } from "next-auth"
import { z } from "zod"
import bcrypt from "bcryptjs"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export async function updatePassword(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to update your password" }
    }

    const validatedFields = passwordSchema.parse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    })

    const { currentPassword, newPassword } = validatedFields

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hashedPassword: true },
    })

    if (!user?.hashedPassword) {
      return { error: "No password set for this account" }
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword)

    if (!isPasswordValid) {
      return { error: "Current password is incorrect" }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hashedPassword },
    })

    return { success: "Password updated successfully" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }

    return { error: "Something went wrong. Please try again." }
  }
}

