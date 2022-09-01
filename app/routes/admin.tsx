import { LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useCatch, useLoaderData, useParams, useTransition } from "@remix-run/react";
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
  const transition  = useTransition()


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
          {transition.state === "loading" ? "Loading.." : <Outlet />}
          
        </div>
      </main>
    </div>
  );
}

// export function ErrorBoundary({ error }: { error: Error }) {
//   console.error(error);
//   return (
//     <div>
//       <p>Ooops.... We have an error. Be sure it will be fixed soon 🚀</p>
//       {error?.message}
//     </div>
//   );
// }

{/* <div>
<section className="flex items-center h-full sm:p-16 dark:bg-gray-900 dark:text-gray-100">
  <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8 space-y-8 text-center sm:max-w-md">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-40 h-40 dark:text-gray-600">
      <path fill="currentColor" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z"></path>
      <rect width="176" height="32" x="168" y="320" fill="currentColor"></rect>
      <polygon fill="currentColor" points="210.63 228.042 186.588 206.671 207.958 182.63 184.042 161.37 162.671 185.412 138.63 164.042 117.37 187.958 141.412 209.329 120.042 233.37 143.958 254.63 165.329 230.588 189.37 251.958 210.63 228.042"></polygon>
      <polygon fill="currentColor" points="383.958 182.63 360.042 161.37 338.671 185.412 314.63 164.042 293.37 187.958 317.412 209.329 296.042 233.37 319.958 254.63 341.329 230.588 365.37 251.958 386.63 228.042 362.588 206.671 383.958 182.63"></polygon>
    </svg>
    <p className="text-3xl">Ooops.... We have an error. Stay assured it will be fixed soon 🚀</p>
    <p>{error?.message}</p>
    <a rel="noopener noreferrer" href="#" className="px-8 py-3 font-semibold rounded dark:bg-violet-400 dark:text-gray-900">Back to homepage</a>
  </div>
</section>
</div> */}

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