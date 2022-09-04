import { CartItem, Customer, OrderSuggestion, OrderSuggestionStatus, Prisma } from "@prisma/client";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

type OrderSuggestionFullPayload = Prisma.OrderSuggestionGetPayload<{
  include: {
    cartItems: true,
    customer: true
  }
}>

export type { OrderSuggestionFullPayload as OrderSuggestion , CartItem}

class OrderSuggestionError extends Error {
  public order: OrderSuggestionFullPayload;

  constructor(msg: string, order: OrderSuggestionFullPayload) {
    super(msg);
    this.order = order;
  }
}

export async function getOrderForProfile(customerId: number, cartItems: CartItem[], suggestedDate: Date) {
  console.log('getOrderForProfile')
  try {
    return await createOrder(customerId, cartItems, suggestedDate);
  } catch (e) {
    if (e instanceof OrderSuggestionError) {
      return e.order
    } else {
      console.log(e)
    }
  }
}

export async function createOrder(customerId: number, cartItems: CartItem[], suggestedDate: Date) {
  const order = await getInReviewOrder(customerId)
  if (order) {
    throw new OrderSuggestionError(`User already have an active order in review ${order.id}`, order)
  }
  console.log('createOrder')
  return await prisma.orderSuggestion.create({
    data: {
      suggestedDate,
      status: OrderSuggestionStatus.InReview,
      customer: {
        connect: {
          customerId: customerId
        }
      },
      cartItems: {
        createMany: {
          data: cartItems
        }
      }
    },
    include: {
      cartItems: true,
      customer: true
    }
  });
}

export async function deleteOrder(id: string) {
  return await prisma.orderSuggestion.delete({
    where: {
      id
    },
    include: {
      cartItems: true
    }
  });
}

export async function getInReviewOrder(customerId: number) {
  return await prisma.orderSuggestion.findFirst({
    where: {
      customer: {
        customerId: {
          equals: customerId
        }
      },
      status: {
        equals: OrderSuggestionStatus.InReview
      }
    },
    include: {
      cartItems: true,
      customer: true
    }
  });
}

export async function updateCartItem(id: string, quantity: number) {
  return await prisma.cartItem.update({
    where: {
      id
    },
    data: {
      quantity: quantity
    }
  });
}


export async function updateOrderSuggestedDate(id: string, suggestedDate: Date) {
  return await prisma.orderSuggestion.update({
    where: {
      id
    },
    data: {
      suggestedDate
    }
  });
}

export async function stashOrder(id: string) {
  return await prisma.orderSuggestion.update({
    where: {
      id
    },
    data: {
      status: OrderSuggestionStatus.Stashed
    }
  });
}