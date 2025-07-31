import { headers } from "next/headers"
import { NextResponse } from "next/server"
// import type Stripe from "stripe"

import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object

      // Update subscription status
      if (session.customer && typeof session.customer === 'string') {
        const subscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: session.customer },
        })

        if (subscription && session.subscription && typeof session.subscription === 'string') {
          // Get subscription details from Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription
          )

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              stripeSubscriptionId: session.subscription,
              stripePriceId: session.metadata?.priceId || null,
              stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              plan: "PRO",
              status: "ACTIVE",
            },
          })
        }

        // Update transaction status
        if (session.payment_intent && typeof session.payment_intent === 'string') {
          await prisma.transaction.updateMany({
            where: { stripeSessionId: session.id },
            data: {
              status: "COMPLETED",
              stripePaymentId: session.payment_intent,
            },
          })
        }
      }
      break

    case "invoice.payment_succeeded":
      // Update subscription period on renewal
      const invoice = event.data.object as Stripe.Invoice

      if (invoice.subscription && invoice.customer &&
        typeof invoice.subscription === 'string' && typeof invoice.customer === 'string') {

        const subscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: invoice.customer },
        })

        if (subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription)

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

    case "customer.subscription.updated":
      // Handle subscription updates (e.g., plan changes, renewals)
      const updatedSubscription = event.data.object as Stripe.Subscription

      if (updatedSubscription.customer && typeof updatedSubscription.customer === 'string') {
        const subscription = await prisma.subscription.findFirst({
          where: {
            stripeCustomerId: updatedSubscription.customer,
            stripeSubscriptionId: updatedSubscription.id,
          },
        })

        if (subscription) {
          // Determine the plan based on subscription status and items
          let plan: 'FREE' | 'PRO' = "FREE"
          if (updatedSubscription.status === 'active' && updatedSubscription.items.data.length > 0) {
            plan = "PRO" // You might want to determine this based on the actual price ID
          }

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              stripeCurrentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
              status: updatedSubscription.status === 'active' ? "ACTIVE" :
                updatedSubscription.status === 'canceled' ? "CANCELED" :
                  updatedSubscription.status === 'past_due' ? "PAST_DUE" : "INACTIVE",
              plan: plan,
            },
          })
        }
      }
      break

    case "customer.subscription.deleted":
      // Handle subscription cancellation
      const deletedSubscription = event.data.object as Stripe.Subscription

      if (deletedSubscription.customer && typeof deletedSubscription.customer === 'string') {
        const subscription = await prisma.subscription.findFirst({
          where: {
            stripeCustomerId: deletedSubscription.customer,
            stripeSubscriptionId: deletedSubscription.id,
          },
        })

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "CANCELED",
              plan: "FREE",
              stripeCurrentPeriodEnd: new Date(deletedSubscription.canceled_at ? deletedSubscription.canceled_at * 1000 : Date.now()),
            },
          })
        }
      }
      break

    case "invoice.payment_failed":
      // Handle failed payments
      const failedInvoice = event.data.object as Stripe.Invoice

      if (failedInvoice.subscription && failedInvoice.customer &&
        typeof failedInvoice.subscription === 'string' && typeof failedInvoice.customer === 'string') {

        const subscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: failedInvoice.customer },
        })

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "PAST_DUE",
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