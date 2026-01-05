import { Suspense } from "react";
import PayClient from "./PayClient";

export default function PayPage() {
  return (
    <Suspense fallback={<main className="app">Loading…</main>}>
      <PayClient />
    </Suspense>
  );
}