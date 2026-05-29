---
paths:
  - "**/*.js"
  - "**/*.ts"
  - "**/*.mjs"
---

# Claude API — Code Patterns

Source: getting-started-with-claude, Anthropic official docs

## Prompt Caching

**Automatic caching** (preferred for multi-turn chat):
```js
await client.messages.create({
  model: "claude-sonnet-4-6",
  cache_control: { type: "ephemeral" },
  system: "Your system prompt...",
  messages: [...],
  max_tokens: 1024,
});
```

**Explicit breakpoints** (when you control what is static):
```js
system: [
  { type: "text", text: staticInstructions, cache_control: { type: "ephemeral" } },
  { type: "text", text: perRequestContext }
]
```

TTLs: default 5 min (1.25× write / 0.10× read).
Opt into 1 hour: `cache_control: { type: "ephemeral", ttl: "1h" }` (2× write / 0.10× read).

Minimum token thresholds (content below these is silently skipped):
- Opus 4.7 / Haiku 4.5: 4,096 tokens
- Sonnet 4.6: 1,024–2,048 tokens

Verify caching is working: `response.usage.cache_read_input_tokens > 0`

Silent cache invalidators: timestamps in cached blocks, non-deterministic JSON,
changing tool definitions, toggling web search/citations/fast-mode mid-session,
adding/removing images, changing `tool_choice`.

Render order for invalidation: `tools` → `system` → `messages`. Keep stable content first.
Max 4 cache breakpoints per request.

## Streaming

```js
const stream = client.messages.stream({
  model: "claude-sonnet-4-6",
  max_tokens: 64000,
  messages: [{ role: "user", content: userMessage }],
});

for await (const text of stream.textStream) {
  process.stdout.write(text);
}

const final = await stream.finalMessage();
```

Use streaming when `max_tokens` > ~16K or rendering in real-time.
Non-streaming default: ~16K. Streaming default: ~64K.
Always set `max_tokens` intentionally — truncation mid-sentence is the most common mistake.

## Tool Use

**Client tools** (your code executes):
```js
const tools = [{
  name: "get_weather",
  description: "Get current weather for a city. Returns temperature and conditions.",
  input_schema: {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"]
  },
  strict: true
}];

const response = await client.messages.create({ model, tools, messages, max_tokens });
// response.stop_reason === "tool_use" → run tool → return tool_result
```

**Server tools** (Anthropic executes — no loop needed):
```js
tools: [{ type: "web_search_20260209", name: "web_search" }]
```

Each tool definition costs ~346 tokens. Changing tool definitions between requests
invalidates the prompt cache.

`tool_choice` changes invalidate the prompt cache for message blocks.
Extended thinking only works with `tool_choice: auto` or `tool_choice: none`.

## Thinking (Opus 4.7)

```js
await client.messages.create({
  model: "claude-opus-4-7",
  thinking: { type: "adaptive" },
  output_config: { effort: "xhigh" },  // low | medium | high | max | xhigh
  messages: [...],
  max_tokens: 128000,
});
```

`budget_tokens` is removed. `temperature`, `top_p`, `top_k` cause 400 errors on
Opus 4.7 — omit them entirely for that model.

## Structured Outputs

```js
const response = await client.messages.parse({
  model: "claude-sonnet-4-6",
  output_config: {
    format: { type: "json_schema", json_schema: MyZodSchema }
  },
  messages: [...],
  max_tokens: 1024,
});
```

Use `output_config`, not the deprecated `output_format`.

## Compaction (long conversations)

```js
const response = await client.messages.create({
  model: "claude-opus-4-7",
  messages,
  extra_headers: { "anthropic-beta": "compact-2026-01-12" },
});

// Append full content array — NOT just text
messages.push({ role: "assistant", content: response.content });
```

## Client Singleton

```js
// module-level — construct once, never per request
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env automatically
```

## Error Handling

```js
import Anthropic from "@anthropic-ai/sdk";
try {
  await client.messages.create({ ... });
} catch (err) {
  if (err instanceof Anthropic.RateLimitError)    { /* exponential backoff */ }
  else if (err instanceof Anthropic.APIConnectionError) { /* retry */ }
  else if (err instanceof Anthropic.APIError)     { console.error(err.status, err.error); }
}
```
