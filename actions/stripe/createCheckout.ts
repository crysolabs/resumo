"use server"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { createStripeCustomer, createStripeCheckoutSession, getStripeCustomerByUserId } from "@/lib/stripe"

export async function createCheckoutSession(priceId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to upgrade" }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    })

    if (!user) {
      return { error: "User not found" }
    }

    // Get or create Stripe customer
    let customerId = await getStripeCustomerByUserId(user.id)

    if (!customerId) {
      if (!user.email) {
        return { error: "User email is required" }
      }
      customerId = await createStripeCustomer(user.email, user.name || undefined)

      // Create subscription record if it doesn't exist
      if (!user.subscription) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId: customerId,
            plan: "FREE",
            status: "INACTIVE",
          },
        })
      } else {
        // Update existing subscription with customer ID
        await prisma.subscription.update({
          where: { userId: user.id },
          data: { stripeCustomerId: customerId },
        })
      }
    }

    // Create checkout session
    const checkoutSession = await createStripeCheckoutSession(
      customerId,
      priceId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    )

    if (!checkoutSession.url) {
      return { error: "Failed to create checkout session" }
    }

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: 12.0, // Replace with actual amount from price
        currency: "USD",
        status: "PENDING",
        stripeSessionId: checkoutSession.id,
        description: "Subscription to Pro plan",
      },
    })

    redirect(checkoutSession.url)
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return { error: "Failed to create checkout session. Please try again." }
  }
}

