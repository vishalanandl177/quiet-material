#!/usr/bin/env python3
"""Render precise, authored MD3 motion studies. Requires Pillow + DejaVu Sans.

Read generated motion contracts; draw vector primitives from scratch. These are
explanatory diagrams, not browser captures or native component certifications.
Run `npm run build` before `python scripts/render-motion.py`.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "motion"
TOKENS = json.loads((ROOT / "tokens" / "quiet-material.tokens.json").read_text())
MOTION = json.loads((ROOT / "exports" / "quiet-material.motion.json").read_text())
WIDTH, HEIGHT, SCALE = 640, 400, 2
FRAME_MS = 20
HOLD_BEFORE_MS, HOLD_AFTER_MS = 700, 1050
FADE_READING_HOLD_MS = 250


def token(path):
    node = TOKENS
    for key in path.split("."):
        node = node[key]
    value = node["$value"]
    return token(value[1:-1]) if isinstance(value, str) and value.startswith("{") else value


def color(name):
    return tuple(round(c * 255) for c in token("color." + name)["components"])


def dimension(path):
    value = token(path)
    return value["value"] * (16 if value["unit"] == "rem" else 1)


FONT_ROOT = Path("/usr/share/fonts/truetype/dejavu")
if not (FONT_ROOT / "DejaVuSans.ttf").exists():
    raise SystemExit("Install DejaVu Sans (fonts-dejavu-core) to reproduce the diagrams.")


def font(size, bold=False):
    return ImageFont.truetype(str(FONT_ROOT / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")), size * SCALE)


def xy(box):
    return tuple(round(v * SCALE) for v in box)


def text(canvas, position, label, size=14, fill=None, bold=False):
    ImageDraw.Draw(canvas).text(xy(position), label, font=font(size, bold), fill=fill or color("text"))


def rounded(canvas, box, radius, fill, outline=None, width=1):
    ImageDraw.Draw(canvas).rounded_rectangle(xy(box), radius=round(radius * SCALE), fill=fill, outline=outline, width=width * SCALE)


def interpolate(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def clamp(value):
    return max(0.0, min(1.0, value))


def cubic(progress, control):
    """Invert a normalized cubic's x-coordinate before evaluating y."""
    p = clamp(progress)
    if p in (0.0, 1.0):
        return p
    x1, y1, x2, y2 = control
    lo, hi = 0.0, 1.0
    for _ in range(35):
        t = (lo + hi) / 2
        x = 3 * (1-t)**2 * t * x1 + 3 * (1-t) * t*t * x2 + t**3
        if x < p:
            lo = t
        else:
            hi = t
    t = (lo + hi) / 2
    return 3 * (1-t)**2 * t * y1 + 3 * (1-t) * t*t * y2 + t**3


def ease(progress, curve):
    if curve != "emphasized":
        return cubic(progress, curve)
    # The official emphasized curve is two joined cubics. A single cubic is
    # an approximation and cannot substitute for the exported path here.
    segment = MOTION["emphasized"]
    p = clamp(progress)
    if p <= segment["joinX"]:
        return segment["joinY"] * cubic(p / segment["joinX"], segment["first"])
    return segment["joinY"] + (1-segment["joinY"]) * cubic((p-segment["joinX"])/(1-segment["joinX"]), segment["second"])


def recipe_progress(elapsed, name):
    recipe = MOTION["recipes"][name]
    return ease(elapsed / recipe["duration"], recipe["easing"])


def spring_progress(elapsed, speed, kind):
    """Evaluate the same piecewise-linear samples emitted for web CSS."""
    contract = MOTION["springs"]["standard"][speed][kind]
    samples = contract["samples"]
    index = clamp(elapsed / contract["duration"]) * (len(samples)-1)
    left = min(math.floor(index), len(samples)-2)
    return samples[left] + (samples[left+1]-samples[left]) * (index-left)


def base(number, title, caption):
    canvas = Image.new("RGB", (WIDTH * SCALE, HEIGHT * SCALE), color("background"))
    text(canvas, (32, 22), number + "  /  MD3 MOTION STUDY", 10, color("textMuted"))
    text(canvas, (32, 46), title, 25, bold=True)
    ImageDraw.Draw(canvas).line(xy((32, 340, 608, 340)), fill=color("surfaceHigh"), width=SCALE)
    text(canvas, (32, 356), caption, 12, color("textMuted"))
    return canvas


