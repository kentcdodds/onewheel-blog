import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useCatch, useLoaderData, useParams } from "@remix-run/react";
import { CartItem, getProfile, OrdersProfile, type ProductProfile } from "~/models/profile.server";
import invariant from "tiny-invariant";
import { getProduct, Product } from "~/models/product.server";
import { cartItem } from '~/views/cart_item'

const placeholder = 'https://placeholder.pics/svg/300/DEDEDE/555555/Missing'

type LoaderData = {
    customer: any;
    orders: any;
    products: Map<string, Product>;
    profile: {
        aggregate_products: ProductProfile[],
        next_cart: CartItem[],
        orders_profile: any
    };
};

export const loader: LoaderFunction = async ({ params }) => {
    const { slug } = params;
    invariant(slug, "slug is required");
    const profileData = await getProfile(slug);

    if (!profileData) {
        throw new Response("Not Found", { status: 404 });
    }

    return json<LoaderData>({ 
        customer: profileData.customer, 
        orders: profileData.orders, 
        products: profileData.products,
        profile: profileData.profile 
    });
};

export default function ProfileRoute() {
    const { customer, orders, products, profile } = useLoaderData() as LoaderData;
    return (
        <main className="mx-auto max-w-4xl">
            <h1 className="my-6 text-center text-3xl">{customer.email}</h1>
            <h2 className="my-6 text-center text-2xl border-b-2">{customer.first_name} {customer.last_name} {customer.billing?.phone}</h2>

            <h2 className="my-6 text-2xl">Next cart recommendation:</h2>
            <div className="grid grid-cols-4 gap-4 mb-10 mt-4">
            {profile.next_cart.map((cartItem) => (
                <div key={cartItem.product_id}>
                    <img className="object-cover h-20" 
                    src={products[cartItem.product_id]?.image ?? placeholder} 
                    alt={cartItem.name}></img>
                    <p>{cartItem.name}</p>
                </div>
            ))}
            </div>

            <p>Next Order suggestion: 01/01/2020</p>
            
            <div className="flex justify-center">
                <Form method="post" className="space-y-6">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Approve Recommendation
                    </button>
                </Form>
            </div>
            <h2 className="my-6 text-2xl">Profile</h2>
            {profile.orders_profile?.plots.map((plot_url) => (
                <img key={plot_url} className="justify-center" src={plot_url} alt={plot_url}></img>            
            ))}


            <h2 className="my-6 text-l font-bold">What products are most frequent in the {orders.length} past orders</h2>

            {/* {orders.length == 0 ? (
                <h1>No orders for this customers.</h1>
            ) : (
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>name</th>
                            <th>count</th>
                            <th>%</th>
                            <th>Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.products.map((product: ProductProfile) => (
                            <tr key={product.product_id}>
                                <td>{product.product_id}</td>
                                <td>{product.name}</td>
                                <td>{product.count}</td>
                                <td>{product.order_percentage}</td>
                                {<td><img className="object-cover h-20" src={product.info?.image??placeholder} alt={product.name}></img></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )} */}
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