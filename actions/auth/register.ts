"use server"

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { z } from "zod"

import prisma from "@/lib/prisma"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function register(formData: FormData) {
  try {
    const validatedFields = registerSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    })

    const { name, email, password } = validatedFields

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    })

    // Create free subscription for the user
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE",
        status: "ACTIVE",
      },
    })

    redirect("/login?registered=true")
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }

    return { error: "Something went wrong. Please try again." }
  }
}

