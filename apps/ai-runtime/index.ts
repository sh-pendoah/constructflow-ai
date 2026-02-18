import express from "express";

const app = express();
const port = Number(process.env.AI_RUNTIME_PORT ?? 4100);

app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "docflow-360-ai-runtime",
    traceparent: _req.header("traceparent") ?? null,
    tracestate: _req.header("tracestate") ?? null
  });
});

app.post("/v1/ai/route", (req, res) => {
  res.status(200).json({
    decision: "ALLOW",
    reason_code: "AI_RUNTIME_ROUTE_OK",
    traceparent: req.header("traceparent") ?? null,
    tracestate: req.header("tracestate") ?? null
  });
});

app.listen(port, () => {
  console.log(`docflow-360 ai-runtime listening on ${port}`);
});
