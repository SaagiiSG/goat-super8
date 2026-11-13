---
name: goat-super8
description: Super 8 Home Movie · Хуучин хальс. Edits the user's phone clips into a 1970s home movie inside a small upright box on a black 9:16 screen. Warm faded colour, coarse moving grain, a real 18-frames-a-second stutter, gate weave, over-bright frames at the cuts, an orange light leak and a handwritten Mongolian label above the box. Renders a 1080x1920 MP4 for Reels/TikTok. Best for bridal hair and makeup, salon "our story" reels, coaches' story reels and family shops. Use whenever the user wants an old film, retro, vintage, nostalgic, home-movie or "хуучин кино шиг" edit, or types /goat-super8, /хальс, or says "хуучин хальсан кино шиг болгоод өг", "ретро видео хий", "make it look like Super 8", "vintage film look", even if they don't name the skill.
---

# Super 8 Home Movie · Хуучин хальс

A warm, faded, grainy clip that stutters at 18 frames a second inside a small upright 3:4 box with black all around it, like a family film from the 1970s. A handwritten label sits in the black above the box. It is the only GOAT look where the picture shrinks into a box and visibly stutters.

**Good for:** bridal hair and makeup, salon "our story" reels, coaches' story reels, family shops, behind-the-scenes moments.
**Not for:** nail-shade and hair-colour reveals (the warm grade shifts the true colour), product detail shots (it is soft and the box is small), real estate, car specs. If the user's footage is one of these, say so and suggest another GOAT look.

Talk to the user in the language they write in (usually Mongolian). Keep messages short and plain; many users are not technical. `SKILL_DIR` means this skill's base directory (shown when the skill loads). Run commands from the user's project folder with absolute paths into `SKILL_DIR`.

## 1. Setup check (first time on a machine)

Run `ffmpeg -version` and `uv --version`. If either is missing, show the install command and ask before installing (it is their computer):
- Mac: `brew install ffmpeg uv`
- Windows: `winget install Gyan.FFmpeg` and `winget install astral-sh.uv`, then close and reopen the terminal.

The first render downloads a small Python package (Pillow) once. After that it is instant.

## 2. Collect the clips and words

Make `raw/` and `output/` in the current folder. Ask for:
1. **The clips.** Drag them into the chat or copy them into `raw/`. Many short handheld moments work best: people moving, natural light, laughing, hands at work. Photos work too.
2. **The words:** a short handwritten label (2–4 words, e.g. "Манай салон") and, if they want, a place-and-year line (e.g. "УЛААНБААТАР · 2026"). Never invent a date or place. Ask.

If this folder was already edited with `goat-video-editor`, use `output/cut.mp4` as the clip and `transcript/cut_words.json` for word times.

Then run: `uv run SKILL_DIR/scripts/goatcut.py probe raw/*`
It prints each file's size, length, whether it has sound, whether it is HDR, and `speech` spans (when someone is talking). Use these to pick shots and time the words.

## 3. Write plan.json

Write `plan.json` in the project folder. Paths are relative to it.

```json
{
  "output": "output/super8.mp4",
  "clips": [
    {"src": "raw/IMG_0412.MOV", "in": 1.2, "out": 2.4},
    {"src": "raw/IMG_0415.MOV", "in": 0.0, "out": 0.9, "cy": 0.35},
    {"src": "raw/bride.jpg", "dur": 1.2}
  ],
  "texts": [
    {"role": "label", "text": "Манай салон", "start": 0.3, "end": 4.5},
    {"role": "place", "text": "УЛААНБААТАР · 2026", "start": 0.6, "end": 9.0}
  ],
  "music": {"src": "raw/song.mp3", "volume": 0.25},
  "look": {"leak": true, "counter": false}
}
```

