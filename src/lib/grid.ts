// A toy power grid for the interactive figure in graph-world-models.mdx:
// two generators, four substations. Substations 1 and 2 hang off both
// generators, 3 only off Gen 1, 4 only off Gen 2.
//
// ponytail: hand-written rules standing in for a trained world model - the
// figure says so. A shared substation splits its demand evenly across
// whichever of its generators are alive, and an overloaded generator delivers
// its capacity spread proportionally, which is what sags the voltage. No
// line losses, no real power-flow maths; the point is that one failure moves
// load across the graph, not engineering accuracy.

export type NodeId = "g1" | "g2" | "s1" | "s2" | "s3" | "s4";
export type Status =
  "ok" | "strained" | "overloaded" | "brownout" | "dark" | "idle" | "failed";

export interface NodeState {
  status: Status;
  temperature: number; // °C
  voltage: number; // kV
  power: number; // MW - delivered for a generator, received for a substation
}

export interface Prediction {
  nodes: Record<NodeId, NodeState>;
  flow: Record<string, number>; // `${gen}-${sub}` -> MW on that line
}

const NOMINAL_KV = 110;
const BROWNOUT_KV = 105;

export const GENERATORS = {
  g1: { capacity: 90 },
  g2: { capacity: 90 },
} as const;

export const SUBSTATIONS = {
  s1: { demand: 30, gens: ["g1", "g2"] },
  s2: { demand: 30, gens: ["g1", "g2"] },
  s3: { demand: 40, gens: ["g1"] },
  s4: { demand: 40, gens: ["g2"] },
} as const;

type GenId = keyof typeof GENERATORS;
type SubId = keyof typeof SUBSTATIONS;

const round = (n: number) => Math.round(n * 10) / 10;

export function predict(failed: ReadonlySet<NodeId>): Prediction {
  // Pass 1: how much each generator is asked for.
  const asked: Record<GenId, number> = { g1: 0, g2: 0 };
  for (const [sid, sub] of Object.entries(SUBSTATIONS) as [
    SubId,
    (typeof SUBSTATIONS)[SubId],
  ][]) {
    if (failed.has(sid)) continue;
    const live = sub.gens.filter((g) => !failed.has(g));
    for (const g of live) asked[g] += sub.demand / live.length;
  }

  // What fraction of each request a generator can actually meet.
  const met = (g: GenId) =>
    asked[g] > 0 ? Math.min(1, GENERATORS[g].capacity / asked[g]) : 1;

  const nodes = {} as Record<NodeId, NodeState>;
  const flow: Record<string, number> = {};

  for (const g of Object.keys(GENERATORS) as GenId[]) {
    if (failed.has(g)) {
      nodes[g] = { status: "failed", temperature: 20, voltage: 0, power: 0 };
      continue;
    }
    const load = asked[g] / GENERATORS[g].capacity;
    nodes[g] = {
      status:
        load === 0
          ? "idle"
          : load > 1
            ? "overloaded"
            : load > 0.9
              ? "strained"
              : "ok",
      temperature: round(35 + 45 * load),
      voltage: round(NOMINAL_KV * met(g)),
      power: round(Math.min(asked[g], GENERATORS[g].capacity)),
    };
  }

  for (const [sid, sub] of Object.entries(SUBSTATIONS) as [
    SubId,
    (typeof SUBSTATIONS)[SubId],
  ][]) {
    for (const g of sub.gens) flow[`${g}-${sid}`] = 0;
    if (failed.has(sid)) {
      nodes[sid] = { status: "failed", temperature: 20, voltage: 0, power: 0 };
      continue;
    }
    const live = sub.gens.filter((g) => !failed.has(g));
    let received = 0;
    for (const g of live) {
      const f = (sub.demand / live.length) * met(g);
      flow[`${g}-${sid}`] = round(f);
      received += f;
    }
    const voltage = round(NOMINAL_KV * (received / sub.demand));
    nodes[sid] = {
      status:
        received === 0 ? "dark" : voltage < BROWNOUT_KV ? "brownout" : "ok",
      temperature: round(received === 0 ? 20 : 25 + 0.4 * received),
      voltage,
      power: round(received),
    };
  }

  return { nodes, flow };
}
