// Automated browser smoke test for the PRODUCTION bundle (dist/index.html).
// Proves: the page renders, styling is present, and BUTTON CLICKS WORK.
// Run:  npm run smoke   (needs dist/ built and the backend on :3001)
//
// Note: jsdom cannot run <script type="module">, so we convert the bundle to a
// classic script with esbuild first. The code executed is byte-identical logic.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { transformSync } from "esbuild";
import { JSDOM, VirtualConsole } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distHtml = path.join(__dirname, "..", "dist", "index.html");
const API = "http://localhost:3001";

const failures = [];
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "  PASS" : "  FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failures.push(name);
};

if (!fs.existsSync(distHtml)) {
  console.error("dist/index.html missing — run `npm run build` first.");
  process.exit(1);
}

// Convert every inline module script to a classic script placed at the end of
// <body>. Browsers defer type="module" until after parsing; jsdom ignores
// `defer`, so moving the code reproduces real browser timing.
let html = fs.readFileSync(distHtml, "utf8");
let converted = 0;
const classic = [];
html = html.replace(/<script type="module"[^>]*>([\s\S]*?)<\/script>/g, (m, code) => {
  converted += 1;
  classic.push(transformSync(code, { format: "iife", target: "es2020" }).code);
  return "<!--smoke: module moved to end of body-->";
});
html = html.replace("</body>", `<script>${classic.join("\n;\n")}</script></body>`);
console.log(`converted ${converted} module script(s) for the test harness`);

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (e) => errors.push(`jsdom: ${e.message}`));
virtualConsole.on("error", (...a) => errors.push(`console.error: ${a.join(" ")}`));

const dom = new JSDOM(html, {
  url: "http://localhost:5173/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    // jsdom has no IntersectionObserver — treat everything as visible.
    window.IntersectionObserver = class {
      constructor(cb) {
        this.cb = cb;
      }
      observe(el) {
        this.cb([{ isIntersecting: true, target: el }], this);
      }
      unobserve() {}
      disconnect() {}
    };
    // Route relative /api calls to the real backend under test.
    const nativeFetch = globalThis.fetch;
    window.fetch = (input, init) => {
      if (typeof input === "string" && input.startsWith("/api")) input = API + input;
      return nativeFetch(input, init);
    };
  },
});

const { window } = dom;
const { document } = window;
const tick = (ms = 50) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, timeoutMs = 8000) {
  const start = Date.now();
  for (;;) {
    try {
      const v = fn();
      if (v) return v;
    } catch {
      /* keep waiting */
    }
    if (Date.now() - start > timeoutMs) return null;
    await tick(100);
  }
}

// React 18/19 flushes async — give the app time to mount.
await waitFor(() => document.getElementById("root")?.childElementCount > 0);

const rootText = document.getElementById("root")?.textContent ?? "";
check("app renders into #root", rootText.length > 500, `${rootText.length} chars`);
check("brand visible", rootText.includes("Acacia House"));
check("design inlined (<style>)", !!document.querySelector("style"));

// --- CLICK TEST 1: expand the full menu ---
const expandBtn = [...document.querySelectorAll("button")].find((b) =>
  b.textContent.includes("View Full Menu")
);
check("found 'View Full Menu' button", !!expandBtn);
if (expandBtn) {
  expandBtn.click();
  const extra = await waitFor(() => document.body.textContent.includes("Masala Chips"), 4000);
  check("clicking expands menu (Masala Chips appears)", !!extra);
}

// --- CLICK TEST 2: open a dish photo popup ---
const viewBtn = document.querySelector('button[aria-label^="View photo of"]');
check("found a dish 'View' button", !!viewBtn);
if (viewBtn) {
  const before = document.body.innerHTML.length;
  viewBtn.click();
  await tick(400);
  const after = document.body.innerHTML.length;
  check("clicking dish View changes the page (popup opens)", after > before + 200, `+${after - before} chars`);
}

// --- FORM TEST: submit a real reservation through the backend ---
const nameInput = document.getElementById("r-name");
const phoneInput = document.getElementById("r-phone");
const dateInput = document.getElementById("r-date");
check("reservation form present", !!(nameInput && phoneInput && dateInput));
if (nameInput && phoneInput && dateInput) {
  // React-controlled inputs: use the native setter so React sees the change.
  const setNative = (el, value) => {
    const proto =
      el instanceof window.HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
    el.dispatchEvent(new window.Event("input", { bubbles: true }));
  };
  const future = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  setNative(nameInput, "Smoke Test");
  setNative(phoneInput, "0712345678");
  setNative(dateInput, future);
  await tick(200);
  const form = dateInput.closest("form");
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  const ref = await waitFor(() => {
    const m = document.body.textContent.match(/AH-[A-Z0-9]{6}/);
    return m ? m[0] : null;
  }, 12000);
  check("reservation submits to backend, ref shown", !!ref, ref || "no ref appeared");
}

check("no JS errors during test", errors.length === 0, errors.slice(0, 3).join(" | "));

dom.window.close();
if (failures.length > 0) {
  console.log(`\nSMOKE: ${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("\nSMOKE: all checks passed — the built site renders and clicks work.");
