# Rule: Security, Credential Protection & Secret Leak Prevention

**Rule ID:** `SEC-RULE-001`  
**Classification:** Critical Non-Negotiable Invariant  
**Applies To:** All Agents, Workflows, Git Operations, Terminal Commands, and Code Generators

---

## 1. Directive Overview & Zero-Trust Mandate

No AI agent, developer, script, or automated workflow may **ever** commit, stage, log, expose, or push sensitive data or secrets to GitHub or any remote repository. 

Sensitive data includes, but is not limited to:
- **API Keys & AI Tokens**: `GEMINI_API_KEY`, OpenAI keys, Anthropic keys, etc.
- **Database Credentials**: Database connection strings (`postgresql://`, `mongodb+srv://`, `mysql://`, etc.), database passwords, and service user credentials.
- **Cryptographic & Encryption Keys**: Private keys (`.pem`, `.key`, `id_rsa`), symmetric encryption keys, initialization vectors, and JWT secret tokens.
- **Service Account Credentials**: Firebase service account JSON files, Google Cloud IAM service account keys, AWS access keys / secret access keys, Azure tenant credentials.
- **Network / Peer Credentials**: WebRTC TURN/STUN server authentication secrets, session tokens, or private signaling tokens.

---

## 2. Mandatory Rules of Engagement for Agents

### Rule 2.1: Absolute Prohibition on Hardcoded Secrets
- Agents must **NEVER** write or embed plaintext API keys, tokens, database passwords, or cryptographic secrets inside source code files (`.ts`, `.tsx`, `.js`, `.json`, `.md`, `.yaml`, `.html`).
- If an agent generates mock data or examples, it must use explicit placeholders (e.g., `GEMINI_API_KEY=your_gemini_api_key_here` or `postgres://user:password@localhost:5432/dbname`) and clearly label them as dummy placeholders.

### Rule 2.2: Environment Variable Discipline & Isolation
- All sensitive credentials must be loaded at runtime exclusively through environment variables (e.g., `process.env.GEMINI_API_KEY`).
- Server-side secrets must be kept strictly within server boundaries (`app/api/*` or server-only libraries). They must **never** be prefixed with `NEXT_PUBLIC_` or passed into client-side component trees or bundles.
- Secret configuration must reside in `.env.local` (or deployment platform environment variable settings like Vercel/Cloudflare/Google Cloud).

### Rule 2.3: Mandatory `.gitignore` Integrity
- Before any Git operation (`git add`, `git commit`, `git push`), the `.gitignore` file must explicitly ignore all secret-bearing patterns:
  ```gitignore
  # Environment variable files
  .env
  .env.local
  .env.development.local
  .env.test.local
  .env.production.local
  *.env
  *.env.*

  # Keys, Certificates, and Credentials
  *.pem
  *.key
  *.crt
  *.cer
  *.pfx
  *.p12
  id_rsa*
  id_ed25519*
  secrets.*
  credentials*.json
  service-account*.json
  firebase-adminsdk*.json
  ```
- Agents must never run `git add -f` or override `.gitignore` rules on any sensitive file.

### Rule 2.4: Pre-Commit & Pre-Push Staging Audit
- Prior to creating a commit or pushing to any remote branch:
  1. The agent must inspect `git status` to verify that no `.env*` or credential files are staged.
  2. The agent must review the diff (`git diff --staged` or `git diff`) to confirm no secret strings, keys, or passwords are inadvertently present in code, comments, or test fixtures.
  3. Under no circumstances may an agent run `git add .` or `git add -A` without first inspecting untracked files.

### Rule 2.5: Terminal Command & Logging Sanitization
- Agents must never print, echo, or log live environment secrets to terminal logs, stdout, transcripts, or artifact files.
- Command executions such as `cat .env.local` or `echo $GEMINI_API_KEY` are strictly prohibited.

---

## 3. Incident Response & Secret Leak Containment

If a secret, private key, or credential is ever detected in a staged file or unpushed commit:
1. **Immediate Halt**: Cease all pending push operations immediately.
2. **Unstage & Remove**: Unstage the file immediately via `git reset HEAD <file>`. If committed locally, amend the commit (`git reset --soft HEAD~1`) and remove the secret.
3. **Cache Purge**: If a sensitive file was previously tracked, purge it from the Git tree without deleting the local file:
   ```bash
   git rm --cached <sensitive-file>
   ```
4. **User Alert**: Explicitly notify the user that a credential was identified, and advise immediate rotation/revocation of the compromised key at the upstream provider.
