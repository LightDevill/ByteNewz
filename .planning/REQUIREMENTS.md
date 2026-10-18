# Requirements: News

**Defined:** 2026-10-18  
**Core Value:** Frictionless discovery of high-signal external media links with instantaneous public access, crisp link previews, and engaging community discussions without platform bloat or heavy media hosting overhead.

## v1 Requirements

### Authentication & Account Security (AUTH)

- [ ] **AUTH-01**: User can register an account using email and password with client-side and server-side validation.
- [ ] **AUTH-02**: User can sign in and sign out securely using email and password.
- [ ] **AUTH-03**: User authentication session persists across page reloads and browser restarts via Supabase Auth tokens.
- [ ] **AUTH-04**: Public guests can browse without an account, but unauthenticated action triggers (like, comment, post) redirect to or prompt an authentication modal.
- [ ] **AUTH-05**: User password reset flow via email magic link.

### Content Discovery & Feed (FEED)

- [ ] **FEED-01**: Public, chronological (newest-first) feed accessible to all visitors without requiring authentication.
- [ ] **FEED-02**: Infinite scrolling dynamically fetches subsequent pages of link posts using stable keyset pagination (`created_at` cursor).
- [ ] **FEED-03**: Feed presents rich link preview cards containing external title, description, thumbnail/favicon, domain badge, creator attribution, and publication timestamp.
- [ ] **FEED-04**: Native embeds / players for supported rich platforms (YouTube video player embed, Instagram embed or responsive fallback card).
- [ ] **FEED-05**: Clicking external link source opens target URL in a new tab with `rel="noopener noreferrer"`.

### Link Post Management (POST)

- [ ] **POST-01**: Authenticated user can submit a new link post by providing an external URL and an optional text caption (up to 500 characters).
- [ ] **POST-02**: System automatically extracts or validates metadata (title, Open Graph image/thumbnail, provider) for supported external URLs.
- [ ] **POST-03**: Post creator can edit their post's caption at any time.
- [ ] **POST-04**: Post creator can delete their post, cascading or cleanly unlinking associated engagement artifacts.
- [ ] **POST-05**: Non-owners are strictly prevented from editing or deleting posts via Row Level Security (RLS) enforcement.

### Social Interaction & Threaded Discussions (SOCL)

- [ ] **SOCL-01**: Authenticated user can like and unlike any public post (toggle interaction).
- [ ] **SOCL-02**: Post displays aggregate like count, updateable optimistically for the active user.
- [ ] **SOCL-03**: Authenticated user can add a root-level comment to any public post.
- [ ] **SOCL-04**: Authenticated user can reply to existing comments to form a threaded hierarchy (up to 3 levels deep).
- [ ] **SOCL-05**: Users can delete their own comments (tombstoned as `[Comment deleted by user]` if replies exist to maintain thread integrity).
- [ ] **SOCL-06**: Any user (guest or authenticated) can copy a direct shareable permalink to a specific post with native Web Share API integration when available.

### Creator Profiles (PROF)

- [ ] **PROF-01**: User profile automatically initialized upon successful registration (display name, username handle, avatar placeholder).
- [ ] **PROF-02**: Authenticated user can edit their profile info (display name, bio up to 250 characters, external social handle).
- [ ] **PROF-03**: Public creator profile page displays creator metadata and a chronological list of posts submitted by that user.

### Moderation & Reporting (MODR)

- [ ] **MODR-01**: Authenticated user can report a post or comment with a categorized reason (spam, misleading, offensive, copyright, broken link).
- [ ] **MODR-02**: Duplicate reports by the same user on the same target are prevented by unique constraint.
- [ ] **MODR-03**: Reported items enter an administrative review queue without immediate automatic deletion.

### Administration & Oversight (ADMN)

- [ ] **ADMN-01**: Admin dashboard protected by database-enforced RBAC policy (accessible only to users with `admin` role).
- [ ] **ADMN-02**: Admin can inspect the queue of reported posts and comments with reason breakdown and reporter details.
- [ ] **ADMN-03**: Admin can dismiss reports or take down violating posts/comments.
- [ ] **ADMN-04**: Admin can inspect user accounts and ban/suspend malicious actors.
- [ ] **ADMN-05**: Admin actions are logged to an audit table (`admin_audit_logs`) for accountability.

