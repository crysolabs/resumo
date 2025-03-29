import Stripe from "stripe"
import { prisma } from "./prisma"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
})

export const getStripeCustomerByUserId = async (userId: string) => {
  const customer = await prisma.subscription.findUnique({
    where: {
      userId,
    },
    select: {
      stripeCustomerId: true,
    },
  })

  return customer?.stripeCustomerId
}

export const createStripeCustomer = async (email: string, name?: string) => {
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
  })

  return customer.id
}

export const createStripeCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
}

export const cancelStripeSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.cancel(subscriptionId)
}

