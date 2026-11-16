// 01 Super 8 Home Movie: the clips stutter at 18 frames a second inside a small upright 3:4 box on black,
// warm and faded with coarse grain, gate weave, flicker, cream frames at the cuts, an orange light leak
// before every second cut and a flare to cream at the end. A handwritten label sits above the box,
// a typewriter place-and-year line (and an optional frame counter) under it.
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { missing } from "./scripts/fonts.mjs";
await import("./scripts/goat-lib.js"); // GOAT.rng and GOAT.spaced, the same ones the template uses

export const NAME = "super8";
export const TALKS = false;
// The box is 810x1080 at (135, 420); clips come 10 px bigger on each side so the ±4 px weave never shows an edge.
export const FIT = [830, 1100];

const SKILL_DIR = dirname(fileURLToPath(import.meta.url));
const FONTS = { label: ["Caveat[wght].ttf", "Caveat"], place: ["PTM55FT.ttf", "PT Mono"] };
const DSEG = "DSEG7Classic-Bold.ttf";
const GRADE = "fps=18,gblur=sigma=1.2," +
  "curves=r='0/0.08 0.5/0.56 1/0.97':g='0/0.06 0.5/0.50 1/0.92':b='0/0.06 0.5/0.42 1/0.80'," +
  "eq=saturation=0.8,vignette=PI/4";
// Longest row that fits at the smallest size. Label: 780 px at Caveat 700 56 px, mixed Mongolian runs
// 0.39–0.43 em a letter. Place: PT Mono is 0.6 em a letter + 0.2 em tracking, at 28 px in 810 px, or in
// 670 px when the counter takes the right end.
const ROW = { label: 32, place: 36, placeCounter: 29 };
const ROWS = 2;
const EPS = 1e-9;
const FLARE = 0.6; // the end flare to cream (template/look.js), a bright pulse of its own

const isNum = (n) => typeof n === "number" && Number.isFinite(n);

export function validate(plan) {
  const look = plan.look ?? {};
  for (const k of ["leak", "counter"])
    if (look[k] !== undefined && typeof look[k] !== "boolean") throw new Error(`look "${k}" must be true or false`);
  for (const t of plan.texts ?? []) {
    if (!FONTS[t.role]) throw new Error(`text role "${t.role}" is not used by this look. Use "label" or "place".`);
    const text = String(t.text ?? "");
    if (!text.trim()) throw new Error(`a "${t.role}" text is empty`);
    if (t.start !== undefined && !(isNum(t.start) && t.start >= 0)) throw new Error(`"${text}": "start" must be seconds, 0 or more`);
    if (t.end !== undefined && !(isNum(t.end) && t.end > Number(t.start ?? 0))) throw new Error(`"${text}" must end after it starts`);
    const rows = text.split("\n");
    if (rows.length > ROWS) throw new Error(`"${text}" has ${rows.length} rows: a ${t.role} takes ${ROWS} rows at most`);
    const max = t.role === "place" && look.counter ? ROW.placeCounter : ROW[t.role];
    for (const row of rows)
      if ([...row.trim()].length > max)
        throw new Error(`"${row.trim()}" is too long for one ${t.role} row (${max} characters at most): ` +
          "shorten it, or split it into 2 rows with \\n");
    const [file, name] = FONTS[t.role];
    const bad = missing(text, join(SKILL_DIR, "fonts", file));
    if (bad.length) throw new Error(`"${text}" uses ${bad.join(" ")}, which ${name} can't draw`);
  }
  if (look.counter && missing("0123456789", join(SKILL_DIR, "fonts", DSEG)).length)
    throw new Error(`${DSEG} can't draw the counter's digits: reinstall the skill`);
}

