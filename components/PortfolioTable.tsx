"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/StatusPill";
import { Market, PortfolioItem, PortfolioStatus } from "@/lib/types";

type PortfolioTableProps = {
  items: PortfolioItem[];
};

const statusTone = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "blocked":
      return "danger";
    case "draft":
      return "warning";
    default:
      return "default";
  }
};

export default function PortfolioTable({ items }: PortfolioTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | PortfolioStatus>("all");
  const [market, setMarket] = useState<"all" | Market>("all");
  const [owner, setOwner] = useState("all");

  const owners = useMemo(() => {
    const unique = new Set(items.map((item) => item.owner));
    return Array.from(unique).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchesStatus = status === "all" || item.status === status;
      const matchesMarket =
        market === "all" || item.markets.includes(market as Market);
      const matchesOwner = owner === "all" || item.owner === owner;
      return matchesSearch && matchesStatus && matchesMarket && matchesOwner;
    });
  }, [items, search, status, market, owner]);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Portfolio</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)" }}>
          <input
            placeholder="Search by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ padding: 10 }}
          />
          <select
            style={{ padding: 10 }}
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | PortfolioStatus)}
          >
            <option value="all">Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select
            style={{ padding: 10 }}
            value={market}
            onChange={(event) => setMarket(event.target.value as "all" | Market)}
          >
            <option value="all">Market</option>
            <option value="EU">EU</option>
            <option value="US">US</option>
            <option value="CA">CA</option>
          </select>
          <select
            style={{ padding: 10 }}
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
          >
            <option value="all">Owner</option>
            {owners.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Markets</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link href={`/portfolio/${item.id}`}>{item.name}</Link>
                </td>
                <td>{item.owner}</td>
                <td>
                  <StatusPill label={item.status} tone={statusTone(item.status)} />
                </td>
                <td>{item.markets.join(", ")}</td>
                <td>{item.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p style={{ color: "#6c645d" }}>No results found.</p>
        ) : null}
      </div>
    </div>
  );
}
