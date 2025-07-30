import { useCallback as O, useRef as w, useEffect as N } from "react";
import { useOnRcbEvent as C, RcbEvent as T, useFlow as G, useAudio as L, useMessages as z, usePaths as K, useTextArea as J, useChatWindow as H } from "react-chatbotify";
const Y = {
  autoConfig: !0
}, q = (i, e) => {
  const t = O(
    (o) => {
      const s = i()[o.data.nextPath];
      e(s);
    },
    [i, e]
  );
  C(T.CHANGE_PATH, t);
}, V = (i, e) => {
  const { outputTypeRef: t } = i, {
    toggleTextAreaDisabled: o,
    toggleIsBotTyping: r,
    focusTextArea: s,
    injectMessage: n,
    simulateStreamMessage: a,
    getIsChatBotVisible: c
  } = e, l = O(
    (d) => {
      var h;
      const u = d.data.block;
      u.llmConnector && (d.preventDefault(), d.type === "rcb-pre-process-block" && ((h = u.llmConnector) != null && h.initialMessage && (t.current === "full" ? n(i.initialMessageRef.current) : a(i.initialMessageRef.current)), r(!1), o(!1), setTimeout(() => {
        c() && s();
      })));
    },
    [r, o, s, c]
  );
  C(T.PRE_PROCESS_BLOCK, l), C(T.POST_PROCESS_BLOCK, l);
}, Q = async function* (i, e) {
  for await (const t of i)
    for (const o of t)
      yield o, await new Promise((r) => setTimeout(r, e));
}, X = async function* (i, e) {
  for await (const t of i)
    yield t, await new Promise((o) => setTimeout(o, e));
}, Z = async function* (i, e, t) {
  e === "character" ? yield* Q(i, t) : yield* X(i, t);
}, ee = async function* (i, e) {
  for await (const t of i)
    e(t), yield t;
}, te = async (i, e, t, o = {}) => {
  var b, y;
  if (!e.providerRef.current)
    return;
  const {
    speakAudio: r,
    toggleIsBotTyping: s,
    toggleTextAreaDisabled: n,
    focusTextArea: a,
    injectMessage: c,
    streamMessage: l,
    endStreamMessage: d,
    getIsChatBotVisible: u
  } = t, h = e.providerRef.current.sendMessages(i), g = e.outputTypeRef.current, f = e.outputSpeedRef.current;
  if (g === "full") {
    let p = "";
    for await (const m of h) {
      if ((b = o.signal) != null && b.aborted) break;
      p += m;
    }
    s(!1), c(p), setTimeout(() => {
      n(!1), u() && a();
    });
  } else {
    const p = Z(ee(h, r), g, f);
    let m = "", M = !1;
    for await (const E of p) {
      if ((y = o.signal) != null && y.aborted)
        break;
      M || (s(!1), M = !0), m += E, l(m);
    }
    d(), setTimeout(() => {
      n(!1), u() && a();
    });
  }
}, se = 500, oe = (i, e) => {
  const { messagesRef: t, outputTypeRef: o, onUserMessageRef: r, onKeyDownRef: s, errorMessageRef: n } = i, {
    injectMessage: a,
    simulateStreamMessage: c,
    toggleTextAreaDisabled: l,
    toggleIsBotTyping: d,
    goToPath: u,
    focusTextArea: h,
    getIsChatBotVisible: g
  } = e, f = w(null), b = O(
    (y) => {
      if (!i.providerRef.current)
        return;
      const p = y.data.message, m = p.sender.toUpperCase();
      p.tags = p.tags ?? [], p.tags.push(`rcb-llm-connector-plugin:${m}`), m === "USER" && (d(!0), l(!0), setTimeout(async () => {
        var v;
        if (r.current) {
          const R = await r.current(p);
          if (R)
            return (v = f.current) == null || v.abort(), f.current = null, u(R);
        }
        const M = i.historySizeRef.current, E = t.current, x = M ? [...E.slice(-(M - 1)), p] : [p], P = new AbortController();
        f.current = P, te(x, i, e, { signal: P.signal }).catch((R) => {
          d(!1), l(!1), setTimeout(() => {
            g() && h();
          }), console.error("LLM prompt failed", R), o.current === "full" ? a(n.current) : c(n.current);
        });
      }, se));
    },
    [i, e]
  );
  C(T.POST_INJECT_MESSAGE, b), C(T.STOP_SIMULATE_STREAM_MESSAGE, b), C(T.STOP_STREAM_MESSAGE, b), N(() => {
    const y = async (p) => {
      var m;
      if (s.current) {
        const M = await s.current(p);
        M && ((m = f.current) == null || m.abort(), f.current = null, u(M));
      }
    };
    return window.addEventListener("keydown", y), () => window.removeEventListener("keydown", y);
  }, []);
}, re = (i) => {
  const e = w([]), t = w(null), o = w("chunk"), r = w(30), s = w(0), n = w(""), a = w("Unable to get response, please try again."), c = w(null), l = w(null), { getFlow: d } = G(), { speakAudio: u } = L(), { messages: h, injectMessage: g, simulateStreamMessage: f, streamMessage: b, endStreamMessage: y } = z(), { goToPath: p } = K(), { toggleTextAreaDisabled: m, focusTextArea: M } = J(), { toggleIsBotTyping: E, getIsChatBotVisible: x } = H(), P = { ...Y, ...i ?? {} };
  N(() => {
    e.current = h;
  }, [h]), q(d, (S) => {
    var k, B, U, I, D, F, j, $, W, _;
    t.current = ((k = S.llmConnector) == null ? void 0 : k.provider) ?? null, o.current = ((B = S.llmConnector) == null ? void 0 : B.outputType) ?? "chunk", r.current = ((U = S.llmConnector) == null ? void 0 : U.outputSpeed) ?? 30, s.current = ((I = S.llmConnector) == null ? void 0 : I.historySize) ?? 0, n.current = ((D = S.llmConnector) == null ? void 0 : D.initialMessage) ?? "", a.current = ((F = S.llmConnector) == null ? void 0 : F.errorMessage) ?? "Unable to get response, please try again.", c.current = (($ = (j = S.llmConnector) == null ? void 0 : j.stopConditions) == null ? void 0 : $.onUserMessage) ?? null, l.current = ((_ = (W = S.llmConnector) == null ? void 0 : W.stopConditions) == null ? void 0 : _.onKeyDown) ?? null;
  });
  const v = {
    providerRef: t,
    messagesRef: e,
    outputTypeRef: o,
    outputSpeedRef: r,
    historySizeRef: s,
    initialMessageRef: n,
    errorMessageRef: a,
    onUserMessageRef: c,
    onKeyDownRef: l
  }, R = {
    speakAudio: u,
    injectMessage: g,
    simulateStreamMessage: f,
    streamMessage: b,
    endStreamMessage: y,
    toggleTextAreaDisabled: m,
    toggleIsBotTyping: E,
    focusTextArea: M,
    goToPath: p,
    getIsChatBotVisible: x
  };
  V(v, R), oe(v, R);
  const A = { name: "@rcb-plugins/llm-connector" };
  return P != null && P.autoConfig && (A.settings = {
    event: {
      rcbChangePath: !0,
      rcbPostInjectMessage: !0,
      rcbStopSimulateStreamMessage: !0,
      rcbStopStreamMessage: !0,
      rcbPreProcessBlock: !0,
      rcbPostProcessBlock: !0
    }
  }), A;
}, ie = (i) => () => re(i);
class ce {
  /**
   * Sets default values for the provider based on given configuration. Configuration guide here:
   * https://github.com/React-ChatBotify-Plugins/llm-connector/blob/main/docs/providers/Gemini.md
   *
   * @param config configuration for setup
   */
  constructor(e) {
    this.debug = !1, this.roleMap = (o) => {
      switch (o) {
        case "USER":
          return "user";
        default:
          return "model";
      }
    }, this.constructBodyWithMessages = (o) => {
      let r;
      return this.messageParser ? r = this.messageParser(o) : r = o.filter(
        (n) => typeof n.content == "string" && n.sender.toUpperCase() !== "SYSTEM"
      ).map((n) => {
        const a = this.roleMap(n.sender.toUpperCase()), c = n.content;
        return {
          role: a,
          parts: [{ text: c }]
        };
      }), this.systemMessage && (r = [{ role: "user", parts: [{ text: this.systemMessage }] }, ...r]), {
        contents: r,
        ...this.body
      };
    }, this.handleStreamResponse = async function* (o) {
      var n, a, c, l, d;
      const r = new TextDecoder("utf-8");
      let s = "";
      for (; ; ) {
        const { value: u, done: h } = await o.read();
        if (h) break;
        s += r.decode(u, { stream: !0 });
        const g = s.split(`
`);
        s = g.pop();
        for (const f of g) {
          const b = f.trim();
          if (!b.startsWith("data: ")) continue;
          const y = b.slice(6);
          try {
            const m = (d = (l = (c = (a = (n = JSON.parse(y).candidates) == null ? void 0 : n[0]) == null ? void 0 : a.content) == null ? void 0 : c.parts) == null ? void 0 : l[0]) == null ? void 0 : d.text;
            m && (yield m);
          } catch (p) {
            console.error("SSE JSON parse error:", y, p);
          }
        }
      }
    }, this.method = e.method ?? "POST", this.body = e.body ?? {}, this.systemMessage = e.systemMessage, this.responseFormat = e.responseFormat ?? "stream", this.messageParser = e.messageParser, this.debug = e.debug ?? !1, this.headers = {
      "Content-Type": "application/json",
      Accept: this.responseFormat === "stream" ? "text/event-stream" : "application/json",
      ...e.headers
    };
    const t = e.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";
    if (e.mode === "direct")
      this.endpoint = this.responseFormat === "stream" ? `${t}/models/${e.model}:streamGenerateContent?alt=sse&key=${e.apiKey || ""}` : `${t}/models/${e.model}:generateContent?key=${e.apiKey || ""}`;
    else if (e.mode === "proxy")
      this.endpoint = `${t}/${e.model}`;
    else
      throw Error("Invalid mode specified for Gemini provider ('direct' or 'proxy').");
  }
  /**
   * Calls Gemini and yields each chunk (or the full text).
   *
   * @param messages messages to include in the request
   */
  async *sendMessages(e) {
    var o, r, s, n, a;
    if (this.debug) {
      const c = this.endpoint.replace(/\?key=([^&]+)/, "?key=[REDACTED]"), l = { ...this.headers };
      console.log("[GeminiProvider] Request:", {
        method: this.method,
        endpoint: c,
        headers: l,
        body: this.constructBodyWithMessages(e)
      });
    }
    const t = await fetch(this.endpoint, {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.constructBodyWithMessages(e))
    });
    if (this.debug && console.log("[GeminiProvider] Response status:", t.status), !t.ok)
      throw new Error(`Gemini API error ${t.status}: ${await t.text()}`);
    if (this.responseFormat === "stream") {
      if (!t.body)
        throw new Error("Response body is empty – cannot stream");
      const c = t.body.getReader();
      for await (const l of this.handleStreamResponse(c))
        yield l;
    } else {
      const c = await t.json();
      this.debug && console.log("[GeminiProvider] Response body:", c);
      const l = (a = (n = (s = (r = (o = c.candidates) == null ? void 0 : o[0]) == null ? void 0 : r.content) == null ? void 0 : s.parts) == null ? void 0 : n[0]) == null ? void 0 : a.text;
      if (typeof l == "string")
        yield l;
      else
        throw new Error("Unexpected response shape – no text candidate");
    }
  }
}
class le {
  /**
   * Sets default values for the provider based on given configuration. Configuration guide here:
   * https://github.com/React-ChatBotify-Plugins/llm-connector/blob/main/docs/providers/OpenAI.md
   *
   * @param config configuration for setup
   */
  constructor(e) {
    if (this.debug = !1, this.roleMap = (t) => {
      switch (t) {
        case "USER":
          return "user";
        case "SYSTEM":
          return "system";
        default:
          return "assistant";
      }
    }, this.constructBodyWithMessages = (t) => {
      let o;
      return this.messageParser ? o = this.messageParser(t) : o = t.filter(
        (s) => typeof s.content == "string" && s.sender.toUpperCase() !== "SYSTEM"
      ).map((s) => {
        const n = this.roleMap(s.sender.toUpperCase()), a = s.content;
        return {
          role: n,
          content: a
        };
      }), this.systemMessage && (o = [{ role: "system", content: this.systemMessage }, ...o]), {
        messages: o,
        ...this.body
      };
    }, this.handleStreamResponse = async function* (t) {
      var s, n, a;
      const o = new TextDecoder("utf-8");
      let r = "";
      for (; ; ) {
        const { value: c, done: l } = await t.read();
        if (l) break;
        r += o.decode(c, { stream: !0 });
        const d = r.split(/\r?\n/);
        r = d.pop();
        for (const u of d) {
          if (!u.startsWith("data: ")) continue;
          const h = u.slice(6).trim();
          if (h === "[DONE]") return;
          try {
            const f = (a = (n = (s = JSON.parse(h).choices) == null ? void 0 : s[0]) == null ? void 0 : n.delta) == null ? void 0 : a.content;
            f && (yield f);
          } catch (g) {
            console.error("Stream parse error", g);
          }
        }
      }
    }, this.method = e.method ?? "POST", this.endpoint = e.baseUrl ?? "https://api.openai.com/v1/chat/completions", this.systemMessage = e.systemMessage, this.responseFormat = e.responseFormat ?? "stream", this.messageParser = e.messageParser, this.debug = e.debug ?? !1, this.headers = {
      "Content-Type": "application/json",
      Accept: this.responseFormat === "stream" ? "text/event-stream" : "application/json",
      ...e.headers
    }, this.body = {
      model: e.model,
      stream: this.responseFormat === "stream",
      ...e.body
    }, e.mode === "direct") {
      this.headers = { ...this.headers, Authorization: `Bearer ${e.apiKey}` };
      return;
    }
    if (e.mode !== "proxy")
      throw Error("Invalid mode specified for OpenAI provider ('direct' or 'proxy').");
  }
  /**
   * Calls Openai and yields each chunk (or the full text).
   *
   * @param messages messages to include in the request
   */
  async *sendMessages(e) {
    var o, r, s;
    if (this.debug) {
      const n = { ...this.headers };
      delete n.Authorization, console.log("[OpenaiProvider] Request:", {
        method: this.method,
        endpoint: this.endpoint,
        headers: n,
        body: this.constructBodyWithMessages(e)
      });
    }
    const t = await fetch(this.endpoint, {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.constructBodyWithMessages(e))
    });
    if (this.debug && console.log("[OpenaiProvider] Response status:", t.status), !t.ok)
      throw new Error(`Openai API error ${t.status}: ${await t.text()}`);
    if (this.responseFormat === "stream") {
      if (!t.body)
        throw new Error("Response body is empty – cannot stream");
      const n = t.body.getReader();
      for await (const a of this.handleStreamResponse(n))
        yield a;
    } else {
      const n = await t.json();
      this.debug && console.log("[OpenaiProvider] Response body:", n);
      const a = (s = (r = (o = n.choices) == null ? void 0 : o[0]) == null ? void 0 : r.message) == null ? void 0 : s.content;
      if (typeof a == "string")
        yield a;
      else
        throw new Error("Unexpected response shape – no text candidate");
    }
  }
}
class de {
  /**
   * Sets default values for the provider based on given configuration. Configuration guide here:
   * https://github.com/React-ChatBotify-Plugins/llm-connector/blob/main/docs/providers/WebLlm.md
   *
   * @param config configuration for setup
   */
  constructor(e) {
    this.debug = !1, this.roleMap = (t) => {
      switch (t) {
        case "USER":
          return "user";
        case "SYSTEM":
          return "system";
        default:
          return "assistant";
      }
    }, this.constructBodyWithMessages = (t) => {
      let o;
      return this.messageParser ? o = this.messageParser(t) : o = t.filter(
        (s) => typeof s.content == "string" && s.sender.toUpperCase() !== "SYSTEM"
      ).map((s) => {
        const n = this.roleMap(s.sender.toUpperCase()), a = s.content;
        return {
          role: n,
          content: a
        };
      }), this.systemMessage && (o = [
        {
          role: "system",
          content: this.systemMessage
        },
        ...o
      ]), {
        messages: o,
        stream: this.responseFormat === "stream",
        ...this.chatCompletionOptions
      };
    }, this.model = e.model, this.systemMessage = e.systemMessage, this.responseFormat = e.responseFormat ?? "stream", this.messageParser = e.messageParser, this.engineConfig = e.engineConfig ?? {}, this.chatCompletionOptions = e.chatCompletionOptions ?? {}, this.debug = e.debug ?? !1, this.createEngine();
  }
  /**
   * Creates MLC Engine for inferencing.
   */
  async createEngine() {
    const { CreateMLCEngine: e } = await import("@mlc-ai/web-llm");
    this.engine = await e(this.model, {
      ...this.engineConfig
    });
  }
  /**
   * Calls WebLlm and yields each chunk (or the full text).
   *
   * @param messages messages to include in the request
   */
  async *sendMessages(e) {
    var o, r, s, n, a, c;
    this.engine || await this.createEngine(), this.debug && console.log("[WebLlmProvider] Request:", {
      model: this.model,
      systemMessage: this.systemMessage,
      responseFormat: this.responseFormat,
      engineConfig: this.engineConfig,
      chatCompletionOptions: this.chatCompletionOptions,
      messages: this.constructBodyWithMessages(e).messages
      // Log messages being sent
    });
    const t = await ((o = this.engine) == null ? void 0 : o.chat.completions.create(this.constructBodyWithMessages(e)));
    if (this.debug && console.log("[WebLlmProvider] Response:", t), t && Symbol.asyncIterator in t)
      for await (const l of t) {
        const d = (s = (r = l.choices[0]) == null ? void 0 : r.delta) == null ? void 0 : s.content;
        d && (yield d);
      }
    else (c = (a = (n = t == null ? void 0 : t.choices) == null ? void 0 : n[0]) == null ? void 0 : a.message) != null && c.content && (yield t.choices[0].message.content);
  }
}
class he {
  constructor(e) {
    this.model = e.model, this.stream = e.stream ?? !0, this.debug = e.debug ?? !1, this.headers = {
      "Content-Type": "application/json",
      ...e.headers
    }, this.endpoint = e.baseUrl ?? "http://localhost:11434/api/generate";
  }
  async *sendMessages(e) {
    const t = e.filter((s) => typeof s.content == "string").map((s) => s.content).join(`
`), o = {
      model: this.model,
      prompt: t,
      stream: this.stream
    };
    this.debug && console.log("[OllamaProvider] Request:", {
      endpoint: this.endpoint,
      headers: this.headers,
      body: o
    });
    const r = await fetch(this.endpoint, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(o)
    });
    if (!r.ok)
      throw new Error(`Ollama API error ${r.status}: ${await r.text()}`);
    if (this.stream) {
      if (!r.body) throw new Error("No response body for streaming");
      const s = r.body.getReader(), n = new TextDecoder();
      let a = "";
      for (; ; ) {
        const { value: c, done: l } = await s.read();
        if (l) break;
        a += n.decode(c, { stream: !0 });
        const d = a.split(`
`);
        a = d.pop();
        for (const u of d)
          if (u.trim())
            try {
              const h = JSON.parse(u);
              h.response && (yield h.response);
            } catch (h) {
              this.debug && console.error("Ollama stream parse error:", u, h);
            }
      }
    } else {
      const s = await r.json();
      s.response && (yield s.response);
    }
  }
}
export {
  ce as GeminiProvider,
  he as OllamaProvider,
  le as OpenaiProvider,
  de as WebLlmProvider,
  ie as default
};
