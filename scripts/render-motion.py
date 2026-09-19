#!/usr/bin/env python3
"""Render authored motion diagrams from Quiet Material tokens (requires Pillow).

These are control studies, not browser captures. No source image is edited.
Run from any directory: python scripts/render-motion.py
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "motion"
TOKENS = json.loads((ROOT / "tokens" / "quiet-material.tokens.json").read_text())
WIDTH, HEIGHT, SCALE = 640, 400, 2
FRAME_MS = 50
HOLD_BEFORE_MS, HOLD_AFTER_MS = 700, 1050


def token(path: str):
    node = TOKENS
    for key in path.split("."):
        node = node[key]
    value = node["$value"]
    return token(value[1:-1]) if isinstance(value, str) and value.startswith("{") else value


def color(name: str) -> tuple[int, int, int]:
    return tuple(round(component * 255) for component in token("color." + name)["components"])


def duration(name: str) -> int:
    value = token("duration." + name)
    return round(value["value"] * (1000 if value["unit"] == "s" else 1))


def dimension(path: str) -> float:
    value = token(path)
    return value["value"] * (16 if value["unit"] == "rem" else 1)


FONT_ROOT = Path("/usr/share/fonts/truetype/dejavu")
if not (FONT_ROOT / "DejaVuSans.ttf").exists():
    raise SystemExit("Install DejaVu Sans (fonts-dejavu-core) to reproduce the diagrams.")


def font(size: int, bold: bool = False):
    return ImageFont.truetype(str(FONT_ROOT / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")), size * SCALE)


def xy(box):
    return tuple(round(value * SCALE) for value in box)


def text(canvas: Image.Image, position, label: str, size: int = 14, fill=None, bold=False):
    ImageDraw.Draw(canvas).text(xy(position), label, font=font(size, bold), fill=fill or color("text"))


def rounded(canvas: Image.Image, box, radius: float, fill, outline=None, width=1):
    ImageDraw.Draw(canvas).rounded_rectangle(xy(box), radius=round(radius * SCALE), fill=fill, outline=outline, width=width * SCALE)


def interpolate(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def ease(progress: float, name: str = "standard") -> float:
    """Solve the CSS cubic-bezier x(t), then evaluate y(t)."""
    x1, y1, x2, y2 = token("easing." + name)
    p = max(0.0, min(1.0, progress))
    if p in (0.0, 1.0):
        return p
    lo, hi = 0.0, 1.0
    for _ in range(30):
        t = (lo + hi) / 2
        x = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3
        if x < p:
            lo = t
        else:
            hi = t
    t = (lo + hi) / 2
    return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3


def base(number: str, title: str, caption: str) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH * SCALE, HEIGHT * SCALE), color("background"))
    text(canvas, (32, 22), number + "  /  MOTION STUDY", 10, color("textMuted"))
    text(canvas, (32, 46), title, 25, bold=True)
    ImageDraw.Draw(canvas).line(xy((32, 340, 608, 340)), fill=color("surfaceHigh"), width=SCALE)
    text(canvas, (32, 356), caption, 12, color("textMuted"))
    return canvas


def ripple(elapsed: float) -> Image.Image:
    ms = duration("long")
    p = ease(elapsed / ms)
    canvas = base("01", "A quiet response to touch", f"Press ripple  ·  {ms} ms  ·  standard easing")
    box = (176, 175, 464, 239)
    rounded(canvas, box, 32, color("primary"))
    if 0 < elapsed < ms:
        # The CSS ripple uses currentColor at 16% alpha, expands and fades.
        layer = Image.new("RGBA", canvas.size)
        diameter = math.hypot(box[2] - box[0], box[3] - box[1]) * 2
        radius = diameter * p / 2
        ImageDraw.Draw(layer).ellipse(xy((226 - radius, 207 - radius, 226 + radius, 207 + radius)), fill=(*color("onPrimary"), round(255 * 0.16 * (1 - p))))
        mask = Image.new("L", canvas.size)
        ImageDraw.Draw(mask).rounded_rectangle(xy(box), radius=32 * SCALE, fill=255)
        layer.putalpha(ImageChops.multiply(layer.getchannel("A"), mask))
        canvas = Image.alpha_composite(canvas.convert("RGBA"), layer).convert("RGB")
    text(canvas, (262, 194), "Continue", 19, color("onPrimary"), bold=True)
    text(canvas, (176, 269), "Feedback stays inside the control.", 13, color("textMuted"))
    return canvas


def switch(elapsed: float) -> Image.Image:
    thumb_ms, track_ms = duration("medium"), duration("short")
    move = ease(elapsed / thumb_ms)
    tint = ease(elapsed / track_ms)
    canvas = base("02", "Selection, then a soft settle", f"Switch  ·  {track_ms} ms color / {thumb_ms} ms thumb  ·  standard")
    rounded(canvas, (48, 135, 592, 282), dimension("radius.cardCompact"), color("surface"))
    text(canvas, (80, 171), "Focus mode", 23, bold=True)
    text(canvas, (80, 209), "State updates immediately.", 13, color("textMuted"))
    # 2× the CSS control dimensions so the thumb travel is readable.
    box = (446, 173, 550, 237)
    track = interpolate(color("surface"), color("primary"), tint)
    border = interpolate(color("outline"), color("primary"), tint)
    rounded(canvas, box, 32, track, border, 2)
    left = 460 + 40 * move
    knob = interpolate(color("textMuted"), color("onPrimary"), tint)
    ImageDraw.Draw(canvas).ellipse(xy((left, 187, left + 36, 223)), fill=knob)
    return canvas


def sheet(elapsed: float) -> Image.Image:
    ms = duration("long")
    p = ease(elapsed / ms, "enter")
    canvas = base("03", "New context, a small arrival", f"Bottom sheet  ·  {ms} ms  ·  enter easing  ·  24 px travel")
    # A miniature viewport is a diagram, not a device screenshot.
    rounded(canvas, (184, 92, 456, 321), 24, color("surfaceLow"), color("surfaceHigh"))
    text(canvas, (207, 110), "Workspace", 16, bold=True)
    rounded(canvas, (207, 146, 431, 185), 16, color("surface"))
    text(canvas, (224, 157), "Today's collection", 11, color("textMuted"))
    if elapsed > 0:
        layer = Image.new("RGBA", canvas.size)
        y = 198 + 24 * (1 - p)
        rounded(layer, (194, y, 446, 350), 24, (*color("surfaceHigh"), 255))
        rounded(layer, (302, y + 12, 338, y + 15), 2, (*color("outline"), 255))
        text(layer, (214, y + 30), "Add to collection", 16, (*color("text"), 255), True)
        text(layer, (214, y + 57), "Keep useful things close.", 11, (*color("textMuted"), 255))
        rounded(layer, (214, y + 81, 426, y + 111), 15, (*color("primary"), 255))
        text(layer, (296, y + 88), "Save", 11, (*color("onPrimary"), 255), True)
        mask = Image.new("L", canvas.size)
        ImageDraw.Draw(mask).rounded_rectangle(xy((184, 92, 456, 321)), radius=24 * SCALE, fill=round(255 * p))
        layer.putalpha(ImageChops.multiply(layer.getchannel("A"), mask))
        canvas = Image.alpha_composite(canvas.convert("RGBA"), layer).convert("RGB")
    return canvas


def finish(canvas: Image.Image) -> Image.Image:
    return canvas.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)


def render(name: str, renderer, transition_ms: int, poster_ms: int):
    times = [0] + list(range(FRAME_MS, transition_ms, FRAME_MS)) + [transition_ms]
    frames = [finish(renderer(time)) for time in times]
    # Include the t=0 sample for one sampling interval after the reading hold.
    delays = [HOLD_BEFORE_MS + min(FRAME_MS, transition_ms)]
    delays += [times[i + 1] - times[i] for i in range(1, len(times) - 1)]
    delays += [HOLD_AFTER_MS]
    gif_path, poster_path = OUT / (name + ".gif"), OUT / (name + ".png")
    # One global palette avoids flicker between per-frame palettes.
    contact = Image.new("RGB", (WIDTH, HEIGHT * len(frames)))
    for i, frame in enumerate(frames):
        contact.paste(frame, (0, HEIGHT * i))
    palette = contact.quantize(colors=128, method=Image.Quantize.MEDIANCUT)
    indexed = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
    indexed[0].save(gif_path, save_all=True, append_images=indexed[1:], duration=delays, optimize=True, disposal=1)
    finish(renderer(poster_ms)).save(poster_path, optimize=True)

    with Image.open(gif_path) as verified:
        assert "loop" not in verified.info, "GIF must stop after one cycle."
        total_ms = 0
        for i in range(verified.n_frames):
            verified.seek(i)
            total_ms += verified.info["duration"]
        assert total_ms == HOLD_BEFORE_MS + transition_ms + HOLD_AFTER_MS
        assert verified.size == (WIDTH, HEIGHT)
        frame_count = verified.n_frames
    assert gif_path.stat().st_size < 300_000, "Keep each motion study below 300 KB."
    return {
        "gif": "assets/motion/" + gif_path.name,
        "poster": "assets/motion/" + poster_path.name,
        "width": WIDTH,
        "height": HEIGHT,
        "frames": frame_count,
        "transitionMs": transition_ms,
        "readingHoldBeforeMs": HOLD_BEFORE_MS,
        "readingHoldAfterMs": HOLD_AFTER_MS,
        "totalMs": total_ms,
        "loops": False,
        "gifBytes": gif_path.stat().st_size,
        "posterBytes": poster_path.stat().st_size,
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    studies = {
        "ripple": render("ripple", ripple, duration("long"), 50),
        "switch": render("switch", switch, duration("medium"), duration("medium")),
        "sheet": render("sheet", sheet, duration("long"), duration("long")),
    }
    manifest = {"description": "Authored motion studies, not screen recordings.", "samplingMs": FRAME_MS, "studies": studies}
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
