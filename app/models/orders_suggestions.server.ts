import type { CartItem, Customer, OrderSuggestion, Prisma } from "@prisma/client";
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
    console.log(e)
    if (e instanceof OrderSuggestionError) {
      return e.order
    }
  }
}

export async function createOrder(customerId: number, cartItems: CartItem[], suggestedDate: Date) {
  const activeOrder = await getActiveOrder(customerId)
  if (activeOrder) {
    throw new OrderSuggestionError(`User already have an active order ${activeOrder.id}`, activeOrder)
  }
  console.log('createOrder')
  return await prisma.orderSuggestion.create({
    data: {
      suggestedDate,
      isActive: true,
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

export async function getActiveOrder(customerId: number) {
  return await prisma.orderSuggestion.findFirst({
    where: {
      customer: {
        customerId: {
          equals: customerId
        }
      },
      isActive: {
        equals: true
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
