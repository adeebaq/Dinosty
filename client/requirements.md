## Packages
framer-motion | Essential for playful animations (mascot movements, confetti, transitions)
lucide-react | Icon set (already in base, but emphasizing heavy usage)
clsx | For conditional class merging
tailwind-merge | For merging tailwind classes safely
canvas-confetti | For celebration effects when completing goals/chores

## Notes
Tailwind Config: Extend with custom colors for 'dino-green', 'coin-gold', 'alert-red'.
Fonts: Use 'Nunito' for body and 'Fredoka' for headings to give a playful look.
Auth: Replit Auth is used. If /api/me returns 404, user needs to complete onboarding.
Role-based Routing: Check `user.isParent` to redirect to /parent/* or /kid/* dashboards.
Currency: All amounts are stored in cents. Display helper needed to convert to $ dollars.
Assets: Use placeholders or Unsplash for now, styled to look like cartoons if possible.
