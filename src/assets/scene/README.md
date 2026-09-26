# Scene assets — home-office illustration (day / night)

Raster assets for the hero scroll-dolly effect. Read this before wiring up the
CSS transforms or touching these files.

## Dimensions

Both **1086 × 724**, RGB, identical size. Aspect ratio **1.5 : 1**.

Because both assets share exact dimensions, `object-fit: cover` renders them
at the same scale — no theme-switch size jump, no padding/normalisation
needed. **Both PNGs must stay exactly 1086×724.** If either is ever replaced
or re-exported at a different size, check dimensions with `identify` or `PIL`
before swapping — a mismatch reintroduces the cover-fit size-jump on every
theme switch.

Day/night renders have a measured **+12px vertical offset** (1.7% of height)
between them — the existing crossfade (`.scene__img` `transition: opacity
var(--dur-slow) var(--ease-in-out)`, 420ms) covers this; no other handling
needed.

## Monitor-screen focal point (scroll-dolly target)

Measured on the day asset (glass only, inside the bezel):

- bbox (px): x 397–510, y 323–420
- bbox (%): x 36.6%–47.0% (10.4% of width), y 44.6%–58.0% (13.4% of height)
- **centre (`transform-origin`): 41.8%, 51.3%**

## Binding dimension for the dolly (width, not height)

At a 1440×900 viewport, `cover`-fit on this 1.5-aspect asset is
**width-bound**: 100% of asset width is visible, ~93.8% of height. So filling
the frame with the monitor glass needs magnification based on the glass's
width fraction (10.4% of asset width → ≈9.6×), not its height fraction. See
`OfficeScene.astro`'s `--dolly-end` comment for the full derivation.

## Gotchas for integration

1. **Both assets must stay identical in size.** See Dimensions above — this
   is the one hard constraint carried over from the old assets.
