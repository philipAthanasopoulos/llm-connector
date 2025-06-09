# WebLlmProvider Configuration Guide

The `WebLlmProvider` runs LLM models directly in the browser using the MLC WebLLM runtime. It exposes the WebLLM [**MlcEngineConfig**](https://webllm.mlc.ai/docs/user/api_reference.html#mlcengineconfig) and [**GenerationConfig**](https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig).

> **ℹ️ Info:**  
> This configuration guide assumes you have completed the setup for the `LlmConnector` plugin according to the guide [**here**](/README.md).

---

## 1. Install Dependency Package & Import Provider

```bash
npm install @mlc-ai/web-llm
```

```ts
import { WebLlmProvider } from "@rcb-plugins/llm-connector";
```

---

## 2. Basic Instantiation

A minimal example for browser-based inference:

```ts
const webllm = new WebLlmProvider({
  model: "qwen2-0.5b-instruct-q4f16", // your local or CDN model identifier
  responseFormat: "stream",           // "stream" (default) or "json"
});
```

> **⚠️ Warning:** Loading large models in the browser can impact performance and memory so do select and test your choice of models carefully.

---

## 3. Configuration Options

| Option           | Type                                           | Required | Default     | Description                                                                                   |
| ---------------- | ---------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------- |
| `model`          | `string`                                       | ✅ always       | —           | The model name or path to load via MLC WebLLM (e.g. `Qwen2-0.5B-Instruct-q4f16_1-MLC`). You can find the list of models [**here**](https://huggingface.co/mlc-ai)                                                 |
| `systemMessage`  | `string`                                       | ❌        | `null` | Prepends a system prompt before user messages.                                                |
| `responseFormat` | `"stream"` \| `"json"`                         | ❌        | `"stream"`  | Determines whether to use stream endpoint from the provider or fetch a full JSON output.                                               |
| `engineConfig`   | `MLCEngineConfig`                              | ❌        | `{}` | Custom engine initialization options referenced from [**MLCEngineConfig**](https://webllm.mlc.ai/docs/user/api_reference.html#mlcengineconfig).                                  |
| `chatCompletionOptions`   | `GenerationConfig`                              | ❌        | `{}` | Custom chat completion options from referenced from [**GenerationConfig**](https://webllm.mlc.ai/docs/user/api_reference.html#generationconfig).                                  |
| `messageParser`         | `(msgs: Message[]) => CustomMessage[]` | ❌        | `null`                                                                                                                 | Custom parser converting React ChatBotify [`Message[]`](https://react-chatbotify.com/docs/concepts/conversations#message) into desired message format for the provider.                               |
| `debug`          | `boolean`                                      | ❌        | `false`     | Enables debug logging for the provider.                                                               |

---

## 4. Advanced Example

```ts
const webllm = new WebLlmProvider({
  model: "qwen2-0.5b-instruct-q4f16",
  systemMessage: "You are a helpful assistant in the browser.",
  responseFormat: "stream",
  engineConfig: {
    numThreads: 4,
    sampler: { topK: 40, topP: 0.95 },
  },
  chatCompletionOptions: { temperature: 0.7 },
  messageParser: (msgs) => msgs.map(m => ({ role: m.sender.toLowerCase(), content: String(m.content) })),
});
```

---

## 5. How It Works Under the Hood

1. **Constructor**: sets defaults such as model.
2. **`sendMessages()`**:
     * Invokes `engine.chat.completions.create()`.
     * If streaming, yields each chunk text content.
     * Otherwise yields the full text response.

---

*Check out other providers [here](../providers).*
