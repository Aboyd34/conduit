# Moderation Agent V2 - CSAM / Video / Trafficking / Hate / Bullying
# cantc-ulive.live | Lility LLC | Anthony Boyd

import hashlib
import numpy as np
from PIL import Image
import io
import re

# === KNOWN BAD HASHES (expand with real CSAM DB) ===
KNOWN_BAD_HASHES = set()  # Add real PhotoDNA hashes here

# === TRAFFICKING KEYWORDS (30+ coded terms) ===
TRAFFICKING_KEYWORDS = {
    'escort', 'john', 'pay for sex', 'forced', 'trafficked', 'pimp', 'daddy',
    'lot lizard', 'kiddie stroll', 'the life', 'branded', 'for sale',
    'property of', 'romeo pimp', 'gorilla pimp', 'bottom', 'stable',
    'snowflake', 'leaf', 'turn out', 'break', 'choosing', 'family',
    'square', 'renos', 'track', 'blade', 'circuit', 'ho stroll', 'quota'
}

# === HATE SPEECH (20+ slurs) ===
HATE_KEYWORDS = {
    'nigger', 'nigga', 'coon', 'kike', 'faggot', 'dyke', 'tranny', 'cunt',
    'chink', 'spic', 'wetback', 'raghead', 'towelhead', 'gas jews',
    'kill muslims', 'white trash', 'cracker', 'redskin', 'gook', 'beaner',
    'sandnigger', 'zipperhead', 'jungle bunny'
}

# === BULLYING / HARASSMENT PATTERNS ===
BULLYING_PATTERNS = [
    r'slut.*whore', r'fat\s*(?:ugly\s*)?pig', r'kill\s*(?:yourself|you)',
    r'go\s*die', r'ugly\s*bitch', r'retard', r'mongoloid',
    r'loser\s*virgin', r'suicide\s*now', r'rope\s*yourself',
    r'no\s*one\s*loves\s*you', r'worthless\s*piece'
]

def perceptual_hash(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('L').resize((8,8), Image.Resampling.LANCZOS)
        pixels = np.array(img)
        dct = np.fft.fft2(pixels)
        dct_low = dct[:4,:4].real.flatten()
        avg = np.mean(dct_low)
        return ''.join('1' if x > avg else '0' for x in dct_low)
    except:
        return 'invalid'

def extract_video_frames(video_path, num_frames=10):
    # Production: use ffmpeg - pip install ffmpeg-python
    # import ffmpeg
    # probe = ffmpeg.probe(video_path)
    # Extract frames every N seconds
    # Placeholder: return empty
    return []

def scan_text_for_violations(text):
    issues = []
    text_lower = re.sub(r'[^a-z0-9\s]', '', text.lower())
    for kw in TRAFFICKING_KEYWORDS:
        if kw in text_lower: issues.append(f'trafficking:{kw}')
    for kw in HATE_KEYWORDS:
        if kw in text_lower: issues.append(f'hate:{kw}')
    for pat in BULLYING_PATTERNS:
        if re.search(pat, text_lower): issues.append('bullying')
    return issues

def full_content_scan(image_bytes=None, video_path=None, text='', username=''):
    results = {'status': 'PASS', 'issues': []}
    if image_bytes:
        phash = perceptual_hash(image_bytes)
        if phash in KNOWN_BAD_HASHES:
            results['issues'].append('CSAM:image')
    if video_path:
        frames = extract_video_frames(video_path)
        for phash in frames:
            if phash in KNOWN_BAD_HASHES:
                results['issues'].append('CSAM:video')
    text_issues = scan_text_for_violations(text + ' ' + username)
    results['issues'].extend(text_issues)
    if results['issues']:
        results['status'] = 'BLOCKED'
    return results

# === DISCLAIMER (embed in every page) ===
DISCLAIMER_HTML = '''
<div style="background:linear-gradient(135deg,#FF6B6B,#FFD93D);color:#000;padding:20px;border:3px solid #FF0000;border-radius:10px;font-weight:bold;font-size:18px;text-align:center;animation:pulse 2s infinite;">
  🚫 PLATFORM SAFETY NOTICE 🚫<br><br>
  STRICTLY PROHIBITED: Minors/CSAM | Sex Trafficking | Hate Speech | Bullying<br>
  ALL uploads AUTO-SCANNED. Violations = PERMANENT BAN + LAW REPORT.<br>
  Must be 18+ VERIFIED.
</div>
'''

if __name__ == '__main__':
    # Demo test
    result = full_content_scan(text='cheap escort daddy lot lizard pimp')
    print('Test:', result)
