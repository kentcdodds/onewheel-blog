import type { CarmelaProduct } from "@prisma/client";
import { prisma } from "~/db.server";

export type { CarmelaProduct as Product };

export async function getProductsListings() {
  // TODO: pagination
  // https://www.prisma.io/docs/concepts/components/prisma-client/pagination
  return prisma.carmelaProduct.findMany({
    take: 50,
    select: {
      id: true,
      name: true,
      image: true,
    },
  });
}

export async function getProducts(ids: string[] = []) {
  if (!ids || ids.length == 0) {
    return prisma.carmelaProduct.findMany();
  }

  return await prisma.carmelaProduct.findMany({
    where: {
      id: { in: ids }
    },
    select: {
      id: true,
      image: true,
      price: true,
      name: true
    }
  });
}

export async function getProduct(id: string) {
  return prisma.carmelaProduct.findUnique({ where: { id } });
}

// export async function createPost(
//   post: Pick<Post, "slug" | "title" | "markdown">
// ) {
//   return prisma.post.create({ data: post });
// }

// export async function updatePost(
//   slug: string,
//   post: Pick<Post, "slug" | "title" | "markdown">
// ) {
//   return prisma.post.update({ data: post, where: { slug } });
// }

// export async function deletePost(slug: string) {
//   return prisma.post.delete({ where: { slug } });
// }
