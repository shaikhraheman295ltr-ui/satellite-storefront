export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
