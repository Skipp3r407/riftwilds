# The Merchant's Secret — Lettering QA

## Rules

- NO HTML/DOM speech bubbles in the reader UI for visible dialogue  
- All balloons, captions, SFX, auction boards, and NEXT teaser baked into flattened page images  
- Structured JSON retained for a11y transcripts (`transcript` / `a11yTranscript` on each page)

## Balloon hygiene checklist

- Tails clear of faces and Spark’s eyes  
- Merchant speech elegant/controlled  
- Auction number boards via programmatic caption/SFX zones  
- Page numbers in corner overlay  

## Resume lettering-only

```bash
npm run comics:issue-006:letter -- --pages=1-38
npm run comics:issue-006:letter -- --force --pages=29
```
