"""Polish the three owner-supplied generated images (2026-10-17).

Usage: python3 scripts/polish-supplied.py <dir with 2.png 3.png 4.png> <out dir>
Requires Pillow and numpy. Inputs are the *-original.png files in assets/source
(2 = curls portrait, 3 = hair macro, 4 = crimson portrait). See docs/MEDIA.md.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]

def load(n):
    return np.asarray(Image.open(f'{SRC}/{n}.png').convert('RGB')).astype(np.float32) / 255.0

def save(arr, name):
    Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8)).save(f'{OUT}/{name}.png')

def luma(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722

def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def unsharp(arr, radius, amount, threshold=2):
    im = Image.fromarray((arr * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.UnsharpMask(radius, amount, threshold))).astype(np.float32) / 255

def blur_mask(m, r):
    im = Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255

# 1) Curls portrait: remove isolated bright specks in the hair, gentle ink grade.
a = load(2)
L = luma(a)
med = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(7))).astype(np.float32) / 255
Lm = luma(med)
# speck = much brighter than local median, in a dark region, tiny & low-saturation
sat = a.max(-1) - a.min(-1)
speck = ((L - Lm) > 0.10) & (Lm < 0.22) & (sat < 0.18)
speck = blur_mask(speck.astype(np.float32), 1.2) * 1.6
speck = np.clip(speck, 0, 1)[..., None]
a = a * (1 - speck) + med * speck
print('curls: specks healed px ~', int((speck[..., 0] > 0.5).sum()))
# neutralise the blue cast in deep shadows toward ink (#0A090B) with a whisper of wine
shadow = (1 - smoothstep(0.03, 0.22, luma(a)))[..., None]
target = np.array([0.050, 0.040, 0.048])
a = a * (1 - shadow * 0.55) + (a * np.array([1.04, 0.98, 0.90])) * shadow * 0.55
a = a + (target - a) * shadow * 0.18
a = unsharp(a, 1.4, 45, 3)
save(a, 'portrait-curls-noir-concept')

# 2) Hair macro: subtle warm split-tone (champagne highlights, ink-wine shadows) + depth.
b = load(3)
Lb = luma(b)
hi = smoothstep(0.25, 0.75, Lb)[..., None]
lo = (1 - smoothstep(0.02, 0.18, Lb))[..., None]
b = b * (1 + hi * np.array([0.07, 0.035, -0.02]))           # warm highlights (restrained)
b = b * (1 - lo * 0.25) + lo * 0.25 * b * np.array([1.10, 0.92, 0.96])  # wine-ink shadows
b = np.clip((b - 0.012) * 1.05, 0, 1)                       # slightly deeper blacks
b = unsharp(b, 1.0, 35, 2)
save(b, 'macro-waves-concept')

# 3) Crimson portrait: shift only the saturated red backdrop toward deep crimson-wine.
c = load(4)
mx, mn = c.max(-1), c.min(-1)
s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
r, g, bl = c[..., 0], c[..., 1], c[..., 2]
hue = (np.degrees(np.arctan2(np.sqrt(3) * (g - bl), 2 * r - g - bl)) + 360) % 360
redband = ((hue > 350) | (hue < 12)).astype(np.float32)
bg = redband * smoothstep(0.62, 0.80, s) * smoothstep(0.12, 0.25, mx)
# exclude the face/lips/skin zone conservatively: skin is lower saturation; lips are magenta (excluded by hue)
bg = blur_mask(bg, 2.0)
wine = c * np.array([0.70, 0.62, 0.78])      # darker, cooler red -> crimson-wine
wine[..., 2] = wine[..., 2] + c[..., 0] * 0.055  # whisper of blue toward the logo's crimson-plum
c2 = c * (1 - bg[..., None]) + wine * bg[..., None]
print('crimson: backdrop coverage', round(float((bg > 0.5).mean()), 3))
save(c2, 'portrait-crimson-concept')

# before/after sheet
pairs = [(2, 'portrait-curls-noir-concept'), (3, 'macro-waves-concept'), (4, 'portrait-crimson-concept')]
cells = []
for n, name in pairs:
    for p in (f'{SRC}/{n}.png', f'{OUT}/{name}.png'):
        im = Image.open(p).convert('RGB'); im.thumbnail((440, 560)); cells.append(im)
sheet = Image.new('RGB', (sum(i.width for i in cells) + 10 * len(cells), 560), (24, 24, 24))
x = 0
for im in cells:
    sheet.paste(im, (x, 0)); x += im.width + 10
sheet.save(f'{OUT}/before-after.jpg', quality=88)
