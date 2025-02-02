import { redirect } from "next/navigation";

export const metadata = {
  title: "Redirecting...",
};

export default function Page() {
  redirect("/Main");
}
