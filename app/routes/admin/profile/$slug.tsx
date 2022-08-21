import { marked } from "marked";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";
import { getProfile } from "~/models/profile.server";
import invariant from "tiny-invariant";

type LoaderData = {
    customer: any;
    orders: any;
    profile: any;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { slug } = params;
  invariant(slug, "slug is required");
  const profile = await getProfile(slug);

  if (!profile) {
    throw new Response("Not Found", { status: 404 });
  }

  // DO some post processing

  return json<LoaderData>({ customer: profile.customer, orders: profile.orders, profile: profile.profile });
};

export default function PostRoute() {
  const { customer, orders, profile } = useLoaderData() as LoaderData;
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">{customer.email}</h1>
      <h2 className="my-6 text-center text-3xl">{customer.first_name} {customer.last_name}</h2>
      <h2 className="my-6 text-center text-3xl">{customer.billing?.phone}</h2>
      <h2 className="my-6 text-center text-3xl">{orders.length} total orders</h2>

      {orders.length == 0 ? (
                <h1>No orders for this customers.</h1>
            ) : (
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>name</th>
                            <th>count</th>
                            <th>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.map((product) => (
                            <tr key={product.product_id}>
                                <td>{product.product_id}</td>
                                <td>{product.name}</td>
                                <td>{product.count}</td>
                                <td>{product.order_percentage}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
    </main>
  );
}
export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <div className="text-red-500">
        Uh oh! The post with the slug "{params.slug}" does not exist!
      </div>
    );
  }
  throw new Error(`Unsupported thrown response status code: ${caught.status}`);
}