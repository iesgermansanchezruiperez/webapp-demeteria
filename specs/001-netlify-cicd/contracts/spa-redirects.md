# Contract: SPA Redirects (`public/_redirects`)

**Version**: 1.0.0 | **Feature**: `001-netlify-cicd`

## File Contract

| Property | Requirement |
|----------|-------------|
| Path (source) | `public/_redirects` |
| Path (deployed) | `dist/_redirects` |
| Filename extension | None |
| Encoding | UTF-8 |
| Line endings | LF |

## Content Contract

**MUST** contain exactly one non-empty line:

```text
/* /index.html 200
```

### Field Semantics (Netlify `_redirects` format)

| Field | Value | Meaning |
|-------|-------|---------|
| First token | `/*` | Match all paths |
| Second token | `/index.html` | Serve this file |
| Third token | `200` | HTTP 200 rewrite (URL unchanged) |

## Prohibited Variations

- MUST NOT use `301` or `302` (causes URL change)
- MUST NOT add additional redirect rules without spec amendment
- MUST NOT rename file to `_redirects.txt` or similar

## Verification

```bash
npm run build
test -f dist/_redirects
grep -Fx '/* /index.html 200' dist/_redirects
```

All commands MUST exit 0.
