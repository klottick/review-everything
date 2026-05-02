# Color Palette for Review Everything

## User Avatar Colors
These colors pop, are accessible, and work well on both light and dark backgrounds:

```json
[
  "#6366F1",  # Indigo - modern, confident
  "#EC4899",  # Pink - playful, warm  
  "#14B8A6",  # Teal - fresh, calm
  "#F59E0B",  # Amber - energetic, bright
  "#8B5CF6",  # Purple - creative, magical
  "#EF4444",  # Red - bold, passionate
  "#10B981",  # Emerald - natural, fresh
  "#F97316"   # Orange - fun, appetizing
]
```

## MUI Theme Colors
```json
{
  "primary": {
    "main": "#6366F1",
    "light": "#818CF8", 
    "dark": "#4F46E5"
  },
  "secondary": {
    "main": "#EC4899",
    "light": "#F472B6",
    "dark": "#DB2777"
  },
  "success": {
    "main": "#14B8A6"
  },
  "warning": {
    "main": "#F59E0B" 
  },
  "error": {
    "main": "#EF4444"
  }
}
```

## Usage
Import in Dashboard.tsx:
```typescript
const COLORS = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#F97316'];
```