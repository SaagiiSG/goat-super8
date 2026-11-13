# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["pillow>=10.4", "numpy>=1.26"]
# ///
"""Super 8 Home Movie · Хуучин хальс.

Warm, faded, grainy footage that stutters at 18 frames a second inside a small upright 3:4 box on black,
with gate weave, over-bright frames at the cuts, an orange light leak and a handwritten label above the box.
Usage: uv run render.py plan.json
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import goatcut as g  # noqa: E402
from PIL import Image, ImageChops, ImageDraw  # noqa: E402

NAME = "super8"
BX, BY, BW, BH = 135, 420, 810, 1080  # the 3:4 film box on the black screen
M = 10                                 # clips come in 10 px bigger on each side so the weave never shows an edge
FIT_SIZE = (BW + 2 * M, BH + 2 * M)
FILM_FPS = 18
GRADE = (f"fps={FILM_FPS},gblur=sigma=1.2,"
         "curves=r='0/0.08 0.5/0.56 1/0.97':g='0/0.06 0.5/0.50 1/0.92':b='0/0.06 0.5/0.42 1/0.80',"
         "eq=saturation=0.8,vignette=PI/4,fps=30")
CREAM = (255, 246, 232)                # over-bright frames at cuts and the flare at the end
FLASH = (0.85, 0.7, 0.45)              # strength of the 3 over-bright frames at a cut
GRAIN_N, GRAIN_PAD, GRAIN_AMP = 9, 48, 0.3
LABEL = (239, 227, 207, 255)
MUTED = (142, 133, 122, 255)
CAVEAT, MONO, DSEG = "Caveat[wght].ttf", "PTM55FT.ttf", "DSEG7Classic-Bold.ttf"
FOOT_Y = BY + BH + 72                  # baseline of the place line and frame counter under the box


def setup(ctx):
    for key, default in (("leak", True), ("counter", False)):
        if not isinstance(ctx.opt(key, default), bool):
            g.die(f"look.{key} must be true or false")
    ctx.grain = [grain_tile(ctx) for _ in range(GRAIN_N)]
    ctx.leak = leak_image()
    ctx.cream = Image.new("RGB", (BW, BH), CREAM)
    ctx.black = Image.new("RGBA", (g.W, g.H), (0, 0, 0, 255))
    # at most 3 flashes a second: a cut less than 1/3 s after the last flash gets none
    ctx.flashes, last = [], -1.0
    for c in ctx.cuts:
        if c - last >= 0.34:
            ctx.flashes.append(c)
            last = c
    ctx.leaks = [(c, ctx.rng.uniform(0.55, 0.85)) for c in (ctx.cuts[1::2] or [ctx.dur / 2])]


def SFX(ctx):
    # the projector rattles for the whole reel
    return [{"sound": "projector", "at": 0, "dur": ctx.dur}]


def grain_tile(ctx):
    """Coarse grain: noise made at half size and scaled up, so app re-compression doesn't smear it away."""
    w, h = (BW + GRAIN_PAD) // 2, (BH + GRAIN_PAD) // 2
    n = Image.frombytes("L", (w, h), ctx.rng.randbytes(w * h))
    n = n.point(lambda v: int(128 + (v - 128) * GRAIN_AMP)).resize((w * 2, h * 2), Image.BILINEAR)
    return Image.merge("RGB", (n, n, n))


def leak_image():
    """Orange glow fogging the film from the top-right corner, painted in code (premultiplied, for screen)."""
    w, h = BW // 10, BH // 10
    cx, cy = 0.85 * w, 0.15 * h
    r = 0.62 * math.hypot(cx, h - cy)
    px = []
    for y in range(h):
        for x in range(w):
            f = 0.9 * g.clamp(1 - math.hypot(x - cx, y - cy) / r)
            px.append((int(255 * f), int(128 * f), int(40 * f)))
    img = Image.new("RGB", (w, h))
    img.putdata(px)
    return img.resize((BW, BH), Image.BILINEAR)


def film_frame(ctx, k):
    """Per film frame (18 a second): gate weave offset, grain tile and position, brightness flicker."""
    r = ctx.rng
    dx = round(3 * math.sin(2 * math.pi * 0.8 * k / FILM_FPS) + r.uniform(-2, 2))
    dy = round(r.uniform(-1.5, 1.5))
    return dx, dy, r.randrange(GRAIN_N), r.randrange(GRAIN_PAD), r.randrange(GRAIN_PAD), round(r.uniform(-4, 4))


def label_sprite(ctx, text):
    f = ctx.fit(text, CAVEAT, BW - 30, 84, axes={"wght": 700})
    return g.text_sprite(text, f, fill=LABEL).rotate(2, Image.BICUBIC, expand=True)


def place_sprite(ctx, text):
    f = ctx.fit(text, MONO, BW - (220 if ctx.opt("counter", False) else 0), 34, tracking=0.2)
    return g.text_sprite(text, f, fill=MUTED, tracking=0.2)


def frame(img, t, ctx):
    k = int(t * FILM_FPS + 1e-6)
    dx, dy, gi, gx, gy, flick = ctx.cache(("film", k), lambda: film_frame(ctx, k))
    box = img.crop((M + dx, M + dy, M + dx + BW, M + dy + BH))
    box = ImageChops.add(box, ctx.grain[gi].crop((gx, gy, gx + BW, gy + BH)), 1.0, flick - 128)

    if ctx.opt("leak", True):
        for c, peak in ctx.leaks:
            a = peak * min(g.clamp((t - c + 0.65) / 0.5), g.clamp((c + 0.2 - t) / 0.35))
            if a > 0.02:
                q = round(a * 20) / 20
                box = ImageChops.screen(box, ctx.cache(("leak", q), lambda: ctx.leak.point(lambda v: int(v * q))))
    for c in ctx.flashes:
        n = round((t - c) * g.FPS)
        if 0 <= n < len(FLASH):
            box = Image.blend(box, ctx.cream, FLASH[n])
    end = g.clamp((t - ctx.dur + 0.6) / 0.6) ** 2  # the reel runs out: flare to white
    if end > 0:
        box = Image.blend(box, ctx.cream, end)

    canvas = ctx.black.copy()
    canvas.paste(box, (BX, BY))
    for item in ctx.active(t, "label")[-1:]:
        s = ctx.cache(("label", item["text"]), lambda: label_sprite(ctx, item["text"]))
        g.paste(canvas, s, BX, BY - 22, g.fade(t, item, 0.3, 0.3), anchor="lb")
    for item in ctx.active(t, "place")[-1:]:
        s = ctx.cache(("place", item["text"]), lambda: place_sprite(ctx, item["text"]))
        g.paste(canvas, s, BX, FOOT_Y, g.fade(t, item, 0.3, 0.3), anchor="lb")
    if ctx.opt("counter", False):
        ImageDraw.Draw(canvas).text((BX + BW, FOOT_Y), f"{k:04d}", font=ctx.font(DSEG, 30), fill=MUTED, anchor="rs")
    return canvas


if __name__ == "__main__":
    g.run(sys.modules[__name__])