def composite(canvas, layer, opacity=1, clip=None):
    alpha = layer.getchannel("A").point(lambda a: round(a * clamp(opacity)))
    if clip:
        mask = Image.new("L", canvas.size)
        ImageDraw.Draw(mask).rounded_rectangle(xy(clip), radius=24*SCALE, fill=255)
        alpha = ImageChops.multiply(alpha, mask)
    layer.putalpha(alpha)
    return Image.alpha_composite(canvas.convert("RGBA"), layer).convert("RGB")


def layer(canvas):
    return Image.new("RGBA", canvas.size)


def rgba(name):
    return (*color(name), 255)


def ripple(elapsed):
    contract = MOTION["ripple"]
    grow, fade = contract["growDuration"], contract["fadeDuration"]
    # An intentionally held press: release once growth completes. Real input
    # releases according to pointer/key events, after the minimum hold.
    p = cubic(elapsed / grow, contract["easing"])
    alpha = 0.12 * clamp(elapsed / contract["fadeInDuration"]) * (1-clamp((elapsed-grow)/fade))
    canvas = base("01", "Feedback follows the press", f"Ripple  ·  grow {grow} ms  ·  release fade {fade} ms")
    box = (176, 175, 464, 239)
    rounded(canvas, box, 32, color("primary"))
    if elapsed > 0 and alpha > 0:
        paint = layer(canvas)
        start = (226, 207)
        end = ((box[0]+box[2])/2, (box[1]+box[3])/2)
        center = (start[0]+(end[0]-start[0])*p, start[1]+(end[1]-start[1])*p)
        radius = math.hypot(box[2]-box[0], box[3]-box[1]) * p / 2 + 8
        ImageDraw.Draw(paint).ellipse(xy((center[0]-radius, center[1]-radius, center[0]+radius, center[1]+radius)), fill=rgba("onPrimary"))
        mask = Image.new("L", canvas.size)
        ImageDraw.Draw(mask).rounded_rectangle(xy(box), radius=32*SCALE, fill=255)
        paint.putalpha(ImageChops.multiply(paint.getchannel("A"), mask))
        canvas = composite(canvas, paint, alpha)
    text(canvas, (262, 194), "Continue", 19, color("onPrimary"), True)
    text(canvas, (176, 269), "Held press, then release. Action is immediate.", 12, color("textMuted"))
    return canvas


def switch(elapsed):
    control, state = MOTION["springs"]["standard"]["fast"]["spatial"], MOTION["springs"]["standard"]["fast"]["effects"]
    move = spring_progress(elapsed, "fast", "spatial")
    tint = spring_progress(elapsed, "fast", "effects")
    canvas = base("02", "Selection changes with intent", f"Standard fast springs  ·  color ~{state['duration']} ms / thumb ~{control['duration']} ms")
    rounded(canvas, (48, 135, 592, 282), dimension("radius.cardCompact"), color("surface"))
    text(canvas, (80, 171), "Focus mode", 23, bold=True)
    text(canvas, (80, 209), "State updates immediately.", 13, color("textMuted"))
    rounded(canvas, (446, 173, 550, 237), 32, interpolate(color("surface"), color("primary"), tint), interpolate(color("outline"), color("primary"), tint), 2)
    left = 460 + 40 * move
    ImageDraw.Draw(canvas).ellipse(xy((left, 187, left+36, 223)), fill=interpolate(color("textMuted"), color("onPrimary"), tint))
    return canvas


def sheet(elapsed):
    ms = MOTION["springs"]["standard"]["default"]["spatial"]["duration"]
    p = spring_progress(elapsed, "default", "spatial")
    canvas = base("03", "A surface enters its context", f"Sheet entry  ·  standard default spatial spring  ·  ~{ms} ms")
    viewport = (184, 92, 456, 321)
    rounded(canvas, viewport, 24, color("surfaceLow"), color("surfaceHigh"))
    text(canvas, (207, 110), "Workspace", 16, bold=True)
    rounded(canvas, (207, 146, 431, 185), 16, color("surface"))
    text(canvas, (224, 157), "Today's collection", 11, color("textMuted"))
    if elapsed > 0:
        paint = layer(canvas)
        y = 198 + 24 * (1-p)
        rounded(paint, (194, y, 446, 350), 24, rgba("surfaceHigh"))
        rounded(paint, (302, y+12, 338, y+15), 2, rgba("outline"))
        text(paint, (214, y+30), "Add to collection", 16, rgba("text"), True)
        text(paint, (214, y+57), "Keep useful things close.", 11, rgba("textMuted"))
        rounded(paint, (214, y+81, 426, y+111), 15, rgba("primary"))
        text(paint, (296, y+88), "Save", 11, rgba("onPrimary"), True)
        canvas = composite(canvas, paint, spring_progress(elapsed, "default", "effects"), viewport)
    return canvas


