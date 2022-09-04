import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useCatch, useFetcher, useLoaderData, useParams, useTransition } from "@remix-run/react";
import { getProfile, OrdersProfile, type ProductProfile } from "~/models/profile.server";
import invariant from "tiny-invariant";
import { getProduct, Product } from "~/models/product.server";
import { useState } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
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
import Box from "@mui/system/Box";
// import { LazyLoadImage, trackWindowScroll }
//     from 'react-lazy-load-image-component';
import { Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { CartItem, createOrder, getOrderForProfile, OrderSuggestion, updateCartItem } from "~/models/orders_suggestions.server";
import { profile } from "console";
import { DeleteForever } from "@mui/icons-material";
import BeenhereIcon from '@mui/icons-material/Beenhere';

const placeholder = 'https://placeholder.pics/svg/300/DEDEDE/555555/Missing'
dayjs.locale('en-il')

type LoaderData = {
    products: { [key: string]: Product };
    profile: {
        aggregate_products: { [key: string]: ProductProfile },
        orders_profile: OrdersProfile
    };
    order?: OrderSuggestion;
};

// interface ActionData {
//     errors?: {
//         email?: string;
//     };
// }


export const loader: LoaderFunction = async ({ params }) => {
    console.log('inside loader')
    const { slug } = params;
    invariant(slug, "slug is required");
    const profileData = await getProfile(slug);

    if (!profileData) {
        return redirect('/404')
    }


    const order = await getOrderForProfile(profileData.customer.id, 
        profileData.profile.next_cart, 
        parseISO(profileData.profile.orders_profile.next_order_date))
        

    return json<LoaderData>({
        products: profileData.products,
        profile: profileData.profile,
        order: order
    });
};

// function onClick(customer, orders) {
//     //do something
// }

export default function ProfileRoute() {
    const data = useLoaderData() as LoaderData;
    const profile = data.profile
    const products = data.products
    const customer = data.order?.customer;
    data.order?.cartItems.sort((a, b) => profile.aggregate_products[b.product_id]["%"] - profile.aggregate_products[a.product_id]["%"]);

    const [order, setOrder] = useState(data.order)
    const [nextOrderDate, setNextOrderDate] = useState(parseISO(profile.orders_profile.next_order_date));
    
    const fetcher = useFetcher();

    // const transition = useTransition()

    // if(transition.state === "loading") {
    //     return <div>Loading...</div>
    // }

    // function SomeComponent() {
    //     const fetcher = useFetcher();
      
    //     // trigger the fetch with these
    //     <fetcher.Form {...formOptions} />;
      
    //     useEffect(() => {
    //       fetcher.submit(order, options);
    //       fetcher.load(href);
    //     }, [fetcher]);
      
    //     // build UI with these
    //     fetcher.state;
    //     fetcher.type;
    //     fetcher.submission;
    //     fetcher.data;
    // }

    // const approveOrder = () => {
    //     fetcher.submit(
    //         { some: 'json json' },
    //         { method: "post" }
    //     );
    // }

    return (
        <main className="mx-auto max-w-4xl">
            <h1 className="my-6 text-center text-3xl">{customer?.email}</h1>
            <h2 className="my-6 text-center text-2xl border-b-2">{customer?.firstName} {customer?.lastName} {customer?.mobile}</h2>

            <h2 className="my-6 text-2xl">Next cart recommendation:</h2>
            <p>Order id {order?.id}</p>
            <div className="grid grid-cols-4 gap-4 mb-10 mt-4">
                {order?.cartItems.map((cartItem) => (
                    <div key={cartItem.product_id}>
                        <CartItemView
                            cartItem={cartItem}
                            product={products[cartItem.product_id]}
                            productProfile={profile.aggregate_products[cartItem.product_id]} />
                    </div>
                ))}
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Next order suggestion"
                    value={nextOrderDate}
                    onChange={newDate => { newDate && setNextOrderDate(newDate) }}
                    renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider>
            <div className="flex justify-center">
                {/* <Form method="post" className="space-y-6">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Approve Recommendation
                    </button>
                </Form> */}
                <fetcher.Form method='post'>
                    <Button variant="contained" color="error" value={order?.id} startIcon={<DeleteForever />}>
                        Delete Suggestion
                    </Button>
                    <Button variant="contained" color="success" value={order?.id} startIcon={<BeenhereIcon />}>
                        Save Suggestion
                    </Button>
                </fetcher.Form>
            </div>
            <h2 className="my-6 text-2xl">Profile</h2>
            {profile.orders_profile?.plots.map((plot_url: string) => (
                <img key={plot_url} className="justify-center" src={plot_url} alt={plot_url}></img>
            ))}


            <h2 className="my-6 text-l font-bold">Products {customer?.firstName} purchase</h2>

            {/* {Object.keys(profile.aggregate_products).length == 0 ? (
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
                        {Object.keys(profile.aggregate_products).map((key, index) => (
                            <tr key={index}>
                                <td>{profile.aggregate_products[key].product_id}</td>
                                <td>{profile.aggregate_products[key]["%"]}% (from all orders)</td>
                                <td className="text-center">{profile.aggregate_products[key].name}</td>
                                <td>{profile.aggregate_products[key].min} {profile.aggregate_products[key].unit}</td>
                                <td>{profile.aggregate_products[key].max} {profile.aggregate_products[key].unit}</td>
                                <td>{profile.aggregate_products[key].mean.toFixed(2)} {profile.aggregate_products[key].unit}</td>
                                {<td><img className="object-cover h-20" src={products[key]?.image ?? placeholder} alt={products[key].name}></img></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )} */}
        </main>
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
    return (
        <AdminError error={error} />
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


export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();    
    const cartItemId = formData.get("cartItemId")?.toString() ?? "";
    const quantitiy = Number(formData.get("quantitiy"));

    const item = await updateCartItem(cartItemId, quantitiy)
    console.log(item)
    return null
};


function CartItemView({ cartItem, product, productProfile }: { cartItem: CartItem, product: Product, productProfile: ProductProfile }) {
    const delta: number = cartItem.product_unit == 'unit' ? 1 : 0.5
    const unit_string = cartItem.product_unit == 'unit' ? 'יח׳' : 'ק״ג'
    const [quantityString, setQuantityString] = useState(`${unit_string} ${cartItem.quantity}`);
    const [showInfo, setShowInfo] = useState(false);
    // const productProfileView = ProductProfileViewModel.test()

    const fetcher = useFetcher()
    function updateQuantity(value: number) {
        cartItem.quantity = Math.max(0, cartItem.quantity + value)
        setQuantityString(`${unit_string} ${cartItem.quantity}`)
        fetcher.submit(
            { 
                cartItemId: cartItem.id,
                quantitiy: cartItem.quantity.toString()
            }, 
            {
                method: 'post'
            }
        );
    }

    function productProfileView(profile: ProductProfile) {
        return [
            { 'key': '% from all orders', 'value': profile["%"].toString() },
            { 'key': 'min quantitiy', 'value': profile.min.toString() },
            { 'key': 'max quantitiy', 'value': profile.max.toString() },
            { 'key': 'mean', 'value': profile.mean.toFixed(2).toString() },
            { 'key': 'variance', 'value': profile.var.toFixed(2).toString() },
            { 'key': 'unit', 'value': profile.unit },
        ]
    }
    return (
        <Box sx={{ height: '100%' }}>
            <Stack spacing={0} direction="column" alignItems="center">
                <img className="object-cover h-40"
                    src={product?.image ?? placeholder}
                    alt={cartItem.name}></img>
                <Box sx={{ fontWeight: 'bold', m: 1 }} textAlign='center'>
                    <IconButton color="success" aria-label="minus 1" onClick={() => setShowInfo(!showInfo)}><QueryStatsIcon /></IconButton>
                    {cartItem.name}&nbsp;{cartItem.product_id}
                </Box>
                <Box sx={{ fontWeight: 'light', m: 1 }}>{product?.weight_type} / ֿ{product?.price}</Box>

                <fetcher.Form method='post'>
                    <Stack spacing={1} direction="row" alignItems={"center"}>
                        <IconButton color="success" aria-label="minus 1" onClick={() => updateQuantity(-delta)}><RemoveIcon /></IconButton>
                        <Input readOnly value={quantityString} inputProps={{ min: 0, style: { textAlign: 'center' } }} />
                        <IconButton color="success" aria-label="plus 1" onClick={() => updateQuantity(+delta)}><AddIcon /></IconButton>
                    </Stack>
                </fetcher.Form>
                {showInfo == true ? (
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 100 }} aria-label="simple table">
                            <TableHead />
                            <TableBody>
                                {productProfileView(productProfile).map((prop) => (
                                    <TableRow key={prop['key']} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">{prop['key']}</TableCell>
                                        <TableCell align="right">{prop['value']}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                ) : (<div></div>)
                }
            </Stack>
        </Box>
    )
}



// interface ActionData {
//     errors?: {
//         email?: string;
//     };
// }

// export const action: ActionFunction = async ({ request }) => {
//     const formData = await request.formData();
//     const email = formData.get("email");

//     if (!validateEmail(email)) {
//         return json<ActionData>(
//             { errors: { email: "Email is invalid" } },
//             { status: 400 }
//         );
//     }

//     if (await getCustomer(email) != undefined) {
//         return json<ActionData>(
//             { errors: { email: "Customer was already added" } },
//             { status: 400 }
//         );
//     }


//     const customers = await searchCustomer(email)

//     if (!customers || customers.length == 0) {
//         return json<ActionData>(
//             { errors: { email: `Invalid customer for email ${email}` } },
//             { status: 400 }
//         );
//     }

    
//     await createCustomer(customers[0]);
//     return redirect('admin/customers');
// };