# Phone Landscape Battle

**Viewport:** `phone-landscape` (≈640–932 CSS px, landscape) — **preferred** mobile battle.

## No-scroll stack

Fixed to `100dvh` with overflow hidden:

1. Compact vitals top bar  
2. Enemy status + field  
3. Board / phase  
4. Player status + field  
5. Hand carousel  
6. Floating action dock  

Match Intel and Event Feed become absolute drawers (swipe or FAB/toggle), not stacked columns.

## Safe areas

Padding uses `env(safe-area-inset-*)` so notched phones keep dock and vitals clear of the home indicator.

## Preview

DevTools → rotate an iPhone preset to landscape, or Responsive ~844×390 / 932×430.
