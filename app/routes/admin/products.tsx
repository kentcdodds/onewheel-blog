import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData, Image } from "@remix-run/react";
import { getProductsListings } from "~/models/product.server";

type LoaderData = {
    products: Awaited<ReturnType<typeof getProductsListings>>;
};

export const loader: LoaderFunction = async ({ request }) => {
    const products = await getProductsListings();
    return json<LoaderData>({ products });
};

export default function Products() {
    const { products } = useLoaderData() as LoaderData;

    return (
        <div>
            <h1>Camrella Products</h1>

            <table className="table-auto">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Image</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.name}>
                            <td>{product.id}</td>
                            <td>{product.name.replace(/<[^>]*>?/gm, '')}</td>
                            <td><img className="object-cover h-20" src={product.image} alt={product.name}></img></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}