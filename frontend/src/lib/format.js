export function money(value, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (_) {
    return `$${Math.round(value)}`;
  }
}

export function sizesOf(product) {
  return (product.sizes || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
