# Conduit — Legal & Compliance

## Age Verification

Conduit requires age verification for all users before access is granted.

### Method
Conduit uses **AgeID** (ageid.com) for anonymous age verification. AgeID confirms a user is 18+ without revealing identity to Conduit. No name, date of birth, government ID, or personal data is transmitted to or stored by Conduit.

### How It Works
1. User completes age verification through AgeID
2. AgeID issues an anonymous verification token
3. That token is hashed and used to derive the user's cryptographic identity (keypair)
4. The token is stored in the user's browser localStorage only
5. Conduit servers never receive or store the token or any personal data

### COPPA Compliance
- Conduit does not knowingly collect data from users under 13
- Age verification is required before any data is created or transmitted
- No personal information is collected at any point
- Users under 18 are blocked from accessing the platform

### State Law Compliance
- Conduit's zero-knowledge architecture means it provably cannot store minor user data
- Age gate is enforced client-side and server-side
- Compliant with Pennsylvania, KOSA, and applicable US state age verification laws

## Data Storage

Conduit stores **zero** personally identifiable information:

| Data Type | Stored? |
|---|---|
| Name | ❌ Never |
| Email | ❌ Never |
| Phone | ❌ Never |
| IP Address | ❌ Never logged |
| Date of Birth | ❌ Never |
| Government ID | ❌ Never |
| Age Token | Browser localStorage only |
| Keypair | Browser localStorage only |
| Posts | Gateway RAM only (clears on restart) |

## Contact
For legal inquiries open a GitHub Issue marked [LEGAL].
