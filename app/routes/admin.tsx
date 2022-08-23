import { LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useCatch, useLoaderData, useParams } from "@remix-run/react";
import { getSections } from "~/models/sections.server";

// import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";


type LoaderData = {
  sections: Awaited<ReturnType<typeof getSections>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const sections = getSections();
  return json<LoaderData>({ sections });
};

export default function AdminPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Clara</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New
          </Link>

          <hr />

          {data.sections.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {data.sections.map((section) => (
                <li key={section.path}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={section.path}
                  >
                    {section.name}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// export function ErrorBoundary({ error }: { error: Error }) {
//   return (
// <main className="h-screen w-full flex flex-col justify-center items-center bg-[#1A2238]">
// 	<h1 className="text-9xl font-extrabold text-white tracking-widest">404</h1>
// 	<div className="bg-[#FF6A3D] px-2 text-sm rounded rotate-12 absolute">
// 		Page Not Found
// 	</div>
// 	<button className="mt-5">
//       <a
//         className="relative inline-block text-sm font-medium text-[#FF6A3D] group active:text-orange-500 focus:outline-none focus:ring"
//       >
//         <span
//           className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] group-hover:translate-y-0 group-hover:translate-x-0"
//         ></span>

//         {/* <span className="relative block px-8 py-3 bg-[#1A2238] border border-current">
//           <Link to="/ds">Go Home</Link>
//         </span> */}
//       </a>
//     </button>
// </main>
//   );
// }

// export function CatchBoundary() {
//   const caught = useCatch();
  
//   return (
//     <div>
//       <h1>Caught</h1>
//       <p>Status: {caught.status}</p>
//       <pre>
//         <code>{JSON.stringify(caught.data, null, 2)}</code>
//       </pre>
//     </div>
//   );
// }