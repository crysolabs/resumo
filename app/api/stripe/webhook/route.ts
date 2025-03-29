import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      // Update subscription status
      if (session.customer) {
        const subscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: session.customer as string },
        })

        if (subscription) {
          // Get subscription details from Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: session.metadata?.priceId,
              stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              plan: "PRO",
              status: "ACTIVE",
            },
          })
        }

        // Update transaction status
        if (session.payment_intent) {
          await prisma.transaction.updateMany({
            where: { stripeSessionId: session.id },
            data: {
              status: "COMPLETED",
              stripePaymentId: session.payment_intent as string,
            },
          })
        }
      }
      break
    case "invoice.payment_succeeded":
      // Update subscription period on renewal
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription && invoice.customer) {
        const subscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        })

        if (subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              status: "ACTIVE",
            },
          })
        }
      }
      break
    case "customer.subscription.deleted":
      // Handle subscription cancellation
      const deletedSubscription = event.data.object as Stripe.Subscription
      if (deletedSubscription.customer) {
        const subscription = await prisma.subscription.findFirst({
          where: {
            stripeCustomerId: deletedSubscription.customer as string,
            stripeSubscriptionId: deletedSubscription.id,
          },
        })

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "CANCELED",
              plan: "FREE",
            },
          })
        }
      }
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return new NextResponse(null, { status: 200 })
}

