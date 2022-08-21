import invariant from "tiny-invariant";

export function getEnv() {
  invariant(process.env.ADMIN_EMAIL, "ADMIN_EMAIL should be defined");
  invariant(process.env.CLARA_PYTHON_API, "CLARA_PYTHON_API should be defined");

  return {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    CLARA_PYTHON_API: process.env.CLARA_PYTHON_API
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
