# My Personal AI — secure AI backend setup

## What is in this folder
- `worker.js`: server-side AI endpoint. The browser never receives an AI provider key.
- `wrangler.jsonc`: Cloudflare Worker configuration with the Workers AI binding and a basic request limiter.
- The website UI is in `index.html`.

## Important status
The GitHub Pages website is static. Adding these files does **not** deploy a server or connect AI by itself. A Cloudflare Worker must be deployed and its URL added to the website's `AI_API_URL` setting. Until then the AI panel correctly says it is not connected.

## Deployment checklist (account owner / parent or guardian)
1. Sign in to Cloudflare and create a Worker project named `my-personal-ai-api`.
2. Deploy `worker.js` with the supplied Wrangler configuration, or create a Worker in the dashboard and paste the contents of `worker.js`.
3. In Worker settings, add the Workers AI binding named `AI`. The supplied config declares this binding.
4. Ensure the rate-limit binding is configured as `RATE_LIMITER` if the dashboard deployment path supports it. Cloudflare's built-in rate limits are approximate, not a strict global cap.
5. Deploy, then test the Worker endpoint with a harmless question from the actual website origin.
6. Set `AI_API_URL` in `index.html` to the exact deployed endpoint ending in `/api/chat`, commit the change, and wait for GitHub Pages to redeploy.

## Safety and privacy
- Never put provider secrets, account tokens, or passwords in this repository or browser JavaScript.
- This Worker uses the platform AI binding; it does not need a provider API key in the website.
- Only the GitHub Pages origin is allowed by the CORS/origin check.
- Requests are limited in size and question length; basic rate limiting is configured.
- Questions are sent to the AI service. Do not enter names, phone numbers, addresses, passwords, school IDs, or other private details.
- AI answers can be wrong. Review important information with a trusted adult.
- Free usage and model availability can change; check the provider dashboard before enabling usage or billing.

## End-to-end test plan after deployment
- [ ] Open the live GitHub Pages app over HTTPS.
- [ ] Confirm English and Urdu switching works.
- [ ] Submit a harmless English question and confirm an AI answer appears.
- [ ] Submit a harmless Urdu question and confirm an Urdu answer appears.
- [ ] Confirm empty input is rejected.
- [ ] Confirm an overlong question is rejected.
- [ ] Confirm requests from an unapproved origin are rejected.
- [ ] Confirm unsupported methods and non-JSON requests are rejected.
- [ ] Confirm repeated requests eventually receive a rate-limit response.
- [ ] Confirm the website still works offline for local features.
- [ ] Confirm no secret is present in browser source, Git history, or network responses.

A checklist is not a test report: mark tests only after running them against the deployed service.
