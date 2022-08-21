import { Customer, Prisma } from "@prisma/client";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";
import Customers from "~/routes/admin/customers";

export type { Customer };

export async function getCustomers() {
    return prisma.customer.findMany();
}

export async function getCustomer(email: string) {
  return await prisma.customer.findUnique({
    where: {
      email
    }
  });
}

export async function getCarmellaCustomer(email: string) {
  const res = await fetch(`https://${ENV.CLARA_PYTHON_API}/customers?email=${email}`);
  const data = await res.json();
  return data;
}

export async function createCustomer(customer: any) {
    return await prisma.customer.create({
      data: {
        customer_id: customer.id,
        email: customer.email,
        mobile: customer.billing?.first_name,
        firstName: customer.billing?.last_name,
        lastName: customer.billing?.last_name
      }
    });
}