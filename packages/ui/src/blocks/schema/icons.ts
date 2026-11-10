// Allow-list for `f.icon()` (150 lucide names) (kebab-case) that read well at 20px / stroke 1.5.
// Brand marks are not icons — use `f.social()`.

export const BLOCK_ICONS = [
  // places & contact
  "map-pin", "map", "navigation", "compass", "phone", "phone-call", "mail", "message-circle", "message-square", "send",
  "globe", "building", "building-2", "store", "home", "hotel", "landmark", "warehouse", "parking-circle", "car",
  "bike", "bus", "train-front", "plane", "ship", "accessibility", "baby", "dog", "wifi", "plug",
  // time & booking
  "clock", "calendar", "calendar-check", "calendar-days", "alarm-clock", "timer", "hourglass", "history", "repeat", "bell",
  // food & venue
  "utensils", "utensils-crossed", "chef-hat", "coffee", "cup-soda", "wine", "beer", "cake", "croissant", "pizza",
  "salad", "soup", "fish", "beef", "egg", "leaf", "wheat", "flame", "ice-cream-cone", "sandwich",
  // wellness & care
  "heart", "heart-pulse", "sparkles", "flower", "flower-2", "bath", "droplets", "sun", "moon", "waves",
  "scissors", "hand", "stethoscope", "pill", "smile", "dumbbell", "palette", "brush", "glasses",
  // business & product
  "briefcase", "chart-line", "chart-bar", "chart-pie", "trending-up", "target", "gauge", "layers", "layout-grid", "puzzle",
  "settings", "sliders-horizontal", "wrench", "hammer", "package", "truck", "box", "tag", "receipt", "wallet",
  "credit-card", "banknote", "piggy-bank", "percent", "shopping-bag", "shopping-cart", "gift", "award", "badge-check", "medal",
  // people & trust
  "user", "users", "user-check", "handshake", "shield", "shield-check", "lock", "key", "eye", "fingerprint",
  // content & tech
  "book-open", "file-text", "newspaper", "pen-line", "image", "camera", "video", "music", "mic", "headphones",
  "monitor", "smartphone", "tablet", "laptop", "code", "terminal", "database", "cloud", "server", "cpu",
  "zap", "rocket", "lightbulb", "star", "check", "circle-check", "info", "help-circle", "arrow-right", "external-link",
] as const;

export type BlockIconName = (typeof BLOCK_ICONS)[number];
