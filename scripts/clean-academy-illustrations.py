"""Remove backgrounds from ScaleX Academy illustration PNGs."""
from __future__ import annotations

from collections import deque
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove

ILLUST_DIR = Path(
    r"C:\Users\hp\Desktop\ScaleX LMS\apps\student-portal\public\illustrations"
)
SRC_DIR = Path(r"C:\Users\hp\.cursor\projects\c-Users-hp-Desktop-ScaleX-LMS\assets")
FILES = [
    "rocket-purple.png",
    "rocket-red.png",
    "clipboard-checks.png",
    "folder-upload.png",
    "target-arrow.png",
    "gift-box.png",
    "trophy-shield.png",
]

# Keep large dark circular glow discs after rembg — remove via dark-component
DISC_CLEAN = {
    "rocket-purple.png",
    "rocket-red.png",
}


def trim_alpha(im: Image.Image, pad: int = 8, alpha_thresh: int = 8) -> Image.Image:
    a = np.array(im.split()[-1])
    ys, xs = np.where(a > alpha_thresh)
    if len(xs) == 0:
        return im
    left, right = int(xs.min()), int(xs.max()) + 1
    top, bottom = int(ys.min()), int(ys.max()) + 1
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(im.width, right + pad)
    bottom = min(im.height, bottom + pad)
    return im.crop((left, top, right, bottom))


def local_variance_gray(rgb: np.ndarray, k: int = 9) -> np.ndarray:
    gray = (
        0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    ).astype(np.float32)
    pad = k // 2
    g = np.pad(gray, pad, mode="edge")
    g2 = g * g

    def box_mean(arr: np.ndarray) -> np.ndarray:
        c = np.cumsum(np.cumsum(arr, axis=0), axis=1)
        c = np.pad(c, ((1, 0), (1, 0)), mode="constant")
        s = c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]
        return s / (k * k)

    mean = box_mean(g)
    mean2 = box_mean(g2)
    return np.clip(mean2 - mean * mean, 0, None)


def clear_near_black_residue(im: Image.Image, luma_cut: int = 14) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    rgb = arr[..., :3].astype(np.float32)
    luma = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    mx = rgb.max(axis=-1)
    mn = rgb.min(axis=-1)
    sat = np.where(mx < 1, 0, (mx - mn) / np.maximum(mx, 1))
    kill = (luma <= luma_cut) & (sat < 0.22) & (arr[..., 3] > 0)
    arr[kill, 3] = 0
    arr[arr[..., 3] == 0, 0:3] = 0
    return Image.fromarray(arr, "RGBA")


def largest_true_component(mask: np.ndarray) -> np.ndarray:
    """Return mask of the largest 4-connected True component."""
    h, w = mask.shape
    labels = np.zeros((h, w), dtype=np.int32)
    best_label = 0
    best_count = 0
    label = 0
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or labels[y, x]:
                continue
            label += 1
            q: deque[tuple[int, int]] = deque([(y, x)])
            labels[y, x] = label
            count = 0
            while q:
                cy, cx = q.popleft()
                count += 1
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if (
                        0 <= ny < h
                        and 0 <= nx < w
                        and mask[ny, nx]
                        and labels[ny, nx] == 0
                    ):
                        labels[ny, nx] = label
                        q.append((ny, nx))
            if count > best_count:
                best_count = count
                best_label = label
    if best_label == 0:
        return np.zeros_like(mask)
    return labels == best_label


def remove_circular_disc(im: Image.Image) -> Image.Image:
    """Remove large dark circular glow by deleting the largest dark-smooth blob.

    Seeds from interior dark pixels (not from the outer rim), so a brighter
    glow rim cannot block cleanup. Bright / high-variance subject pixels are
    protected.
    """
    arr = np.array(im.convert("RGBA"))
    h, w = arr.shape[:2]
    rgb = arr[..., :3].astype(np.float32)
    a = arr[..., 3]
    luma = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    var = local_variance_gray(rgb, k=9)

    # Hard protect subject cores
    protect = (a > 0) & ((luma > 120) | (var > 220))

    # Core disc: very dark + smooth + opaque
    core = (a > 0) & (luma < 32) & (var < 55) & ~protect
    if not core.any():
        return im

    disc = largest_true_component(core)
    if not disc.any():
        return im

    # Expand into soft dark glow rim around the disc (still not into subject)
    expandable = (a > 0) & (luma < 72) & (var < 95) & ~protect
    q: deque[tuple[int, int]] = deque()
    kill = disc.copy()
    ys, xs = np.where(disc)
    for y, x in zip(ys.tolist(), xs.tolist()):
        q.append((y, x))
    # Limit expansion so we don't crawl forever into smoke
    max_extra = int(disc.sum() * 1.8) + 5000
    extra = 0
    while q and extra < max_extra:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and expandable[ny, nx] and not kill[ny, nx]:
                kill[ny, nx] = True
                q.append((ny, nx))
                extra += 1

    # Soft fringe
    dil = kill.copy()
    nxt = dil.copy()
    nxt[1:, :] |= dil[:-1, :]
    nxt[:-1, :] |= dil[1:, :]
    nxt[:, 1:] |= dil[:, :-1]
    nxt[:, :-1] |= dil[:, 1:]
    fringe = nxt & ~kill & (a > 0) & (luma < 85) & (var < 120) & ~protect

    arr[kill, 3] = 0
    arr[fringe, 3] = (arr[fringe, 3].astype(np.float32) * 0.3).astype(np.uint8)
    arr[arr[..., 3] == 0, 0:3] = 0
    return Image.fromarray(arr, "RGBA")


def process_one(name: str, session) -> None:
    src = SRC_DIR / name
    dst = ILLUST_DIR / name
    data = src.read_bytes()
    before = len(data)
    out = remove(data, session=session)
    im = Image.open(BytesIO(out)).convert("RGBA")
    im = clear_near_black_residue(im)
    if name in DISC_CLEAN:
        im = remove_circular_disc(im)
    im = trim_alpha(im, pad=10)
    if name in DISC_CLEAN:
        im = remove_circular_disc(im)
        im = clear_near_black_residue(im)
        im = trim_alpha(im, pad=8)
    im.save(dst, "PNG", optimize=True)
    after = dst.stat().st_size
    a = np.array(im)[..., 3]
    print(
        f"{name}: {before:,} -> {after:,} | {im.size[0]}x{im.size[1]} | "
        f"pct_t={100 * (a == 0).mean():.1f}%"
    )


def main() -> None:
    ILLUST_DIR.mkdir(parents=True, exist_ok=True)
    print("Creating rembg session...")
    session = new_session("u2net")
    for name in FILES:
        process_one(name, session)
    print("ALL_DONE")


if __name__ == "__main__":
    main()