def container_transform(elapsed):
    ms = MOTION["recipes"]["container"]["duration"]
    p = recipe_progress(elapsed, "container")
    canvas = base("04", "One object, a new container", f"Container transform  ·  {ms} ms  ·  emphasized path")
    start, end = (70, 166, 294, 256), (70, 111, 570, 310)
    box = tuple(a+(b-a)*p for a,b in zip(start,end))
    rounded(canvas, box, 28+4*clamp(p/0.75), color("surface"))
    text(canvas, (box[0]+24, box[1]+22), "Morning notes", 21, bold=True)
    paint = layer(canvas)
    text(paint, (box[0]+24, box[1]+65), "A shared object keeps its identity.", 14, rgba("textMuted"))
    rounded(paint, (box[0]+24, box[1]+108, box[0]+170, box[1]+152), 22, rgba("primary"))
    text(paint, (box[0]+58, box[1]+120), "Open note", 13, rgba("onPrimary"), True)
    canvas = composite(canvas, paint, clamp(p/0.25), box)
    return canvas


def content_card(canvas, box, title, subtitle, fill="surface", opacity=1, scale=1):
    if opacity <= 0:
        return canvas
    cx, cy = (box[0]+box[2])/2, (box[1]+box[3])/2
    paint = layer(canvas)
    rounded(paint, box, 28, rgba(fill))
    text(paint, (box[0]+26, box[1]+26), title, 23, rgba("text"), True)
    text(paint, (box[0]+26, box[1]+70), subtitle, 14, rgba("textMuted"))
    rounded(paint, (box[0]+26, box[1]+107, box[0]+154, box[1]+113), 3, rgba("primary"))
    if scale != 1:
        scaled = paint.resize((round(paint.width*scale), round(paint.height*scale)), Image.Resampling.LANCZOS)
        paint = layer(canvas)
        paint.paste(scaled, (round(cx*SCALE*(1-scale)), round(cy*SCALE*(1-scale))))
    return composite(canvas, paint, opacity, (48, 104, 592, 326))


def shared_axis(elapsed):
    ms = MOTION["recipes"]["sharedAxis"]["duration"]
    p = recipe_progress(elapsed, "sharedAxis")
    canvas = base("05", "Related steps share an axis", f"Shared axis X  ·  {ms} ms  ·  forward progression")
    canvas = content_card(canvas, (78-30*p, 132, 562-30*p, 290), "01  Choose a collection", "Context moves in the same direction.", opacity=1-clamp(p/0.35))
    canvas = content_card(canvas, (78+30*(1-p), 132, 562+30*(1-p), 290), "02  Add your note", "The next related step arrives.", opacity=clamp((p-0.35)/0.65))
    return canvas


def fade_through(elapsed):
    ms = MOTION["recipes"]["fadeThrough"]["duration"]
    p = recipe_progress(elapsed, "fadeThrough")
    canvas = base("06", "A pause between destinations", f"Fade through  ·  {ms} ms  ·  out, then in")
    box = (78, 132, 562, 290)
    canvas = content_card(canvas, box, "Notes", "Independent destination", opacity=1-clamp(p/0.35))
    canvas = content_card(canvas, box, "Collections", "No spatial relationship implied", opacity=clamp((p-0.35)/0.65), scale=0.92+0.08*p)
    return canvas


