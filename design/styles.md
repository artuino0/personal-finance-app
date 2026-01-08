# Design System Documentation

Extracted from `inspiration/src/style.css`.

## Typography

- **Font Sans**: 'Geist', 'Geist Fallback'
- **Font Mono**: 'Geist Mono', 'Geist Mono Fallback'

## Theme Colors (OKLCH)

### Light Mode (`:root`)

| Variable | Value | Description |
| :--- | :--- | :--- |
| `--background` | `oklch(0.97 0.01 90)` | Soft warm beige/grey |
| `--foreground` | `oklch(0.20 0.02 90)` | Dark charcoal |
| `--card` | `oklch(1 0 0)` | White |
| `--card-foreground` | `oklch(0.20 0.02 90)` | Dark charcoal |
| `--popover` | `oklch(1 0 0)` | White |
| `--popover-foreground` | `oklch(0.20 0.02 90)` | Dark charcoal |
| `--primary` | `oklch(0.20 0.02 90)` | Dark button (Moment-like) |
| `--primary-foreground` | `oklch(0.98 0.01 90)` | Light text on primary |
| `--secondary` | `oklch(0.92 0.02 90)` | Light warm grey |
| `--secondary-foreground` | `oklch(0.20 0.02 90)` | Dark text on secondary |
| `--muted` | `oklch(0.92 0.02 90)` | Muted background |
| `--muted-foreground` | `oklch(0.50 0.02 90)` | Muted text |
| `--accent` | `oklch(0.92 0.02 90)` | Accent background |
| `--accent-foreground` | `oklch(0.20 0.02 90)` | Accent text |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red error |
| `--destructive-foreground` | `oklch(0.98 0 0)` | Text on destructive |
| `--border` | `oklch(0.88 0.01 90)` | Border color |
| `--input` | `oklch(0.88 0.01 90)` | Input border/bg |
| `--ring` | `oklch(0.20 0.02 90)` | Focus ring |

### Dark Mode (`.dark`)

| Variable | Value |
| :--- | :--- |
| `--background` | `oklch(0.145 0 0)` |
| `--foreground` | `oklch(0.985 0 0)` |
| `--card` | `oklch(0.145 0 0)` |
| `--card-foreground` | `oklch(0.985 0 0)` |
| `--popover` | `oklch(0.145 0 0)` |
| `--popover-foreground` | `oklch(0.985 0 0)` |
| `--primary` | `oklch(0.985 0 0)` |
| `--primary-foreground` | `oklch(0.205 0 0)` |
| `--secondary` | `oklch(0.269 0 0)` |
| `--secondary-foreground` | `oklch(0.985 0 0)` |
| `--muted` | `oklch(0.269 0 0)` |
| `--muted-foreground` | `oklch(0.708 0 0)` |
| `--accent` | `oklch(0.269 0 0)` |
| `--accent-foreground` | `oklch(0.985 0 0)` |
| `--destructive` | `oklch(0.396 0.141 25.723)` |
| `--destructive-foreground` | `oklch(0.637 0.237 25.331)` |
| `--border` | `oklch(0.269 0 0)` |
| `--input` | `oklch(0.269 0 0)` |
| `--ring` | `oklch(0.439 0 0)` |

## Components (Sidebar)

Values for sidebar specific variables are also defined in the source CSS for both light and dark modes.

## Border Radius
- **Base Radius**: `0.5rem` (8px)
- **sm**: `calc(var(--radius) - 4px)`
- **md**: `calc(var(--radius) - 2px)`
- **lg**: `var(--radius)`
- **xl**: `calc(var(--radius) + 4px)`