**clips** play in order. `in`/`out` trim a video (seconds); `dur` sets how long a photo shows. `cx`/`cy` (0–1, default 0.5) choose which part of the frame the box keeps: `cy: 0.3` keeps the upper part (faces), `cy: 0.7` the lower part. The box is 3:4, so the top and bottom of an upright phone clip are cut off. Add `"sound": false` to mute one clip.
**texts:**
- `label`: handwritten (Caveat Bold, cream), slightly tilted, in the black above the box. One short line. Long words shrink to fit.
- `place`: small spaced-out typewriter capitals (PT Mono, grey) under the box, for a place and year. It is decoration: app buttons may cover it, so never put a price or phone number here. PT Mono has no ₮ sign.
Only one of each shows at a time.
**Auto sound effects:** a quiet Super 8 projector rattle (18 clicks a second over a low hum) under the whole reel.
**look** options:
- `leak`: `true` (default) adds an orange light leak that flares up just before every second cut. `false` turns it off.
- `counter`: `false` (default). `true` shows a running film-frame counter in small grey 7-segment digits under the box, bottom-right.

**Timing:** keep shots short, 0.5–1.5 s each; many quick moments read as a real home movie. Every cut gets 3 over-bright frames (never more than 3 flashes a second; very fast cuts skip theirs). The last 0.6 s flares out to white like the end of a reel, so end on a moment that can fade.

Before rendering, tell the user the plan in plain words (shot list + the words) and ask "OK?". This is the only approval needed.

<!-- audio: this section is copied from core/skill-audio.md by build.py; edit it there -->
## Sound effects, voice-over and music

**Sound effects are on by default.** The look adds its own (see "Auto sound effects" above). They are made in code, so there's nothing to license, and they sit quietly under the voice.
- Turn them off: `"sfx": false`. Make them quieter or louder: `"sfx": {"volume": 0.6}`.
- Add one: `"sfx": {"add": [{"sound": "ding", "at": 4.2}]}`. Sounds: whoosh, swish, pop, click, type, shutter, boom, thud, hit, riser, ding, notify, shimmer, paper, tape, marker, projector, tick. `type`, `marker`, `projector` and `riser` also take `"dur"` in seconds; a riser should end on the moment it builds to.
- Let the user hear one render before adding more. Too many sounds feel cheap.

**Voice-over.** If the user wants to talk over the video, ask them to record it on their phone (a voice memo is fine: m4a, mp3 or wav) and copy it into `raw/`. Then add `"voiceover": {"src": "raw/vo.m4a", "at": 0.5}` (`at` = when it starts; optional `"volume"`). While the voice plays, the clips' own sound and the music dip automatically. Run `goatcut.py probe raw/vo.m4a` to get its `speech` spans and time the words on screen to them. The clips must add up to at least the voice-over's length (the render warns if not). Recording tips for the user: a small quiet room (a parked car or a wardrobe works), phone about 20 cm from the mouth, read the script out loud once before recording.

**Music.** `"music": {"src": "raw/song.mp3", "volume": 0.25}`. Only use music the user has the rights to. Music added inside the Instagram/TikTok app is the safe choice, so suggest that first.
<!-- /audio -->

## 4. Render and check

`uv run SKILL_DIR/scripts/render.py plan.json`

A 30 s video takes about 40 s. Then look at three frames before saying it is done:
`ffmpeg -y -loglevel error -ss 2 -i output/super8.mp4 -frames:v 1 output/check-1.jpg` (and two more times). Read them. Check that the label is not cut off, faces are inside the box (fix with `cy`), and nothing important is too dark.

If a render fails twice, stop and explain the error in plain words. Don't loop.

## 5. Hand over

Tell the user where the file is (`output/super8.mp4`) and that it is ready to post. Captions and music can be added in the Instagram/TikTok app.

## Rules

- The label sits in the black band above the box, inside the area no app buttons cover. Never put a price or phone number in the black band below the box: the app's caption area covers it.
- Use only the fonts bundled in `SKILL_DIR/fonts` (Caveat and PT Mono have Ө ө Ү ү; DSEG7 is digits only). Don't swap in other fonts.
- Don't use this look for a colour result (nail shade, hair dye): the warm grade changes the colour.
- The output is 1080x1920, 30 fps (the picture inside the box moves at 18), H.264, sound normalised to -14 LUFS (Instagram/TikTok level).
