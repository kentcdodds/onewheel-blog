import type { CartItem, Customer, OrderSuggestion, Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

type OrderSuggestionFullPayload = Prisma.OrderSuggestionGetPayload<{
  include: {
    cartItems: true,
    customer: true
  }
}>

export type { OrderSuggestionFullPayload as OrderSuggestion }

class OrderSuggestionError extends Error {
  public order: OrderSuggestionFullPayload;

  constructor(msg: string, order: OrderSuggestionFullPayload) {
    super(msg);
    this.order = order;
  }
}

export async function getOrderForProfile(customer: Customer, cartItems: CartItem[], suggestedDate: Date) {
  try {
    return await createOrder(customer, cartItems, suggestedDate);
  } catch (e) {
    if (e instanceof OrderSuggestionError) {
      return e.order
    }
  }
}

export async function createOrder(customer: Customer, cartItems: CartItem[], suggestedDate: Date) {
  const activeOrder = await getActiveOrder(customer.mobile)
  if (activeOrder) {
    throw new OrderSuggestionError(`User already have an active order ${activeOrder.id}`, activeOrder)
  }

  return await prisma.orderSuggestion.create({
    data: {
      suggestedDate,
      isActive: true,
      customer: {
        connect: {
          email: customer.email
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

export async function getActiveOrder(mobile: string) {
  return await prisma.orderSuggestion.findFirst({
    where: {
      customer: {
        mobile: {
          equals: mobile
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
