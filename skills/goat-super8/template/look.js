// 01 Super 8. Reads window.PLAN (goat.mjs writes it; look.mjs works out every film frame, flash and leak)
// and builds one paused GSAP timeline.
const P = window.PLAN;
const $ = (s) => document.querySelector(s);
const tl = gsap.timeline({ paused: true });
const FIRST = 1 / 30, F = 1 / 30;
const at = (t) => Math.max(0, t - 0.001); // frame-exact events land on their frame, not one late

// Gate weave and flicker, and the counter, change with every projected film frame (18 a second).
const counter = $("#counter");
counter.hidden = !P.look.counter;
for (const f of P.film) {
  tl.set("#weave", { x: f.x, y: f.y, filter: `brightness(${f.b})` }, at(f.t));
  if (P.look.counter) {
    const [a, b, c, d] = String(f.k % 10000).padStart(4, "0");
    tl.set(counter, { attr: { "data-a": a, "data-b": b, "data-c": c, "data-d": d } }, at(f.t));
  }
}

// The orange leak builds up for 0.5 s, peaks on the cut (under its flash: one pulse) and fades over 0.35 s.
for (const l of P.leaks) {
  tl.fromTo("#leak", { opacity: 0 }, { opacity: l.peak, duration: 0.5, ease: "sine.in", immediateRender: false }, l.at - 0.5);
  tl.fromTo("#leak", { opacity: l.peak }, { opacity: 0, duration: 0.35, ease: "sine.out", immediateRender: false }, l.at);
}

// 3 over-bright cream frames at a cut: one flash, at most 3 a second (look.mjs spaces them 1/3 s apart).
for (const c of P.flashes) [0.85, 0.7, 0.45, 0].forEach((o, i) => tl.set("#cream", { opacity: o }, at(c + i * F)));

// The reel runs out: the picture flares to cream over the last 0.6 s.
tl.fromTo("#flare", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.in", immediateRender: false }, Math.max(FIRST, P.dur - 0.6));

// Label above the box, place line under it. One of each at a time: a later one ends the one before.
const texts = [];
for (const role of ["label", "place"]) {
  const list = P.texts.filter((t) => t.role === role).sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  list.forEach((t, i) => {
    const start = t.start ?? 0, end = Math.min(t.end ?? P.dur, list[i + 1]?.start ?? P.dur);
    const el = $("#texts").appendChild(document.createElement("div"));
    el.className = role;
    for (const row of String(t.text).split("\n")) el.appendChild(document.createElement("div")).textContent = row.trim();
    if (role === "label") gsap.set(el, { rotation: -2, transformOrigin: "0% 100%" });
    if (start >= FIRST) {
      gsap.set(el, { opacity: 0 });
      tl.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, start);
    }
    if (end < P.dur - 0.01) tl.to(el, { opacity: 0, duration: 0.3, ease: "power1.in" }, Math.max(start, end - 0.3));
    texts.push({ el, role, rows: el.children.length });
  });
}

tl.set({}, {}, P.dur);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;

// Sizes need the real fonts; the renderer waits for document.fonts.ready before the first frame.
// Label: Caveat reaches 0.87 em above the baseline (Й) and 0.315 em below (з); its lowest point sits
// 10 px above the box and the −2° tilt lifts the right end by up to 27 px, so one row at 92 px or two
// at 52 px stay under the safe line at y 270. validate caps a row at 32 letters (fits 780 px at 56 px);
// only a row of wide capitals goes smaller. Place: its first baseline lines up with the counter at y 1573.
function layout() {
  for (const t of texts) {
    if (t.role === "label") {
      const s = GOAT.fit(t.el, 780, t.rows > 1 ? 52 : 92, 40);
      const lastBase = 410 - 0.315 * s;
      t.el.style.top = `${lastBase - ((t.rows - 1) * 0.95 + 0.805) * s}px`;
    } else {
      const s = GOAT.fit(t.el, P.look.counter ? 670 : 810, 36, 28);
      t.el.style.top = `${1573 - 0.925 * s}px`;
    }
  }
}
layout();
document.fonts.ready.then(layout);
