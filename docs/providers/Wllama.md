# WllamaProvider Configuration Guide

The `WllamaProvider` runs LLM models in the browser using the Wllama WebAssembly runtime. It exposes the Wllama [**AssetsPathConfig**](https://github.ngxson.com/wllama/docs/interfaces/AssetsPathConfig.html), [**WllamaConfig**](https://github.ngxson.com/wllama/docs/interfaces/WllamaConfig.html), [**LoadModelConfig**](https://github.ngxson.com/wllama/docs/interfaces/LoadModelConfig.html) and [**ChatCompletionOptions**](https://github.ngxson.com/wllama/docs/interfaces/ChatCompletionOptions.html).

> **ℹ️ Info:**  
> This configuration guide assumes you have completed the setup for the `LlmConnector` plugin according to the guide [**here**](/README.md).

---

## 1. Install Dependency Package & Import Provider

```bash
npm install @wllama/wllama
```

```ts
import { WllamaProvider } from "@rcb-plugins/llm-connector";
```

Take note that for the `@wllama/wllama` package, you need to serve the `.wasm` files yourself (e.g. via [**/public**](https://github.com/React-ChatBotify-Plugins/llm-connnector/tree/main/public)).

---

## 2. Basic Instantiation

A minimal example for browser-based inference:

```ts
const wllama = new WllamaProvider({
  modelUrl: "https://huggingface.co/.../model.gguf", // required URL to .gguf model
});
```

> **⚠️ Warning:** Loading large models in the browser can impact performance and memory so do select and test your choice of models carefully.

---

## 3. Configuration Options

| Option                  | Type                                           | Required | Default                                                                                                                     | Description                                                                                                               |
| ----------------------- | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `modelUrl`              | `string`                                       | ✅ always       | —                                                                                                                           | URL or path to the GGUF model file to download and load (e.g. `https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/smollm2-360m-instruct-q8_0.gguf`).                                                                  |
| `systemMessage`         | `string`                                       | ❌        | `null`                                                                                                                 | Prepends a system prompt before user messages.                                                                            |
| `responseFormat`        | `"stream"` \| `"json"`                         | ❌        | `"stream"`                                                                                                                  | Determines whether to use stream endpoint from the provider or fetch a full JSON output.                                                     |
| `assetsPathConfig`      | `AssetsPathConfig`                             | ❌        | `{ 'single-thread/wllama.wasm': '/single-thread/wllama.wasm',<br>'multi-thread/wllama.wasm': '/multi-thread/wllama.wasm' }` | Paths to WLLama WASM binaries. See [**AssetsPathConfig docs**](https://github.ngxson.com/wllama/docs/interfaces/AssetsPathConfig.html)                                                                                           |
| `wllamaConfig`          | `WllamaConfig`                                 | ❌        | `{}`                                                                                                                        | WLLama runtime options (e.g. WebAssembly flags). See [**WllamaConfig docs**](https://github.ngxson.com/wllama/docs/interfaces/WllamaConfig.html). |
| `loadModelConfig`       | `LoadModelConfig`                              | ❌        | `{}`                                                                                                                        | Model loading options (e.g. chunk size). See [**LoadModelConfig docs**](https://github.ngxson.com/wllama/docs/interfaces/LoadModelConfig.html).      |
| `chatCompletionOptions` | `Record<string, unknown>`                      | ❌        | `{}`                                                                                                                        | Options passed to `createChatCompletion`, such as `stream`, `max_tokens`. See [**ChatCompletionOptions docs**](https://github.ngxson.com/wllama/docs/interfaces/ChatCompletionOptions.html).                                                 |
| `messageParser`         | `(msgs: Message[]) => CustomMessage[]` | ❌        | `null`                                                                                                                 | Custom parser converting React ChatBotify [`Message[]`](https://react-chatbotify.com/docs/concepts/conversations#message) into desired message format for the provider.                               |

---

## 4. Advanced Example

```ts
const wllama = new WllamaProvider({
  modelUrl: "https://huggingface.co/.../model.gguf",
  systemMessage: "You are a browser-based assistant.",
  responseFormat: "stream",
  assetsPathConfig: {
    'single-thread/wllama.wasm': '/libs/wllama/single-thread/wllama.wasm',
    'multi-thread/wllama.wasm': '/libs/wllama/multi-thread/wllama.wasm',
  },
  loadModelConfig: { n_ctx: 8192 },
  chatCompletionOptions: { temperature: 0.7 },
  messageParser: msgs => msgs.map(m => ({ role: m.sender.toLowerCase() as any, content: String(m.content) })),
});
```

---

## 5. How It Works Under the Hood

1. **Constructor**: sets defaults such as modelUrl.
2. **`sendMessages()`**:
     * Invokes `createChatCompletion()`.
     * If streaming, yields each chunk text content.
     * Otherwise yields the full text response.

---

*Check out other providers [here](../providers).*
