#!/usr/bin/env npx tsx

import tickets from "../.cache/tickets.json" with { type: "json" };

const buckets = new Map();

for (const ticket of tickets) {
  if (!ticket.discount_code_used) continue;

  buckets.set(
    ticket.discount_code_used,
    (buckets.get(ticket.discount_code_used) ?? 0) + 1,
  );
}

console.log("code, uses");
console.log(
  Array.from(buckets)
    .sort((a, b) => b[1] - a[1])
    .map((e) => e.join(","))
    .join("\n"),
);
