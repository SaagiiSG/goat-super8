---
name: goat-super8
description: Super 8 Home Movie · Хуучин хальс. Edits the user's phone clips into a 1970s home movie inside a small upright box on a black 9:16 screen. Warm faded colour, coarse film grain, a real 18-frames-a-second stutter, gate weave and flicker, over-bright cream frames at the cuts, an orange light leak, a flare to cream at the end and a handwritten Mongolian label above the box. Built on HyperFrames. Renders a 1080x1920 MP4 for Reels/TikTok. Best for bridal hair and makeup, salon "our story" reels, coaches' story reels and family shops. Use whenever the user wants an old film, retro, vintage, nostalgic, home-movie or "хуучин кино шиг" edit, or types /goat-super8, /хальс, or says "хуучин хальсан кино шиг болгоод өг", "ретро видео хий", "make it look like Super 8", "vintage film look", even if they don't name the skill.
---

# Super 8 Home Movie · Хуучин хальс

A warm, faded, grainy clip that stutters at 18 frames a second inside a small upright 3:4 box with black all around it, like a family film from the 1970s. The picture weaves a few pixels in the gate and flickers slightly; every cut flashes cream for three frames, an orange light leak flares up before every second cut, and the reel flares out to cream at the end. A handwritten label sits in the black above the box, a typewriter place-and-year line under it. It is the only GOAT look where the picture shrinks into a box and visibly stutters.

**Good for:** bridal hair and makeup, salon "our story" reels, coaches' story reels, family shops, behind-the-scenes moments.
**Not for:** nail-shade and hair-colour reveals (the warm grade shifts the true colour), product detail shots (it is soft and the box is small), real estate, car specs. If the user's footage is one of these, say so and suggest another GOAT look.

Talk to the user in the language they write in (usually Mongolian). Keep messages short and plain; many users are not technical. `SKILL_DIR` means this skill's base directory (shown when the skill loads). Run commands from the user's project folder with absolute paths into `SKILL_DIR`. `goat` below means `node SKILL_DIR/scripts/goat.mjs`.

## 1. Setup check (first time on a machine)

**Every new video, first:** run `claude plugin marketplace update goat-super8`, then `claude plugin update goat-super8@goat-super8`. If it installs a new version, tell the user a new version was installed and ask them to type `/reload-plugins` before you go on. If either command fails (offline, or installed from a zip), carry on and don't mention it.

Run `node --version` (needs 22 or newer) and `ffmpeg -version`. If either is missing, show the install command and ask before installing (it is their computer):
- Mac: `brew install node ffmpeg`
- Windows: `winget install OpenJS.NodeJS.LTS` and `winget install Gyan.FFmpeg`, then close and reopen the terminal.

This look has no captions, so it needs no speech model. The first render downloads, once, a private copy of Chrome that draws the frames. Tell the user the first run takes a while; after that it starts at once. Nothing is uploaded: everything runs on their computer, with no account.

**Long steps:** the first `render` (the Chrome download) can run longer than a normal command timeout. Run it in the background, or with a 600000 ms timeout, and wait for it to end. Never stop it and start it again.

**Windows has not been tested yet.** If a step fails there, show the error to the user in plain words.

## 2. Collect the clips and words

Make `raw/` and `output/` in the current folder. Ask for:
1. **The clips.** Drag them into the chat or copy them into `raw/`. Many short handheld moments work best: people moving, natural light, laughing, hands at work. Photos work too (they hold still while the grain and weave keep moving).
2. **The words:** a short handwritten label (2–4 words, e.g. "Манай салон") and, if they want, a place-and-year line: the place and the year they give, joined by " · " (just the place if they give no year). Never invent a date or place. Ask.

If this folder was already edited with `goat-video-editor`, use `output/cut.mp4` as the clip.

Then run `goat probe raw/*`. It prints each file's size, length, whether it has sound, whether it is HDR, and `speech` spans (when someone is talking). Use these to pick shots.

## 3. Prepare

