"use server"

import { signIn } from "next-auth/react"
import { redirect } from "next/navigation"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function login(formData: FormData) {
  try {
    const validatedFields = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    const { email, password } = validatedFields

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }


    return { error: "Something went wrong. Please try again." }
  }

  redirect("/dashboard")
}