// The v1 grade (warm faded curves, soft blur, saturation 0.8, vignette) at 18 fps, plus grain made at half
// size and scaled up, so it reads as film grain and survives the app's re-compression. Labels carry the
// clip's index: every clip's chain sits in one filter graph.
export async function clipFilter(clip) {
  const i = clip.index, a = `s8a${i}`, b = `s8b${i}`, n = `s8n${i}`;
  return `${GRADE},format=yuv444p,split[${a}][${b}];` +
    `[${b}]scale=415:550,lutyuv=y=128:u=128:v=128,noise=c0s=48:c0f=t+u:all_seed=${4271 + i * 31},` +
    `scale=830:1100:flags=bicubic[${n}];[${a}][${n}]blend=all_mode=overlay,` +
    // fps=18 can end a frame short; the clone pad lets prep's trim cut every clip to its exact length
    "fps=30,tpad=stop_mode=clone:stop_duration=0.1";
}

// Cuts after the first frame (cuts[0] is the video's start).
const real = (cuts) => cuts.filter((c) => c > EPS);

// 3 cream frames at a cut (0.85, 0.7, 0.45): one flash, one bright pulse however many frames it fades over.
// At most 3 a second (seizure safety, WCAG 2.3.1): a cut less than 1/3 s after the last flash gets none,
// so two flashes never overlap. The end flare counts as a pulse: no flash within 1/3 s before it starts.
export function flashTimes(cuts, dur) {
  return GOAT.spaced(real(cuts), 1 / 3).filter((t) => t <= dur - FLARE - 1 / 3 + EPS);
}

// The orange leak builds up over the 0.5 s before every second cut and fades over 0.35 s after it. It peaks
// on the cut, under that cut's flash, so glow and flash are one pulse; a cut that lost its flash gets no leak,
// or the leak would be a second pulse within 1/3 s of the last flash. Leaks are kept 0.9 s apart so two never
// overlap; none starts before frame 0 (the thumbnail) or is still fading when the end flare starts.
// One clip (no cuts, no flashes): halfway through.
export function leaks(cuts, dur, on = true) {
  if (!on) return [];
  const r = GOAT.rng(811), flashes = flashTimes(cuts, dur);
  const at = real(cuts).filter((t, i) => i % 2 === 0 && flashes.includes(t));
  return GOAT.spaced((real(cuts).length ? at : [dur / 2]).filter((t) => t >= 0.5 && t + 0.35 <= dur - FLARE + EPS), 0.9)
    .map((t) => ({ at: t, peak: Math.round((0.55 + 0.3 * r()) * 100) / 100 }));
}

// Every moment the projected picture changes: ffmpeg's fps=18,fps=30 shows a clip's film frame j from its
// output frame round(j·5/3). Each gets a gate-weave offset (integer px, ±4), a flicker (±4%) and the
// counter's frame number k.
export function filmFrames(cuts, dur) {
  const r = GOAT.rng(1878), u = () => r() * 2 - 1, out = [];
  const clamp = (x) => Math.max(-4, Math.min(4, x));
  cuts.forEach((s, i) => {
    const e = cuts[i + 1] ?? dur;
    for (let j = 0, t = s; t < e - EPS; t = s + Math.round((++j * 5) / 3) / 30) {
      const k = out.length;
      out.push({ t, k, x: clamp(Math.round(2.5 * Math.sin((2 * Math.PI * 0.8 * k) / 18) + 1.5 * u())),
        y: clamp(Math.round(2.4 * u())), b: Math.round((1 + 0.04 * u()) * 1000) / 1000 });
    }
  });
  return out;
}

export async function prepare(ctx) {
  const cuts = ctx.cuts.length ? ctx.cuts : [0];
  return { film: filmFrames(cuts, ctx.dur), flashes: flashTimes(cuts, ctx.dur), leaks: leaks(cuts, ctx.dur, ctx.plan.look?.leak !== false) };
}

// About 30% of v1's 1.0 (Saagii, 16 Nov: "bring the sounds effects down a bit"); members raise it with "sfx": {"volume": …}.
export function sfx(plan, ctx) {
  return [{ sound: "projector", at: 0, dur: ctx.dur, volume: 0.3 }];
}