Write `plan.json` in the project folder (paths are relative to it):

```json
{
  "output": "output/super8.mp4",
  "clips": [
    {"src": "raw/IMG_0412.MOV", "in": 1.2, "out": 2.6},
    {"src": "raw/IMG_0415.MOV", "in": 0.0, "out": 0.9, "cy": 0.35},
    {"src": "raw/bride.jpg", "dur": 1.2},
    {"src": "raw/IMG_0418.MOV", "in": 2.0, "out": 3.4, "cy": 0.3}
  ],
  "texts": [
    {"role": "label", "text": "Манай салон", "start": 0, "end": 2.3},
    {"role": "label", "text": "Өглөө бүр хамтдаа", "start": 2.5, "end": 4.2},
    {"role": "place", "text": "УЛААНБААТАР", "start": 0}
  ],
  "look": {"leak": true, "counter": false}
}
```

**clips** play in order. `in`/`out` trim a video (seconds); `dur` sets how long a photo shows. `cx`/`cy` (0–1, default 0.5) choose which part of the frame the box keeps: `cy: 0.3` keeps the upper part (faces), `cy: 0.7` the lower part. The box is 3:4, so the top and bottom of an upright phone clip are cut off. Add `"sound": false` to mute one clip.

Then run these in order. Each one says what to run first if a step is missing.
1. `goat prep plan.json`: crops every clip to the box, grades it (warm faded colour, soft blur, vignette, 18 frames a second, grain) and joins them into `.work-super8/main.mp4`. **Run it again whenever `clips` change.**
2. `goat cut plan.json`: this look never cuts pauses; the step only readies the video (`.work-super8/cut.mp4`) and takes a second.

**Check the framing** before writing the words. For each shot, pull one frame from inside it, 0.4 s after it starts (never at a cut: that frame may already be the next shot). A shot starts where the shots before it end; for the second shot above (1.4 to 2.3 s):
`ffmpeg -y -loglevel error -ss 1.8 -i .work-super8/cut.mp4 -frames:v 1 output/frame-1.8.jpg`
Read it. The box shows all of it except a 10 px border. If a face is cut off at the top, lower `cy` (e.g. 0.3) and run `prep` again.

## 4. Write the words

**texts** (only one label and one place line show at a time: a later one ends the one before):
- `label`: handwritten (Caveat Bold, cream, up to 92 px), slightly tilted, in the black above the box, inside the area no app buttons cover. One short line reads best. **At most 32 characters a row** (spaces count); a long row shrinks, and a row of capitals is wider, so it gets smaller type. `\n` splits a label into 2 rows (2 at most), but two rows are much smaller (up to 52 px): shorten it first.
- `place`: small spaced-out typewriter letters (PT Mono, grey, up to 36 px) under the box, for a place and year. It is decoration: app buttons may cover it, so never put a price or phone number here. PT Mono has no ₮ sign. **At most 36 characters a row, or 29 with the counter on** (spaces count); split a longer one into 2 rows with `\n`.

Each fades in over 0.45 s at `start` and out over 0.3 s before `end` (default: the end of the video).

**The first frame is the Reels thumbnail.** Give the first label and the place line `"start": 0`: they are then already there on frame 0, over the first shot. Start on a shot worth seeing.

**look** options:
- `leak`: `true` (default) adds an orange light leak that builds up from the top-right corner over the half second before every second cut and fades after it. `false` turns it off.
- `counter`: `false` (default). `true` shows a running film-frame counter in small grey 7-segment digits under the box, bottom-right.

