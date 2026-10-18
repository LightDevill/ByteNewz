# Roadmap: News (ByteNewz)

## Overview

News is developed across 6 tightly scoped, vertically sliced phases. The roadmap progresses from initial infrastructure, database schema, and authentication through the public discovery feed, authenticated link posting, social engagement mechanisms, community moderation, and finally the isolated administrative dashboard.

## Phases

- [x] **Phase 1: Foundation, Design System & Authentication** - Scaffold React/Vite/TS app, integrate Supabase Auth, build responsive theme/layout, user profiles, and session handling.
- [ ] **Phase 2: Public Feed, Keyset Pagination & Link Preview Embeds** - Build public newest-first feed with infinite scroll, OpenGraph/oEmbed card previews, and YouTube/Instagram player adapters.
- [ ] **Phase 3: Link Post Creation, Editing & Creator Profiles** - Enable authenticated link post creation with URL validation, metadata parsing, caption editing, post deletion, and public creator profile pages.
- [ ] **Phase 4: Social Interactions, Likes & Threaded Comments** - Implement optimistic post likes, multi-level threaded discussions (up to 3 levels deep), deletion tombstoning, and permalink/social sharing.
- [ ] **Phase 5: Reporting & Moderation Subsystem** - Implement user reporting modals for posts and comments, database constraints to prevent duplicate reports, and moderation queue schemas.
- [ ] **Phase 6: Admin Dashboard, User Management & Audit Logging** - Build isolated RBAC-protected admin portal for reviewing reports, taking down offending posts, banning/suspending accounts, and logging admin audit actions.

---

## Phase Details

### Phase 1: Foundation, Design System & Authentication
**Goal**: Establish the development workspace, client routing, modern responsive layout/navigation, Supabase configuration, PostgreSQL user profile schemas with RLS, and email/password authentication.  
**Depends on**: Nothing (Initial Phase)  
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, PROF-01, PROF-02  
**Success Criteria** (what must be TRUE):
  1. User can register with email and password and log in successfully; an auto-triggered profile row is created in `public.profiles`.
  2. Active user session persists across browser page reloads and terminates properly upon logging out.
  3. Public visitor can navigate the shell layout, view guest states, and encounter login prompts when attempting protected actions.
  4. Authenticated user can view and edit their own display name and bio on an account settings modal/page.
**Plans**: 3 plans

Plans:
- [x] 01-01: App scaffolding, routing, modern design system, navigation bar, and responsive layout shell.
- [x] 01-02: Supabase client integration, PostgreSQL `profiles` table with RLS, and database trigger on `auth.users`.
- [x] 01-03: Email/password authentication flow (signup, login, logout, password recovery, session provider, and profile editing).

---

### Phase 2: Public Feed, Keyset Pagination & Link Preview Embeds
**Goal**: Deliver a lightning-fast, public discovery experience with newest-first ordering, infinite scrolling via keyset pagination, and rich visual link previews (including YouTube and Instagram embeds).  
**Depends on**: Phase 1  
**Requirements**: FEED-01, FEED-02, FEED-03, FEED-04, FEED-05  
**Success Criteria** (what must be TRUE):
  1. Unauthenticated visitors can view the chronological feed immediately without login walls.
  2. Scrolling down seamlessly loads subsequent batches of posts using `created_at` cursor without jumping or duplicate items.
  3. External links render rich metadata preview cards (domain, title, thumbnail, description) and open target URLs in a safe new window (`rel="noopener noreferrer"`).
  4. YouTube links render interactive inline video players; Instagram links render platform-appropriate embed containers or structured cards.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Database `posts` schema, public RLS read policies, seed fixtures, and keyset pagination query API.
- [ ] 02-02: Infinite scroll feed component, Link Preview Card, YouTube/Instagram embed wrappers, and external link handling.

---

