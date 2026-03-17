# Kingdom Compliance Deploy Guide
## cantc-ulive.live | Lility LLC

### Files
- `compliance/cookie_banner.html` — Paste to every page `<body>`
- `compliance/privacy-policy.html` — Host at /privacy-policy.html
- `compliance/cookie-policy.html` — Host at /cookie-policy.html
- `moderation/moderation_agent_v2.py` — Backend hook on /upload
- `moderation/disclaimer.html` — Paste sticky to header/footer

### Backend Hook (Flask/Node)
```python
from moderation.moderation_agent_v2 import full_content_scan
# On every upload:
result = full_content_scan(image_bytes=file.read(), text=caption)
if result['status'] == 'BLOCKED':
    return 403, result['issues']
```

### Iubenda Fixes
- Cookie banner: DONE (Accept/Reject equal, prefs, CA link)
- Privacy policy: DONE (owner, third parties, rights)
- Cookie policy: DONE
- Trackers blocked til consent: DONE (JS)

### Laws Covered
- 18 U.S.C. § 2252/2252A (CSAM)
- 18 U.S.C. § 1591 (Sex Trafficking)
- 18 Pa.C.S. § 6312 (PA Child Exploitation)
- CPRA (California), PCDPA (Pennsylvania), GDPR-ready
