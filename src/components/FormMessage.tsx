export default function FormMessage({ type, children }: { type: "error" | "success"; children: React.ReactNode }) {
  return <p className={`mk-message ${type}`}>{children}</p>;
}
