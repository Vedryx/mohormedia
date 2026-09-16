# Mohor Media content studio

The Vite/React website and admin UI share Vercel Node functions and MongoDB. No Next.js migration or separate backend deployment is needed.

## Local use

1. `npm install`
2. `npm run db:start` — creates `mohormedia-mongodb`, bound only to `127.0.0.1:27020`, with a persistent Docker volume.
3. Set the variables below in `.env.local` (server-only). This local workspace already has generated credentials.
4. `npm run dev` — website http://localhost:5173, admin http://localhost:5173/admin. Use **localhost**, matching APP_ORIGIN.

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27020
MONGODB_DB=mohormedia_local
APP_ORIGIN=http://localhost:5173
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=use-a-unique-password-at-least-12-characters
ADMIN_JWT_SECRET=use-at-least-32-random-characters
```

No `VITE_` prefix on secrets. `npm run db:stop` stops Mohor's DB without deleting its data. Aproop's `aproop-mongodb-1` is stopped; its volume remains intact.

## Editing workflow

- Three collections: Featured work, Client stories, Brands we've helped bloom.
- Add/edit through Content → Media → Review, with a live preview on desktop and a review preview on mobile.
- Save draft at any step. Published content can explicitly be unpublished and saved as a draft.
- Text, image, and video are supported in all sections. Only relevant fields are shown.
- Images: upload JPG/PNG/WebP, or use a direct HTTPS image URL. Published images require accessible descriptions.
- Videos: upload MP4/WebM up to 4 MiB, or paste YouTube, Vimeo, or direct HTTPS MP4/WebM URLs. Hosted links must allow browser playback; private/unembeddable provider videos won't play. Video covers are optional.
- Upload limits intentionally stay below Vercel's 4.5 MB request/response limit. Larger uploads need object storage/direct uploads in a future change. See https://vercel.com/docs/errors/function_payload_too_large.
- Order arrows persist the public display order. Clear search/status filters to reorder.
- Delete asks for confirmation and removes the item from the website. Media blobs are retained to avoid breaking other items that reuse them; unreferenced uploads require later cleanup.
- Changes appear on the next page visit/refresh. Open pages refresh content on focus and every 30 seconds. Failed fetches keep the last successful content with a retry message, rather than restoring deleted content from a static fallback.
- Empty published sections hide automatically. The former `siteConfig.showFeaturedWork` switch no longer controls CMS work; publishing an item makes the section visible.

## Initial content

The first DB read seeds original content once. Four demo work samples are drafts, matching the previously hidden section. Three existing client quotes publish as text because the old image/video slots contained no real shared media. Three existing brand logos publish from `/public/clients`. Local browser image-slot selections are not shared assets and are not migrated.

## APIs

All routes are on the same origin. Mutation routes require matching Origin. Admin data/upload routes require the HttpOnly JWT cookie.

| Method   | Route                   | Purpose                                                        |
| -------- | ----------------------- | -------------------------------------------------------------- |
| POST     | /api/admin/login        | `{ email, password }`; sets admin cookie                       |
| POST     | /api/admin/logout       | Revokes session and clears cookie                              |
| GET      | /api/admin/content      | All sections and revision, including drafts                    |
| PUT      | /api/admin/content      | `{ section, revision, item }`; add/update one item             |
| DELETE   | /api/admin/content      | `{ section, revision, id }`                                    |
| PATCH    | /api/admin/content      | `{ section, revision, ids }`; complete section order           |
| POST     | /api/admin/uploads      | Raw file bytes, matching Content-Type; returns `{ url, type }` |
| GET      | /api/content            | Published items only                                           |
| GET/HEAD | /api/media?id=OBJECT_ID | Uploaded media, supports byte ranges for seeking               |

`section` is `work`, `stories`, or `brands`. Item schema is in `shared/content.js`. Saves use atomic compare-and-swap on revision. A stale editor gets HTTP 409, retains its edits, and offers an explicit reload.

Authentication uses eight-hour HS256 JWTs, server-side session revocation, credential-version invalidation, and a database-backed limit of ten sign-in attempts per 15-minute window. Production cookies are Secure; all cookies are HttpOnly and SameSite=Strict. No registration or public admin creation API. Media URLs are public to anyone who has the URL, including media uploaded to drafts; draft text/content is authenticated only.

## Verification

- `npm test`: schema/media checks and existing booking API regression checks, with external booking services mocked.
- `npm run test:e2e`: real browser + real APIs + MongoDB on port 27020. Uses a fresh `mohor_e2e_*` database and port 5175, cleaned afterward. Never uses the local review database.
- `npm run build`: static production build. `vite preview` alone does not run backend functions; use `npm run dev` for a complete local app or `vercel dev` for Vercel runtime verification.

## Future production setup

Set a separate production MongoDB database, APP_ORIGIN to the exact canonical HTTPS origin, and fresh admin credentials/JWT secret in Vercel. Keep the existing booking variables. Configure MongoDB network access/backups. Deploy and verify cookies, uploads, public content, and booking routing on the hosted runtime before promoting. This change is developed and tested locally; production has not been deployed.
