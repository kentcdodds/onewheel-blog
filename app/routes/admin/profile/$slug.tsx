import { LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useCatch, useLoaderData, useParams, useTransition } from "@remix-run/react";
import { CartItem, getProfile, OrdersProfile, type ProductProfile } from "~/models/profile.server";
import invariant from "tiny-invariant";
import { getProduct, Product } from "~/models/product.server";
import { cartItem } from '~/views/cart_item'
import { useState } from "react";
// import DatePicker from 'sassy-datepicker';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { parseISO } from 'date-fns'


import dayjs from "dayjs";
import 'dayjs/locale/en-il'
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AdminError from "../error";

const placeholder = 'https://placeholder.pics/svg/300/DEDEDE/555555/Missing'
dayjs.locale('en-il')

type LoaderData = {
    customer: any;
    products: Map<string, Product>;
    profile: {
        aggregate_products: ProductProfile[],
        next_cart: CartItem[],
        orders_profile: OrdersProfile
    };
};

export const loader: LoaderFunction = async ({ params }) => {
    const { slug } = params;
    invariant(slug, "slug is required");
    const profileData = await getProfile(slug);

    if (!profileData) {
        return redirect('/404')
    }

    return json<LoaderData>({ 
        customer: profileData.customer, 
        products: profileData.products,
        profile: profileData.profile 
    });
};

// function onClick(customer, orders) {
//     //do something
// }

export default function ProfileRoute() {    
    const { customer, products, profile } = useLoaderData() as LoaderData;
    const [nextOrderDate, setNextOrderDate] = useState(parseISO(profile.orders_profile.next_order_date));
    // const transition = useTransition()

    // if(transition.state === "loading") {
    //     return <div>Loading...</div>
    // }

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
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Next order suggestion"
                    value={nextOrderDate}
                    onChange={newDate => { setNextOrderDate(newDate)}}
                    renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider>
            <div className="flex justify-center">
                <Form method="post" className="space-y-6">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Approve Recommendation
                    </button>
                </Form>
            </div>
            <h2 className="my-6 text-2xl">Profile</h2>
            {profile.orders_profile?.plots.map((plot_url: string) => (
                <img key={plot_url} className="justify-center" src={plot_url} alt={plot_url}></img>            
            ))}


            <h2 className="my-6 text-l font-bold">Products {customer.first_name} purchase</h2>

            {profile.aggregate_products.length == 0 ? (
                <h1>No orders for this customers.</h1>
            ) : (
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>%</th>
                            <th>Name</th>
                            <th>Min</th>
                            <th>Max</th>
                            <th>Mean</th>
                            <th>Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.aggregate_products.map((product: ProductProfile) => (
                            <tr key={product.product_id}>
                                <td>{product.product_id}</td>
                                <td>{product["%"]}% (from all orders)</td>
                                <td className="text-center">{product.name}</td>
                                <td>{product.min} {product.unit}</td>
                                <td>{product.max} {product.unit}</td>
                                <td>{product.mean.toFixed(2)} {product.unit}</td>
                                {<td><img className="object-cover h-20" src={products[product.product_id]?.image ?? placeholder} alt={product.name}></img></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
    return (
        <AdminError error={error}/>
    //   <div>
    //     <p>Ooops.... We have an error. Be sure it will be fixed soon 🚀</p>
    //     {error?.message}
    //   </div>
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
    // throw new Error(`Unsupported thrown response status code: ${caught.status}`);
}


// function SellItem({cartItem, products}) {
//     return (<div key={cartItem.product_id}>
//         <img className="object-cover h-20" 
//         src={products[cartItem.product_id]?.image ?? placeholder} 
//         alt={cartItem.name}></img>
//         <p>{cartItem.name}</p>
//     </div>)
// }