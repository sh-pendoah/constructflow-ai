"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = Number(process.env.AI_RUNTIME_PORT ?? 4100);
app.use(express_1.default.json({ limit: "2mb" }));
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