def fade(elapsed):
    enter, leave = MOTION["recipes"]["fadeEnter"], MOTION["recipes"]["fadeExit"]
    canvas = base("07", "A small element appears", f"Fade  ·  enter {enter['duration']} ms / exit {leave['duration']} ms")
    if elapsed <= enter["duration"]:
        progress = recipe_progress(elapsed, "fadeEnter")
        alpha = clamp(progress / 0.3)
        scale = 0.8 + 0.2 * progress
    else:
        alpha = 1-recipe_progress(elapsed-enter["duration"]-FADE_READING_HOLD_MS, "fadeExit")
        scale = 1
    paint = layer(canvas)
    rounded(paint, (118, 168, 522, 242), 24, rgba("surfaceHigh"))
    ImageDraw.Draw(paint).ellipse(xy((142, 189, 174, 221)), fill=rgba("success"))
    text(paint, (191, 191), "Saved to your collection", 19, rgba("text"), True)
    if scale < 1:
        scaled = paint.resize((round(paint.width*scale), round(paint.height*scale)), Image.Resampling.LANCZOS)
        paint = layer(canvas)
        paint.paste(scaled, ((paint.width-scaled.width)//2, (paint.height-scaled.height)//2))
    canvas = composite(canvas, paint, alpha)
    text(canvas, (143, 269), "Arrival scales in; exit fades in place.", 13, color("textMuted"))
    return canvas


def finish(canvas):
    return canvas.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)


def render(name, renderer, transition_ms, poster_ms, contract, phases=None):
    encoded_transition_ms = math.ceil(transition_ms / 10) * 10
    times = [0] + list(range(FRAME_MS, encoded_transition_ms, FRAME_MS)) + [encoded_transition_ms]
    # GIF time is quantized to 10 ms. Avoid a sub-20ms terminal frame: several
    # viewers stretch those short delays. Retain the exact total duration.
    if len(times) > 2 and times[-1]-times[-2] < FRAME_MS:
        del times[-2]
    frames = [finish(renderer(t)) for t in times]
    delays = [HOLD_BEFORE_MS + times[1]] + [times[i+1]-times[i] for i in range(1, len(times)-1)] + [HOLD_AFTER_MS]
    gif_path, poster_path = OUT/(name+".gif"), OUT/(name+".png")
    contact = Image.new("RGB", (WIDTH, HEIGHT*len(frames)))
    for i, frame in enumerate(frames):
        contact.paste(frame, (0, HEIGHT*i))
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
        assert total_ms == HOLD_BEFORE_MS + encoded_transition_ms + HOLD_AFTER_MS
        assert verified.size == (WIDTH, HEIGHT)
        frame_count = verified.n_frames
    assert gif_path.stat().st_size < 300_000, "Keep each motion study below 300 KB."
    return {
        "gif": "assets/motion/"+gif_path.name, "poster": "assets/motion/"+poster_path.name,
        "width": WIDTH, "height": HEIGHT, "frames": frame_count, "transitionMs": transition_ms,
        "encodedTransitionMs": encoded_transition_ms, "timeQuantizationMs": encoded_transition_ms-transition_ms,
        "readingHoldBeforeMs": HOLD_BEFORE_MS, "readingHoldAfterMs": HOLD_AFTER_MS,
        "totalMs": total_ms, "loops": False, "gifBytes": gif_path.stat().st_size,
        "posterBytes": poster_path.stat().st_size, "contract": contract,
        **({"phases": phases} if phases else {}),
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    recipes = MOTION["recipes"]
    fast = MOTION["springs"]["standard"]["fast"]
    default = MOTION["springs"]["standard"]["default"]
    ripple_ms = MOTION["ripple"]["growDuration"]+MOTION["ripple"]["fadeDuration"]
    fade_ms = recipes["fadeEnter"]["duration"]+FADE_READING_HOLD_MS+recipes["fadeExit"]["duration"]
    studies = {
        "ripple": render("ripple", ripple, ripple_ms, 120, {"ripple": MOTION["ripple"]}, {"heldPressMs": MOTION["ripple"]["growDuration"], "releaseFadeMs": MOTION["ripple"]["fadeDuration"]}),
        "switch": render("switch", switch, fast["spatial"]["duration"], fast["spatial"]["duration"], {"standardFastSpatial": fast["spatial"], "standardFastEffects": fast["effects"]}),
        "sheet": render("sheet", sheet, default["spatial"]["duration"], default["spatial"]["duration"], {"standardDefaultSpatial": default["spatial"], "standardDefaultEffects": default["effects"]}),
        "container-transform": render("container-transform", container_transform, recipes["container"]["duration"], recipes["container"]["duration"], {"container": recipes["container"]}),
        "shared-axis": render("shared-axis", shared_axis, recipes["sharedAxis"]["duration"], recipes["sharedAxis"]["duration"], {"sharedAxis": recipes["sharedAxis"]}),
        "fade-through": render("fade-through", fade_through, recipes["fadeThrough"]["duration"], recipes["fadeThrough"]["duration"], {"fadeThrough": recipes["fadeThrough"]}),
        "fade": render("fade", fade, fade_ms, recipes["fadeEnter"]["duration"], {"fadeEnter": recipes["fadeEnter"], "fadeExit": recipes["fadeExit"]}, {"enterMs": recipes["fadeEnter"]["duration"], "readingHoldBetweenMs": FADE_READING_HOLD_MS, "exitMs": recipes["fadeExit"]["duration"]}),
    }
    manifest = {
        "description": "Authored MD3 motion studies, not screen recordings or certified native component clones.",
        "source": "exports/quiet-material.motion.json", "samplingMs": FRAME_MS,
        "samplingMaximumMs": FRAME_MS+10, "gifTimeQuantumMs": 10,
        "studies": studies,
    }
    (OUT/"manifest.json").write_text(json.dumps(manifest, indent=2)+"\n")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
