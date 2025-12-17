import Stripe from 'stripe';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const method = ['card']

const domain = process.env.DOMAIN
const successUrl = domain + "/checkout/success"
const cancelUrl = domain + "/checkout/cancel"

export function processCheckout (products, _req) {
  return stripe.checkout.sessions.create({
    payment_method_types: method,
    mode: 'payment',
    line_items: products.map((p) => {
      return {
        price_data: {
          unit_amount: Math.round(p.productId.price * 100),
          currency: 'usd',
          product_data: {
            name: p.productId.title,
            description: p.productId.description,
          },
        },
        quantity: p.quantity,
      }
    }),
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}