**Auto sound effects** (soft, so it sits under the clips' own sound; raise it with `"sfx": {"volume": 1.5}`): a Super 8 projector rattle (18 clicks a second over a low hum) under the whole reel.

**Timing:** keep shots short, 0.5–1.5 s each; many quick moments read as a real home movie. Every cut gets a flash of 3 over-bright cream frames, but never more than 3 flashes a second: a cut less than 1/3 s after the last flash gets none (only very fast cutting skips some). The last 0.6 s flares out to cream like the end of a reel, so end on a moment that can fade, and end the last label by then. The flare is the reel's last flash: a cut in the last second (less than 0.93 s before the end) gets no cream frames, and the leak skips it too.

Before rendering, tell the user the plan in plain words (shot list + the words) and ask "OK?". This is the only approval needed.

<!-- audio: this section is copied from core/skill-audio-node.md by build.py; edit it there -->
## Sound effects, voice-over and music

**Sound effects are on by default.** The look adds its own (see "Auto sound effects" above). They are made in code, so there's nothing to license, and they sit quietly under the voice.
- Turn them off: `"sfx": false`. Make them quieter or louder: `"sfx": {"volume": 0.6}`.
- Add one: `"sfx": {"add": [{"sound": "ding", "at": 4.2}]}`. Sounds: whoosh, swish, pop, click, type, shutter, boom, thud, hit, riser, ding, notify, shimmer, paper, tape, marker, projector, tick. `type`, `marker`, `projector` and `riser` also take `"dur"` in seconds; a riser should end on the moment it builds to.
- Let the user hear one render before adding more. Too many sounds feel cheap.

**Voice-over.** If the user wants to talk over the video, ask them to record it on their phone (a voice memo is fine: m4a, mp3 or wav) and copy it into `raw/`. Then add `"voiceover": {"src": "raw/vo.m4a", "at": 0.5}` (`at` = when it starts; optional `"volume"`). While the voice plays, the clips' own sound and the music dip automatically. Run `node SKILL_DIR/scripts/goat.mjs probe raw/vo.m4a` to get its `speech` spans and time the words on screen to them. The clips must add up to at least the voice-over's length (the render warns if not). Recording tips for the user: a small quiet room (a parked car or a wardrobe works), phone about 20 cm from the mouth, read the script out loud once before recording.

**Music.** `"music": {"src": "raw/song.mp3", "volume": 0.25}`. Only use music the user has the rights to. Music added inside the Instagram/TikTok app is the safe choice, so suggest that first.
<!-- /audio -->

## 5. Render and check

`goat render plan.json`

It draws the box, grain movement, flashes, leak and words over the graded footage, mixes the sound and writes the MP4 plus a contact sheet (one frame per second) at `.work-super8/sheet.jpg`. On our test Mac a 7.8 s video took about 13 s. Run the next render only after the last one ends. Read the contact sheet, the first frame and one full-size frame inside each shot, 0.4 s after it starts (after its cream frames, before the next cut):
`ffmpeg -y -loglevel error -i output/super8.mp4 -frames:v 1 output/check-0.jpg`
`ffmpeg -y -loglevel error -ss 1.8 -i output/super8.mp4 -frames:v 1 output/check-1.8.jpg` (and one per shot).
Check that:
- the first frame (the thumbnail) shows the footage and the label;
- the label is whole, faces are inside the box (fix with `cy`), and nothing important is too dark;
- the place line is whole under the box.

If a render fails twice, stop and explain the error in plain words. Don't loop.

## 6. Hand over

Tell the user where the file is (`output/super8.mp4`) and that it is ready to post. Captions and music can be added in the Instagram/TikTok app.

## Rules

- Every word and graphic on screen comes from what this video says or shows, or from what the user gave you. The examples in this file are only examples: never put them in a video. If the user hasn't given the words, ask.
- The label sits in the black band above the box, inside the area no app buttons cover. Never put a price or phone number in the black band below the box: the app's caption area covers it.
- Use only the fonts bundled in `SKILL_DIR/fonts` (Caveat and PT Mono have Ө ө Ү ү; DSEG7 is digits only, for the counter). Don't swap in other fonts. Emoji and symbols such as ★ can't be drawn.
- Don't use this look for a colour result (nail shade, hair dye): the warm grade changes the colour.
- Never invent a place, year or date; ask.
- The output is 1080x1920, 30 fps (the picture inside the box moves at 18), H.264, sound normalised to -14 LUFS (Instagram/TikTok level).
