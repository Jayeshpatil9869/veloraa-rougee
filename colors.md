# Siella Beauty colors

Measured from the saved CSS (`:root` in `siellabeauty.com/_next/static/css/00bc51710d82ab29.css`) and from the homepage rendered at 1440px. Use the hex values in a clone. The HSL columns are the CSS variables, stored as components without `hsl()`.

## Brand tokens

| Token | HSL | Hex | Use |
|---|---|---|---|
| `--background` | `0 0% 100%` | `#FFFFFF` | Page background |
| `--foreground` | `0 0% 20%` | `#333333` | Body text, nav, headings |
| `--primary` | `308 22% 52%` | `#A06A98` | Mauve brand, links, prices, footer headings, chips |
| `--primary-foreground` | `210 40% 98%` | `#F8FAFC` | Text on a primary fill (Add to Bag price, photo heroes) |
| `--secondary` | `327 69% 97%` | `#FDF2F8` | Announcement bar, footer, chips, soft fills |
| `--secondary-foreground` | `308 29% 36%` | `#76416F` | Dark mauve text |
| `--tertiary` | `307 34% 81%` | `#DFBEDB` | Hero wash, dots, soft borders |
| `--tertiary-foreground` | `308 22% 52%` | `#A06A98` | Same as primary |
| `--muted` | `210 40% 96.1%` | `#F1F5F9` | Quiet fills, skeletons |
| `--muted-foreground` | `0 0% 40%` | `#666666` | Secondary text |
| `--light` | `0 0% 40%` | `#666666` | Shade names under product cards |
| `--accent` | `210 40% 96.1%` | `#F1F5F9` | Same as muted |
| `--destructive` | `0 84.2% 60.2%` | `#EF4444` | Errors |
| `--border` | `214.3 31.8% 91.4%` | `#E2E8F0` | Default borders |
| `--input` | `283 60% 92%` | `#F0DEF7` | Input border |
| `--ring` | `308 22% 52%` | `#A06A98` | Focus ring |
| `--card` / `--popover` | `0 0% 100%` | `#FFFFFF` | Cards and menus |
| `--radius` | `0.3rem` | | Base radius. `rounded-md` is `calc(0.3rem - 2px)` = **2.8px** |

## Where each color sits

| Surface | Hex |
|---|---|
| Announcement bar | `#FDF2F8` |
| Header | `#FFFFFF` |
| Header and nav text | `#333333` |
| Hero H1 and hero CTA | `#FFFFFF` |
| Hero slide wash | `#DFBEDB` |
| Section headings | `#333333` |
| Shop All / View All links | `#A06A98`, hover `#774170` |
| Product price on the card button | `#F8FAFC` on `#A06A98` |
| Card description and shade | `#666666` |
| Footer band | `#FDF2F8` |
| Footer column headings | `#A06A98` |
| About page display title | `#333333` |
| Collection and legal H1 on a photo | `#F8FAFC` |
| Legal idle tabs | border `#9CA3AF`, text `#4B5563` |
| Legal active tab | fill `#A06A98`, text `#FFFFFF` |
| Page text on `<html>` | `#27272A` (`text-zinc-800`) until body color `#333333` takes over |
| Text selection | tertiary lilac `#DFBEDB` |

## One-off hex colors

These are written directly in class names, not as tokens.

| Hex | Where |
|---|---|
| `#FDF4F9` | Homepage collection band (close to secondary, slightly different) |
| `#666666` | `text-[#666]` promise and blog intro |
| `#333333` | `text-[#333333]` About title |
| `#9F6998` | Decorative flower SVG |
| `#774170` | Link hover `hover:text-[#774170]` |
| `#27272A` | `text-zinc-800` on the html element |
| `#EB001B` | Mastercard left circle |
| `#F79E1B` | Mastercard right circle |
| `#FF5F00` | Mastercard overlap |
| `#FFFFFF` | Header, cards, payment-icon plates |
| `#9CA3AF` | Legal tab idle border (`border-gray-400`) |
| `#4B5563` | Legal tab idle text (`text-gray-600`) |

## Opacity washes

| Class | Result |
|---|---|
| `bg-tertiary/60` | `#DFBEDB` at 60% |
| `bg-tertiary/40` | `#DFBEDB` at 40% |
| `bg-primary/40` | `#A06A98` at 40% |
| `bg-secondary/90` | `#FDF2F8` at 90% (story chips) |
| `border-tertiary/20` | `#DFBEDB` at 20% (story product cards) |

## Fonts

Files are in `All Md files/fonts/`. Both families are TrueType. Fallback if a file fails to load is Arial.

| File | Family | Weight | CSS variable | Tailwind class | Use |
|---|---|---|---|---|---|
| `fonts/Amithen-Regular.ttf` | Amithen | 400 | `--font-amithen` | `font-serif` | Hero H1, page titles |
| `fonts/SofiaPro-Regular.ttf` | Sofia Pro | 400 | `--font-sofia-pro` | `font-sans` | Body, 16px / 24px |
| `fonts/SofiaPro-Medium.ttf` | Sofia Pro | 500 | `--font-sofia-pro` | `font-medium` | Product titles, prices labels, inputs |
| `fonts/SofiaPro-Bold.ttf` | Sofia Pro | 700 | `--font-sofia-pro` | `font-bold` | Section headings, nav |
| `fonts/SofiaPro-ExtraBold.ttf` | Sofia Pro | 800 | `--font-sofia-pro` | `font-extrabold` | Footer headings, Shop All links |

Original Next.js filenames (same bytes):

- `7914e8a8324818f8-s.p.ttf` — Amithen 400
- `e037765d34e084b3-s.p.ttf` — Sofia Pro 400
- `7769bc5a0dcc472f-s.p.ttf` — Sofia Pro 500
- `3e71671f4651c510-s.p.ttf` — Sofia Pro 700
- `7ab3d031ec6a1cb6-s.p.ttf` — Sofia Pro 800

`font-display: swap`.

Desktop sizes that were measured:

| Role | Size | Weight | Tracking | Color |
|---|---|---|---|---|
| Body | 16px / 24px | 400 | normal | `#333333` |
| Nav | 14px | 700 | normal | `#333333` |
| Hero H1 | 72px / 72px | 400 Amithen | normal | `#FFFFFF` |
| Section H2 | 48px / 48px | 700 | -1.2px | `#333333` |
| About H1 | 128px / 128px | 400 Amithen | normal | `#333333` |

Below 768px, set the root font-size to `clamp(0.4rem, 0.6rem + 1.6vw, 1rem)` so the whole scale shrinks.
