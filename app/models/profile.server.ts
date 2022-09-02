import { json } from "@remix-run/node";


export interface OrdersProfile {
  last_order_date: string;
  next_order_date: string;
  next_order_day:  string;
  broadcast_time:  number;
  mean:            number;
  median:          number;
  months_backward: number;
  plots:           string[];
}

export interface ProductProfile {
  product_id: string;
  name:       string;
  "%":        number;
  min:        number;
  max:        number;
  mean:       number;
  var:        number;
  unit:       string;
}

export interface CartItem {
  product_id:   string;
  name:         string;
  product_unit: string;
  quantity:     number;
}



export async function getProfile(id: string) {
  const res = await fetch(`${ENV.CLARA_PYTHON_API}/customers/profile/${id}`);
  if (res.status != 200) {
    throw new Error(`server error ${res.status}`)
  }
  const data = await res.json();
  console.log(data)
  return data;
}