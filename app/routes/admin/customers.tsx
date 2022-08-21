import type {
    ActionFunction,
    LoaderFunction,
    MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useTransition } from "@remix-run/react";


import { createCustomer, searchCustomer, getCustomer, getCustomers } from "~/models/customers.server";
import { validateEmail } from "~/utils";

type LoaderData = {
    customers: Awaited<ReturnType<typeof getCustomers>>;
};

export const loader: LoaderFunction = async ({ request }) => {
    return json<LoaderData>({ customers: await getCustomers() });
};

interface ActionData {
    errors?: {
        email?: string;
    };
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email");

    if (!validateEmail(email)) {
        return json<ActionData>(
            { errors: { email: "Email is invalid" } },
            { status: 400 }
        );
    }

    if (await getCustomer(email) != undefined) {
        return json<ActionData>(
            { errors: { email: "Customer was already added" } },
            { status: 400 }
        );
    }


    const customers = await searchCustomer(email)

    if (!customers || customers.length == 0) {
        return json<ActionData>(
            { errors: { email: `Invalid customer for email ${email}` } },
            { status: 400 }
        );
    }

    
    await createCustomer(customers[0]);
    return redirect('admin/customers');
};

export default function Customers() {
    const { customers } = useLoaderData() as LoaderData;
    const actionData = useActionData() as ActionData;

    const transition = useTransition();
    const isAdding = transition.submission?.formData.get("intent") === "create";
    
    return (
        <div>
            <h1>Customers</h1>
            <div>
                <h1>Add new</h1>
                <Form method="post" className="space-y-6">
                    <div className="flex">
                        <div className="mt-1">
                            <input
                                id="email"
                                placeholder="customer@mail.com"
                                required
                                autoFocus={false}
                                name="email"
                                type="email"
                                autoComplete="email"
                                aria-invalid={actionData?.errors?.email ? true : undefined}
                                aria-describedby="email-error"
                                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                            />
                            {actionData?.errors?.email && (
                                <div className="pt-1 text-red-700" id="email-error">
                                    {actionData.errors.email}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            name="intent"
                            value="create"
                            disabled={isAdding}
                            className="rounded bg-green-600  ml-4 py-2 px-4 max-h-11 text-white hover:bg-green-700 focus:bg-green-500">
                            {isAdding ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                    <div>

                    </div>
                </Form>
            </div>

            {customers.length == 0 ? (
                <h1>No customers. Use the 'Add' button</h1>
            ) : (
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>email</th>
                            <th>mobile</th>
                            <th>Name</th>
                            <th>Profile</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.customer_id}>
                                <td>{customer.customer_id}</td>
                                <td>{customer.email}</td>
                                <td>{customer.mobile}</td>
                                <td>{customer.firstName} {customer.lastName}</td>
                                <td><Link to={`/admin/profile/${customer.customer_id}`} className="text-blue-600">Profile</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    return (
        <div className="text-red-500">
            Oh no, something went wrong!
            <pre>{error.message}</pre>
        </div>
    );
}