### Phase 3: Link Post Creation, Editing & Creator Profiles
**Goal**: Allow authenticated creators to submit link posts with custom captions, edit/delete their own submissions, and view creator profile portfolios.  
**Depends on**: Phase 2  
**Requirements**: POST-01, POST-02, POST-03, POST-04, POST-05, PROF-03  
**Success Criteria** (what must be TRUE):
  1. Authenticated user can submit a valid external URL with an optional caption up to 500 characters.
  2. System validates URL format and processes metadata extraction for rich rendering.
  3. Post owner can edit the post caption or delete the post; non-owners cannot edit or delete other users' posts (enforced by RLS).
  4. Visiting `/@username` or `/profile/:id` displays the creator's profile details and chronological list of their published posts.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Post creation modal/form, URL validator, metadata fetcher integration, and database RLS insert/update/delete policies.
- [ ] 03-02: Post edit/delete controls with confirmation dialogs, optimistic feed updates, and public creator profile view.

---

### Phase 4: Social Interactions, Likes & Threaded Comments
**Goal**: Provide lightweight engagement mechanics: one-click post liking, multi-tier nested discussions with tombstoning, and permalink/social sharing.  
**Depends on**: Phase 3  
**Requirements**: SOCL-01, SOCL-02, SOCL-03, SOCL-04, SOCL-05, SOCL-06  
**Success Criteria** (what must be TRUE):
  1. Authenticated user can toggle like/unlike on any post with instant optimistic count updates.
  2. Users can post top-level comments and nested replies up to 3 tiers deep.
  3. Deleting a comment with existing replies marks it as `[Comment deleted by user]` to avoid breaking downstream discussion threads.
  4. Clicking Share copies a permalink to the clipboard and triggers the native Web Share API on mobile devices.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Database schemas and RLS for `likes` and `comments` (with parent_id adjacency), toggle like mutation, and permalink sharing utility.
- [ ] 04-02: Threaded comment component tree, nested reply input, comment deletion tombstoning, and count aggregations.

---

### Phase 5: Reporting & Moderation Subsystem
**Goal**: Implement community reporting mechanisms so users can flag abusive, misleading, or broken links for administrative review.  
**Depends on**: Phase 4  
**Requirements**: MODR-01, MODR-02, MODR-03  
**Success Criteria** (what must be TRUE):
  1. Authenticated user can click "Report" on any post or comment and select a violation category with optional details.
  2. Database constraint prevents a user from reporting the same post/comment multiple times.
  3. Reported status is tracked in the database without immediately unpublishing content prior to admin inspection.
**Plans**: 1 plan

Plans:
- [ ] 05-01: `reports` table schema with unique constraints, report modal UI, submission mutation, and user feedback toast.

---

### Phase 6: Admin Dashboard, User Management & Audit Logging
**Goal**: Provide a secure administrative panel for triage of reports, content moderation (hiding/deleting violating posts/comments), user account suspension, and audit logging.  
**Depends on**: Phase 5  
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05  
**Success Criteria** (what must be TRUE):
  1. Admin dashboard route (`/admin`) is strictly protected by database RLS and route guards; unauthorized users receive a 403/Forbidden screen.
  2. Admin can browse all open reports with reason breakdowns and one-click actions: Dismiss Report or Takedown Content.
  3. Admin can view registered users, search by email/username, and toggle ban/suspend status.
  4. All administrative actions record an immutable row in `admin_audit_logs`.
**Plans**: 2 plans

Plans:
- [ ] 06-01: Admin RBAC schema (`user_roles`), `is_admin` security definer helper, admin RLS policies, and `admin_audit_logs` table.
- [ ] 06-02: Admin dashboard UI (Reports queue view, moderation action controls, user management table, and audit trail view).

---

## Progress

**Execution Order:**
Phases execute strictly in numeric sequence: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Design System & Authentication | 3/3 | Complete | 2026-10-18 |
| 2. Public Feed, Keyset Pagination & Link Preview Embeds | 0/2 | Not started | - |
| 3. Link Post Creation, Editing & Creator Profiles | 0/2 | Not started | - |
| 4. Social Interactions, Likes & Threaded Comments | 0/2 | Not started | - |
| 5. Reporting & Moderation Subsystem | 0/1 | Not started | - |
| 6. Admin Dashboard, User Management & Audit Logging | 0/2 | Not started | - |
