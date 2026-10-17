"""Remove backdrop colour spill from a cut-out's soft edges.

Usage: python3 scripts/defringe-cutout.py <original.png> <lifted.png> <out.png>
Requires Pillow and numpy.

The lifted image (scripts/lift-subject.swift) keeps the original pixels in
its semi-transparent edges, so hair edges carry the old studio backdrop and
show a halo on a different background. For each edge pixel the local backdrop
colour B is estimated from nearby fully-background pixels of the original,
and the foreground colour is recovered from C = a*F + (1 - a)*B. The faintest
band of alpha is then trimmed slightly. Opaque pixels are untouched.
"""
import sys

import numpy as np
from PIL import Image, ImageFilter

original_path, lifted_path, out_path = sys.argv[1:4]
original = np.asarray(Image.open(original_path).convert('RGB')).astype(np.float32) / 255
lifted = np.asarray(Image.open(lifted_path).convert('RGBA')).astype(np.float32) / 255
alpha = lifted[..., 3]
colour = original  # straight colour of the composite photograph


def blur(channel, radius):
    img = Image.fromarray(np.clip(channel * 255, 0, 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(radius))).astype(np.float32) / 255


# Local backdrop estimate: blur of background-only pixels, normalised by weight.
weight = (alpha < 0.02).astype(np.float32)
backdrop = np.stack([blur(colour[..., c] * weight, 28) for c in range(3)], -1)
coverage = blur(weight, 28)[..., None]
backdrop = backdrop / np.maximum(coverage, 1e-3)

a = alpha[..., None]
edge = (alpha > 0.0) & (alpha < 0.98)
recovered = (colour - (1 - a) * backdrop) / np.maximum(a, 0.08)
recovered = np.clip(recovered, 0, 1)
# Very faint pixels have little reliable colour: lean on a darkened recovery.
faint = np.clip((0.35 - alpha) / 0.35, 0, 1)[..., None]
recovered = recovered * (1 - 0.5 * faint)

rgb = np.where(edge[..., None], recovered, colour)
# Trim the faintest fringe slightly (about a pixel on soft edges).
new_alpha = np.clip((alpha - 0.08) / 0.92, 0, 1)

out = np.concatenate([rgb, new_alpha[..., None]], -1)
Image.fromarray(np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8)).save(out_path)
print('edge pixels cleaned:', int(edge.sum()))