---

## v2 Requirements (Deferred Beyond MVP)

### Follows & Custom Feeds
- **FOLW-01**: User can follow other creators.
- **FOLW-02**: Filtered "Following" feed tab alongside public discovery feed.

### Notifications
- **NOTF-01**: In-app notifications when another user likes or replies to creator's post.
- **NOTF-02**: Unread notification counter and badge in navigation bar.

### Enhanced Media & Rich Embeds
- **EMBD-01**: TikTok, Twitter/X, Spotify, and SoundCloud deep oEmbed integrations.
- **EMBD-02**: In-line link preview customization/refresh tool for creators.

### Search & Discovery Tags
- **SRCH-01**: Full-text search across captions, post titles, and domains.
- **SRCH-02**: Tagging system (#topics) with category filtering pills.

---

## Out of Scope (MVP)

| Feature | Reason |
|---------|--------|
| Direct image/video binary file uploads | High cloud storage cost and transcoding complexity; violates pure link-sharing architecture. |
| Follower/Following graph | Adds join overhead and diminishes immediate public content discovery in early community phase. |
| Algorithmic personalized feed | Chronological newest-first delivers transparent discovery with minimal query complexity. |
| Real-time direct messaging or chat | Asynchronous link discussions are sufficient; chat adds operational state management. |
| Live streaming | Heavy infrastructure requirements incompatible with link aggregator model. |
| Third-party OAuth providers (Google/GitHub) | Email/password is sufficient for MVP validation; OAuth adds multi-provider configuration. |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1: Foundation & Authentication | Pending |
| AUTH-02 | Phase 1: Foundation & Authentication | Pending |
| AUTH-03 | Phase 1: Foundation & Authentication | Pending |
| AUTH-04 | Phase 1: Foundation & Authentication | Pending |
| AUTH-05 | Phase 1: Foundation & Authentication | Pending |
| PROF-01 | Phase 1: Foundation & Authentication | Pending |
| PROF-02 | Phase 1: Foundation & Authentication | Pending |
| FEED-01 | Phase 2: Public Feed & Link Preview Engine | Pending |
| FEED-02 | Phase 2: Public Feed & Link Preview Engine | Pending |
| FEED-03 | Phase 2: Public Feed & Link Preview Engine | Pending |
| FEED-04 | Phase 2: Public Feed & Link Preview Engine | Pending |
| FEED-05 | Phase 2: Public Feed & Link Preview Engine | Pending |
| POST-01 | Phase 3: Post Creation, Editing & Creator Management | Pending |
| POST-02 | Phase 3: Post Creation, Editing & Creator Management | Pending |
| POST-03 | Phase 3: Post Creation, Editing & Creator Management | Pending |
| POST-04 | Phase 3: Post Creation, Editing & Creator Management | Pending |
| POST-05 | Phase 3: Post Creation, Editing & Creator Management | Pending |
| PROF-03 | Phase 3: Post Creation, Editing & Creator Management | Pending |
| SOCL-01 | Phase 4: Social Interactions & Threaded Discussions | Pending |
| SOCL-02 | Phase 4: Social Interactions & Threaded Discussions | Pending |
| SOCL-03 | Phase 4: Social Interactions & Threaded Discussions | Pending |
| SOCL-04 | Phase 4: Social Interactions & Threaded Discussions | Pending |
| SOCL-05 | Phase 4: Social Interactions & Threaded Discussions | Pending |
| SOCL-06 | Phase 4: Social Interactions & Threaded Discussions | Pending |
| MODR-01 | Phase 5: Reporting & Moderation Subsystem | Pending |
| MODR-02 | Phase 5: Reporting & Moderation Subsystem | Pending |
| MODR-03 | Phase 5: Reporting & Moderation Subsystem | Pending |
| ADMN-01 | Phase 6: Admin Dashboard & User Management | Pending |
| ADMN-02 | Phase 6: Admin Dashboard & User Management | Pending |
| ADMN-03 | Phase 6: Admin Dashboard & User Management | Pending |
| ADMN-04 | Phase 6: Admin Dashboard & User Management | Pending |
| ADMN-05 | Phase 6: Admin Dashboard & User Management | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✅

---
*Requirements defined: 2026-10-18*
*Last updated: 2026-10-18 after project initialization*
