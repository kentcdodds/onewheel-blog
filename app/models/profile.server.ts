import { json } from "@remix-run/node";

export async function getProfile(id: string) {
  const res = await fetch(`${ENV.CLARA_PYTHON_API}/customers/profile/${id}`);
  const data = await res.json();
  console.log(data)
  return data;
}