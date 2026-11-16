# Third-party files

The code in this repository is MIT-licensed (see LICENSE). These bundled files keep their own licences:

- **Fonts** in `skills/goat-super8/fonts/` (Caveat[wght].ttf, DSEG7Classic-Bold.ttf, PTM55FT.ttf): SIL Open Font License 1.1. Each family's licence text sits next to it as `OFL-<Family>.txt`.
- **Sound effects** (`skills/goat-super8/scripts/sfx/*.wav`): made in code by GOAT Academy (core/make_sfx.py, from the recipes in core/sfx.py), part of this repository's MIT code.

Downloaded or used at run time, not bundled:

- **HyperFrames** (https://github.com/heygen-com/hyperframes), run with `npx hyperframes@0.9.46`: Apache License 2.0, by HeyGen. It draws the frames in a private copy of Chrome.
- **GSAP** (https://gsap.com), loaded from jsDelivr by the template: GSAP's own standard licence (free to use).

The caption grouping, pause-cutting and pacing rules in `scripts/words.mjs` (shipped with every GOAT look; this one has no captions) are adapted from Nate Herk's herk-edit-kit (https://github.com/nateherkai/herk-edit-kit), under this notice:

> MIT License
>
> Copyright (c) 2026 Nate Herk
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

- **Poster** (`assets/poster.jpg`): rendered with version 1 of this skill from these photos, cropped and colour-graded:
  - Hair salon photo by Mostafa Meraji, CC0, https://commons.wikimedia.org/wiki/File:Haircut_or_hair_Salon_From_Iran-_Canon_Photography-_Mostafa_Meraji-_fashion_Photo_01.jpg
  - Portrait by Mostafa Meraji, CC0, https://commons.wikimedia.org/wiki/File:A_young_Iranian_man_with_Fedora_hat_Iran_Mashhad_City_Photo_By_Mostafa_Meraji_06.jpg (and _04.jpg)
