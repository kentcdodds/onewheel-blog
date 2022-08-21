import type {
    ActionFunction,
    LoaderFunction,
    MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";


import { createCustomer, getCarmellaCustomer, getCustomer, getCustomers } from "~/models/customers.server";
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

    if (getCustomer(email) != null) {
        return json<ActionData>(
            { errors: { email: "Customer was already added" } },
            { status: 400 }
        );
    }


    const customer = await getCarmellaCustomer(email)

    if (!customer) {
        return json<ActionData>(
            { errors: { email: `Invalid customer for email ${email}` } },
            { status: 400 }
        );
    }

    return createCustomer(customer[0]);
};

export default function Customers() {
    const { customers } = useLoaderData() as LoaderData;
    const actionData = useActionData() as ActionData;

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
                            className="rounded bg-green-600  ml-4 py-2 px-4 max-h-11 text-white hover:bg-green-700 focus:bg-green-500">
                            Add
                        </button>
                    </div>
                    <div>

                    </div>
                </Form>
            </div>
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