"""
Subset self-hosted Anton WOFF2 files using characters from unique_chars.json
and emit src/components/fonts/anton-critical.generated.css (data URLs + font-display).
"""
from __future__ import annotations

import base64
import json
import sys
from io import BytesIO
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter
from jinja2 import Environment, FileSystemLoader

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent

ANTON_SOURCES: list[tuple[str, Path, str]] = [
    (
        "vietnamese",
        REPO_ROOT / "public/fonts/anton-vietnamese.woff2",
        "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
    ),
    (
        "latin-ext",
        REPO_ROOT / "public/fonts/anton-latin-ext.woff2",
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    ),
    (
        "latin",
        REPO_ROOT / "public/fonts/anton-latin.woff2",
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    ),
]


def subset_to_woff2_base64(font_path: Path, text: str) -> str:
    font = TTFont(str(font_path))
    subsetter = Subsetter()
    subsetter.populate(text=text)
    subsetter.subset(font)
    font.flavor = "woff2"
    out = BytesIO()
    font.save(out)
    return base64.b64encode(out.getvalue()).decode("ascii")


def main() -> int:
    chars_path = SCRIPT_DIR / "unique_chars.json"
    if len(sys.argv) >= 2:
        chars_path = Path(sys.argv[1]).resolve()
    if not chars_path.is_file():
        print(f"Missing {chars_path}. Run: node scripts/generate-font-subset/get-characters.mjs", file=sys.stderr)
        return 1

    with chars_path.open(encoding="utf-8") as f:
        data = json.load(f)

    anton_chars = data.get("anton")
    if not isinstance(anton_chars, list) or not anton_chars:
        print("unique_chars.json must include a non-empty 'anton' string array.", file=sys.stderr)
        return 1

    text = "".join(anton_chars)
    faces: list[dict[str, str]] = []

    for _name, src, unicode_range in ANTON_SOURCES:
        if not src.is_file():
            print(f"Missing font file: {src}", file=sys.stderr)
            return 1
        b64 = subset_to_woff2_base64(src, text)
        faces.append({"unicode_range": unicode_range, "base64": b64})
        print(f"Subset OK: {src.name} -> {len(b64)} base64 chars")

    env = Environment(
        loader=FileSystemLoader(str(SCRIPT_DIR)),
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    tpl = env.get_template("template.anton-critical.css.j2")
    css_out = tpl.render(faces=faces)

    out_file = REPO_ROOT / "src/components/fonts/anton-critical.generated.css"
    out_file.write_text(css_out.strip() + "\n", encoding="utf-8")
    print(f"Wrote {out_file.relative_to(REPO_ROOT)}")

    demo_tpl = env.get_template("template.subset-demo.html")
    demo_html = demo_tpl.render(
        anton_faces=faces,
        char_counts={k: len(v) if isinstance(v, list) else 0 for k, v in data.items()},
    )
    demo_path = REPO_ROOT / "public/fonts/subset-demo.html"
    demo_path.parent.mkdir(parents=True, exist_ok=True)
    demo_path.write_text(demo_html, encoding="utf-8")
    print(f"Wrote {demo_path.relative_to(REPO_ROOT)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
