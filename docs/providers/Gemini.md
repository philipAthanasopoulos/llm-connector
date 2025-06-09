# GeminiProvider Configuration Guide

The `GeminiProvider` lets you connect your chatbot to Google’s Gemini LLM, either **directly** via public API or through a **proxy**. Note that configurations can vary greatly between providers; this guide covers the available configurations for the `GeminiProvider`. You may find other providers' guides [here](../providers).

> **ℹ️ Info:**  
> This configuration guide assumes you have completed the setup for the `LlmConnector` plugin according to the guide [**here**](/README.md).

---

## 1. Import Provider

```ts
import { GeminiProvider } from "@rcb-plugins/llm-connector";
```

---

## 2. Basic Instantiation

The `GeminiProvider` supports 2 modes ("direct" or "proxy"). Here’s a minimal example for "direct" mode:

```ts
const gemini = new GeminiProvider({
  mode: "direct",                     // "direct" or "proxy"
  model: "gemini-1.5-flash",          // required
  apiKey: process.env.GEMINI_API_KEY, // required in "direct" mode
  responseFormat: "stream",           // "stream" (default) or "json"
});
```

> **⚠️ Warning:** You are **strongly discouraged** from using `mode: "direct"` in production, which risk exposing your API keys on the client side. The "direct" mode is meant to simplify testing, but is typically **unsafe** in production. You should instead be looking to use "proxy" mode with API key secured server-side. You may refer to this lightweight [**LLM proxy project**](https://github.com/tjtanjin/llm-proxy) if you would like a ready-to-go example.

---

## 3. Configuration Options

| Option           | Type                                               | Required              | Default                                            | Description                                                                |
| ---------------- | -------------------------------------------------- | --------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| `mode`           | `"direct"` \| `"proxy"`                            | ✅ always              | —                                                  | Selects direct or proxy mode.                                              |
| `model`          | `string`                                           | ✅ always              | —                                                  | The Gemini model name to call (e.g. `gemini-2.0-flash-lite`). You can find the list of models [**here**](https://ai.google.dev/gemini-api/docs/models).                                             |
| `apiKey`         | `string`                                           | ✅ if `mode: "direct"` | —                                                  | Your Google API key (only with `mode: "direct"`).                          |
| `baseUrl`        | `string`                                           | ✅ if `mode: "proxy"`  | `https://generativelanguage.googleapis.com/v1beta` | Override the base URL for both modes (must be provided in proxy mode).     |
| `method`         | `string`                                           | ❌                     | `"POST"`                                           | HTTP verb to call the endpoint.                                            |
| `headers`        | `Record<string, string>`                           | ❌                     | `{}`                                               | Additional HTTP headers.                                                   |
| `body`           | `Record<string, string>`                           | ❌                     | `{}`                                               | Additional HTTP body.                            |
| `systemMessage`  | `string`                                           | ❌                     | `null`                                        | Prepends a system prompt to every conversation.                            |
| `responseFormat` | `"stream"` \| `"json"`                             | ❌                     | `"stream"`                                         | Determines whether to use stream endpoint from the provider or fetch a full JSON output.          |
| `messageParser`         | `(msgs: Message[]) => CustomMessage[]` | ❌        | `null`                                                                                                                 | Custom parser converting React ChatBotify [`Message[]`](https://react-chatbotify.com/docs/concepts/conversations#message) into desired message format for the provider.                               |
| `debug`          | `boolean`                                      | ❌        | `false`     | Enables debug logging for the provider.                                                               |

---

## 4. Advanced Example

```ts
const gemini = new GeminiProvider({
  mode: "proxy",
  model: "gemini-1.5-flash",
  baseUrl: "https://my-proxy.example.com/gemini",
  method: "POST",
  headers: {
    "X-Custom-Header": "value",
  },
  body: {
    temperature: "0.7",
  },
  systemMessage: "You are a helpful assistant that translates English to French.",
  responseFormat: "stream",
  messageParser: (msgs) => msgs.map((m) => ({ role: m.sender.toLowerCase(), content: String(m.content) })),
});
```

---

## 5. How It Works Under the Hood

1. **Constructor**: sets defaults such as endpoint.
2. **`sendMessages()`**:
     * Fetches `endpoint` with JSON body.
     * Streams via SSE if `responseFormat === "stream"`.
     * Otherwise returns full text from JSON.

---

*Check out other providers [here](../providers).*
