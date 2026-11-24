// Evaluates the bundled card source (test/source.mjs) (a classic script, bundled as is by scripts/build.mjs) in a sandbox with minimal DOM
// stand-ins and a clock fixed at the mocks' NOW, and returns the top-level names the tests ask for and the custom
// elements it defined. No dependency, no browser.
// The mocks are written in UTC, as the captures are rendered: the tests run in UTC whatever the machine's time zone.
process.env.TZ = "UTC";

import vm from "node:vm";
import { NOW } from "../scripts/mock-states.mjs";
import { source } from "./source.mjs";


// Shadow root stand-in: keeps the HTML it is given and the listeners it gets.
const fakeRoot = () => ({
  innerHTML: "",
  listeners: {},
  addEventListener(type, fn) {
    (this.listeners[type] ||= []).push(fn);
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
});

const fakeNode = (tag) => ({
  tagName: String(tag).toUpperCase(),
  style: {},
  dataset: {},
  children: [],
  appendChild(c) {
    this.children.push(c);
    return c;
  },
  addEventListener() {},
});

export const load = ({ now = NOW, names = [] } = {}) => {
  const registry = new Map();
  class HTMLElement {
    attachShadow() {
      this.shadowRoot = fakeRoot();
      return this.shadowRoot;
    }
    dispatchEvent(ev) {
      (this.events ||= []).push(ev);
    }
    appendChild(c) {
      (this.children ||= []).push(c);
      return c;
    }
    toggleAttribute(name, on) {
      (this.attrs ||= {})[name] = !!on;
    }
    get isConnected() {
      return !!this._connected;
    }
  }
  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }
  // Date whose "now" is fixed (new Date() and Date.now()); everything else is the real Date.
  class FixedDate extends Date {
    constructor(...a) {
      super(...(a.length ? a : [now]));
    }
    static now() {
      return now;
    }
  }
  const sandbox = {
    HTMLElement,
    CustomEvent,
    Intl,
    Date: FixedDate,
    console: { info() {}, warn() {} },
    customElements: { get: (t) => registry.get(t), define: (t, c) => registry.set(t, c) },
    document: {
      createElement: (t) => (registry.has(t) ? new (registry.get(t))() : fakeNode(t)),
      addEventListener() {},
      removeEventListener() {},
    },
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval() {},
    addEventListener() {},
    removeEventListener() {},
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const out = vm.runInContext(`${source}\n({ ${names.join(", ")} })`, sandbox);
  out.element = (tag) => registry.get(tag);
  out.window = sandbox;
  return out;
};
