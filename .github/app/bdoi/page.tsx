"use client";

import { useEffect, useState } from "react";

type Entry = {
  bdoi: string;
  project: string;
  chain: string;
  type: string;
  hash: string;
  address?: string;
  version?: string;
  verified: boolean;
  createdAt: string;
  notes?: string;
};

export default function BDOIDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/bdoi-graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ bdoiEntries { bdoi project chain type hash address version verified createdAt notes } }" })
    })
      .then((r) => r.json())
      .then((d) => setEntries(d.data.bdoiEntries || []));
  }, []);

  const chains = Array.from(new Set(entries.map((e) => e.chain)));
  const types = Array.from(new Set(entries.map((e) => e.type)));

  const filtered = entries.filter((e) => {
    if (chainFilter !== "all" && e.chain !== chainFilter) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-50">FUSDT bDOI Registry Dashboard</h1>
      <p className="text-sm text-slate-400">
        Canonical identity registry for all FUSDT contracts, metadata, audits, releases, and supply proofs.
      </p>

      <div className="flex gap-4 text-xs">
        <select
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
          value={chainFilter}
          onChange={(e) => setChainFilter(e.target.value)}
        >
          <option value="all">All chains</option>
          {chains.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-[2fr,1fr] gap-4">
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
          <table className="w-full text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <Th>Type</Th>
                <Th>Chain</Th>
                <Th>bDOI</Th>
                <Th>Address</Th>
                <Th>Version</Th>
                <Th>Verified</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.bdoi}
                  className="border-b border-slate-800/60 hover:bg-slate-800/60 cursor-pointer"
                  onClick={() => setSelected(e)}
                >
                  <Td>{e.type}</Td>
                  <Td>{e.chain}</Td>
                  <Td className="font-mono text-[0.7rem] text-emerald-300">{e.bdoi}</Td>
                  <Td className="font-mono text-[0.7rem]">{e.address || "-"}</Td>
                  <Td>{e.version || "-"}</Td>
                  <Td>{e.verified ? "✔" : "…"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/60 p-3 text-xs">
          <h2 className="text-sm font-semibold text-slate-100 mb-2">Details</h2>
          {selected ? (
            <div className="space-y-1">
              <Detail label="bDOI" value={selected.bdoi} mono />
              <Detail label="Project" value={selected.project} />
              <Detail label="Chain" value={selected.chain} />
              <Detail label="Type" value={selected.type} />
              <Detail label="Hash" value={selected.hash} mono />
              <Detail label="Address" value={selected.address || "-"} mono />
              <Detail label="Version" value={selected.version || "-"} />
              <Detail label="Verified" value={selected.verified ? "Yes" : "No"} />
              <Detail label="Created At" value={selected.createdAt} />
              <Detail label="Notes" value={selected.notes || "-"} />
            </div>
          ) : (
            <p className="text-slate-500">Select an entry from the table to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-3 py-2 text-[0.7rem] font-semibold text-slate-400 uppercase tracking-[0.12em]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top text-slate-200">{children}</td>;
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[0.65rem] text-slate-500 uppercase tracking-[0.16em]">{label}</div>
      <div className={`text-[0.75rem] ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
