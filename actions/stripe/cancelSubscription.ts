"use server"

import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { cancelStripeSubscription } from "@/lib/stripe"

export async function cancelSubscription() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { error: "You must be logged in to cancel your subscription" }
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription) {
      return { error: "No subscription found" }
    }

    if (!subscription.stripeSubscriptionId) {
      return { error: "No active subscription to cancel" }
    }

    // Cancel subscription in Stripe
    await cancelStripeSubscription(subscription.stripeSubscriptionId)

    // Update subscription in database
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        status: "CANCELED",
        plan: "FREE",
      },
    })

    return { success: "Subscription canceled successfully" }
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return { error: "Failed to cancel subscription. Please try again." }
  }
}

