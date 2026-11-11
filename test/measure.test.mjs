import assert from "node:assert/strict";
import test from "node:test";
import { measureCorrelationGraph } from "@red-cup-engineering/correlation-graph-measurement-service";

test("keeps the sign of inverse histories when signed edges are requested", () => {
  const returnsByEntity = { b: [3, 2, 1], a: ["1", "2", "3"] };
  assert.deepEqual(measureCorrelationGraph({ returnsByEntity }).edges, []);
  const graph = measureCorrelationGraph({ returnsByEntity, positiveOnly: false, minimumAbsoluteCorrelation: 0.9 });
  assert.deepEqual(graph.entities, ["a", "b"]);
  assert.equal(graph.edges.length, 1);
  assert.equal(graph.edges[0].transport, -1);
  assert.ok(Math.abs(graph.edges[0].observedCorrelation + 1) < 1e-12);
  assert.equal(graph.causationEstablished, false);
});

test("rejects missing values and unidentifiable constant histories", () => {
  assert.throws(() => measureCorrelationGraph({ returnsByEntity: { a: [1, , 3], b: [1, 2, 3] } }),
    /equal-finite-return-histories-required/u);
  assert.throws(() => measureCorrelationGraph({ returnsByEntity: { a: [2, 2, 2], b: [1, 2, 3] } }),
    /zero-variance/u);
});

test("refuses an overflowing variance instead of reporting no edge", () => {
  assert.throws(() => measureCorrelationGraph({ returnsByEntity: { a: [1e160, -1e160, 0], b: [1, -1, 0] } }),
    /correlation-nonfinite-moment/u);
});
