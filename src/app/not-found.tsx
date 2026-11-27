import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <section className="not-found wrap">
      <p className="eyebrow"><span />404</p>
      <h1>Page unavailable.</h1>
      <p>Check the address or continue from the YMS Technologies homepage.</p>
      <Link className="button" href="/">Back to home <Icon name="up-right" size={16} /></Link>
    </section>
  );
}
