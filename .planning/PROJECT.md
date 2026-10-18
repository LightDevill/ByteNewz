# News (ByteNewz)

## What This Is

News is a responsive, link-based social media discovery platform designed for discovering and sharing rich external media content (such as YouTube videos, Instagram posts, articles, and audio links). It enables guest visitors to seamlessly explore a newest-first, infinitely scrolling feed without friction, while providing authenticated creators with lightweight link curation, creator profiles, engagement mechanics (likes, threaded discussions, sharing), personal post management, and robust administrative oversight.

## Core Value

Frictionless discovery of high-signal external media links with instantaneous public access, crisp link previews, and engaging community discussions without platform bloat or heavy media hosting overhead.

## Requirements

### Validated

(None yet — planning phase initialized)

### Active

- [ ] **Public Discovery**: Guests can browse a chronological (newest-first) infinite-scrolling feed of curated link posts without authentication.
- [ ] **External Link Support**: Deep link preview and embed support for YouTube, Instagram, and web links with captions.
- [ ] **Email/Password Auth**: Secure user registration, login, logout, and persistent session state powered by Supabase Auth.
- [ ] **Link Curation**: Authenticated users can create, edit, and delete their own link posts with custom captions.
- [ ] **Social Interactions**: Authenticated users can like/unlike posts, participate in multi-level threaded discussions, and generate share links.
- [ ] **Creator Profiles**: Public profile pages showcasing creator details, bio, and their published link posts.
- [ ] **Content Moderation & Reporting**: Community reporting workflow for flagging abusive or broken links.
- [ ] **Admin Dashboard**: Isolated, role-protected admin panel with capabilities for user account management, report triage, and content moderation/takedown.
- [ ] **Responsive Design**: Fast, fluid, modern web experience optimized across mobile, tablet, and desktop viewports.

### Out of Scope (MVP)

- Direct file/video/image uploads or self-hosted media storage — Excluded to eliminate high bandwidth/storage costs and storage infrastructure complexity.
- User following / follower relationship graph — Excluded to preserve a unified discovery feed and reduce relational join complexity for v1.
- Algorithmic / personalized feed ranking — Chronological (newest-first) feed provides predictable discovery with minimal computational overhead.
- Live streaming or WebSockets real-time direct chat — Unnecessary complexity for asynchronous link-sharing platform.
- OAuth / Social Logins (Google, GitHub, etc.) — Deferred to post-MVP to streamline core email/password auth flow.
- Monetization, tipping, or paywalls — Deferred to post-launch product iterations.

## Context

- **Repository**: `LightDevill/ByteNewz`
- **Application Environment**: Modern Single-Page Application (SPA) backed by Supabase Backend-as-a-Service (BaaS) and PostgreSQL.
- **Delivery Strategy**: Vertical MVP phase breakdown ensuring each phase is end-to-end verifiable with database migrations, Row Level Security (RLS) policies, and UI components.

## Constraints

- **Architecture**: Client-side SPA (React + TypeScript + Vite) paired with Supabase PostgreSQL and Supabase Auth.
- **Data Access & Security**: Strict PostgreSQL Row Level Security (RLS) mandatory on all tables; anon key for public read-only views, authenticated JWTs for mutations, and role-based access control (RBAC) for administrative routes and functions.
- **Media Ingestion**: Zero binary media storage on internal servers; all content displayed through external URL metadata, oEmbed, and third-party embeds (YouTube, Instagram, etc.).
- **Infrastructure**: Lightweight static hosting (Vercel, Netlify, or Cloudflare Pages) with zero custom long-running backend servers.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite + TypeScript | High development velocity, optimal static bundle performance, and type-safe schema generation from Supabase. | ⏳ Pending Approval |
| Supabase Auth & PostgreSQL | Out-of-the-box secure session management, built-in RLS for multi-tenant data isolation, and instantaneous relational query power. | ⏳ Pending Approval |
| Link Metadata Fetching via Serverless/Edge Function vs Client Scraper | External URLs frequently block browser CORS requests for Open Graph tags. An edge function or oEmbed provider is required for dependable rich previews. | ⏳ Needs Clarification |
| RBAC via `user_roles` table & RLS helper vs Supabase `app_metadata` | Storing roles in a dedicated table queried via `SECURITY DEFINER` function provides auditability and easy admin management without service-role key leaks in client. | ⏳ Pending Approval |
| Cursor/Keyset Pagination for Feed (`created_at`, `id`) | Offset pagination (`LIMIT/OFFSET`) suffers performance degradation and duplicate/skipped items in rapidly updating feeds. Keyset pagination ensures stable infinite scrolling. | ⏳ Pending Approval |
| Recursive Threaded Comments using parent-child adjacency with depth limit | Simpler to query and mutate than nested sets or complex tree triggers for MVP while accommodating 2–3 levels of nested replies. | ⏳ Pending Approval |

---
*Last updated: 2026-10-18 after GSD project initialization and MVP planning*
