# Research & Architecture Analysis: News (ByteNewz)

**Domain:** Link-based Social Media Discovery Platform  
**Target Architecture:** React + TypeScript + Vite + Supabase (Auth, PostgreSQL, Row Level Security)  
**Date:** 2026-10-18  

---

## 1. Stack Evaluation & Recommended Dependencies

### Frontend Core
- **Framework:** React 18+ with TypeScript and Vite.
  - *Rationale:* Ultra-fast HMR, tiny production bundles, strong TypeScript inference, zero server overhead when deployed to static CDNs.
- **Routing:** `react-router-dom` v6+.
  - *Rationale:* Client-side navigation supporting dynamic parameters (`/@username`, `/post/:id`, `/admin`, `/login`), nested layouts, and route guards.
- **State Management & Data Fetching:** `@tanstack/react-query` v5.
  - *Rationale:* Built-in cache invalidation, optimistic mutations (for likes and comments), window focus refetching, and dedicated `useInfiniteQuery` with keyset cursors.
- **Styling:** Modern CSS / Tailwind CSS with custom design tokens.
  - *Rationale:* Clean responsive utilities, dark/light theme flexibility, sleek glassmorphism, and smooth micro-animations.
- **Icons:** `lucide-react`.
  - *Rationale:* Tree-shakable, consistent, modern stroke icons for social actions (Heart, MessageCircle, Share2, Shield, MoreHorizontal, Flag, ExternalLink).

### Backend & Database (Supabase)
- **Client Library:** `@supabase/supabase-js` v2.
  - *Rationale:* Universal Supabase client handling Auth sessions, real-time channels (optional future), and PostgreSQL REST queries with automatic JWT headers.
- **Database Engine:** PostgreSQL 15+ hosted on Supabase.
  - *Rationale:* Relational integrity, native JSONB support for rich OpenGraph metadata, indexing on foreign keys and timestamps, and database triggers for automated profile creation.

---

## 2. Core Architectural Patterns

### A. Keyset Pagination (Infinite Scroll)
- **Problem:** Conventional `OFFSET / LIMIT` pagination suffers performance degradation on large tables ($O(N)$ scanning) and causes duplicate/missing posts when new submissions occur while scrolling.
- **Solution:** Keyset cursor pagination using `(created_at, id)`.
  ```sql
  -- Keyset query pattern:
  SELECT * FROM posts
  WHERE (created_at, id) < ($cursor_created_at, $cursor_id)
  ORDER BY created_at DESC, id DESC
  LIMIT 20;
  ```
- **Composite Index:**
  ```sql
  CREATE INDEX idx_posts_feed ON posts (created_at DESC, id DESC);
  ```

### B. Link Preview & Rich Embed Pipeline
- **Problem:** Browsers enforce CORS (Cross-Origin Resource Sharing). A browser cannot send a raw `fetch('https://example.com/article')` to extract Open Graph `<meta>` tags due to origin restrictions.
- **Platforms:**
  - **YouTube:** Predictable URL format (`youtube.com/watch?v=ID`, `youtu.be/ID`). Can be parsed client-side to generate embedded iframes (`https://www.youtube-nocookie.com/embed/ID`) and thumbnail links (`https://img.youtube.com/vi/ID/hqdefault.jpg`) without CORS.
  - **Instagram:** Uses `instagram.com/p/ID` or `instagram.com/reel/ID`. Official Instagram oEmbed requires a Meta App Access Token. For MVP, we extract post ID and provide an iframe or clean external card fallback with direct external redirect.
  - **General Web Links:** Open Graph title, description, and preview image.
- **Recommended Architecture Options:**
  1. *Supabase Edge Function (Deno)*: Small, serverless endpoint (`/functions/v1/extract-metadata`) that accepts a target URL, fetches HTML on the backend, parses `<meta property="og:...">` tags, and returns JSON. Post creator triggers this upon submission.
  2. *Client-side Parser with Fallback*: For recognized domains (YouTube, Vimeo, GitHub), extract thumbnails/titles via public oEmbed or deterministic URLs. For general websites, user can manually supply/confirm the title, or use a lightweight public metadata API.

### C. Threaded Comments Architecture
- **Structure:** Adjacency list with `parent_id` foreign key referencing `comments(id)`.
- **Nesting Cap:** 3 levels of visual indentation (Root $\rightarrow$ Level 1 Reply $\rightarrow$ Level 2 Reply). Replies beyond Level 2 flatten into mentions (`@username`) at Level 2 to prevent mobile layout crushing.
- **Tombstoning Pattern:**
  When a user deletes a comment:
  - If the comment has child replies, the row is NOT deleted from SQL. Instead, `deleted_at = NOW()` and `content = '[Comment deleted by user]'`.
  - If the comment has no children, it is deleted or soft-deleted cleanly.

### D. Role-Based Access Control (RBAC) & Security Architecture
- **Supabase Auth Isolation:**
  - All public feeds and read queries use the `anon` public key.
  - Protected operations require an authenticated session token.
- **Admin Privilege Verification:**
  - Avoid storing role flags in client-accessible user profiles where users could update their own records.
  - Create a dedicated `user_roles` table:
    ```sql
    CREATE TABLE user_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'moderator', 'admin'))
    );
    ```
  - Create a Postgres `SECURITY DEFINER` function:
    ```sql
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS BOOLEAN AS $$
      SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
      );
    $$ LANGUAGE sql SECURITY DEFINER;
    ```
  - RLS policies on `reports`, `admin_audit_logs`, and moderation actions invoke `is_admin()`.

---

## 3. Database Schema Blueprint

```
+------------------+       +-------------------+       +--------------------+
|  auth.users      |       |  public.profiles  |       |  public.user_roles |
|  (Supabase Auth) |<------|  id (UUID PK)     |       |  user_id (UUID FK) |
+------------------+       |  username         |       |  role (admin/user) |
         |                 |  display_name     |       +--------------------+
         |                 |  bio, avatar_url  |
         |                 +-------------------+
         |                           |
         +--------------------+------+
                              |
                     +-----------------+
                     |  public.posts   |
                     |  id (UUID PK)   |
                     |  user_id (FK)   |
                     |  url (TEXT)     |
                     |  title, desc    |
                     |  thumbnail_url  |
                     |  caption (TEXT) |
                     |  likes_count    |
                     |  comments_count |
                     |  created_at     |
                     +-----------------+
                         |         |
           +-------------+         +---------------+
           |                                       |
+---------------------+                 +---------------------+
|  public.likes       |                 |  public.comments    |
|  user_id (UUID FK)  |                 |  id (UUID PK)       |
|  post_id (UUID FK)  |                 |  post_id (UUID FK)  |
|  created_at         |                 |  user_id (UUID FK)  |
|  (UNIQUE PK pair)   |                 |  parent_id (UUID FK)|
+---------------------+                 |  content (TEXT)     |
                                        |  deleted_at         |
                                        |  created_at         |
                                        +---------------------+
                                                   |
                                        +---------------------+
                                        |  public.reports     |
                                        |  id (UUID PK)       |
                                        |  reporter_id (FK)   |
                                        |  post_id / comm_id  |
                                        |  reason (TEXT)      |
                                        |  status (pending..) |
                                        +---------------------+
```

---

## 4. Key Security & Compliance Requirements

1. **Row Level Security (RLS) Enforced Universally:**
   - Every single table in `public` schema has `ENABLE ROW LEVEL SECURITY`.
   - Explicit `SELECT` policies for public content.
   - Strict `INSERT / UPDATE / DELETE` policies matching `auth.uid() = user_id`.
2. **Input Sanitization & Safe External Links:**
   - Strict URL scheme validation (`https://` or `http://` only; reject `javascript:`, `data:`, `file:`).
   - All external anchor tags must render with `rel="noopener noreferrer"` and `target="_blank"`.
   - Prevent XSS by rendering captions as sanitized text.
3. **Report Rate Limiting & Anti-Abuse:**
   - Unique index `CREATE UNIQUE INDEX idx_reports_post_user ON reports(post_id, reporter_id) WHERE post_id IS NOT NULL;` prevents flood-reporting.
4. **Admin Protection:**
   - Client routes under `/admin` check user role before mounting.
   - Backend APIs and RLS check `is_admin()` so direct database queries by non-admins are rejected by PostgreSQL regardless of frontend manipulation.

---

## 5. Identified Technical Risks & Mitigation Plan

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| **CORS blocking client-side link metadata scraping** | High | High | Leverage YouTube/Instagram dedicated embed patterns client-side; use Supabase Edge Function or reliable OpenGraph scraping endpoint for arbitrary web URLs. |
| **Comment recursion depth causing UI overflow** | Medium | Medium | Cap visual nesting at 3 indentation levels. Sub-replies at level 3 render with inline `@username` mentions rather than infinite margin indentation. |
| **Feed duplicate items during rapid posting** | Medium | Medium | Keyset cursor pagination `(created_at, id)` guarantees idempotent windowing irrespective of concurrent inserts. |
| **Malicious link submissions (phishing/malware)** | High | Medium | Reporting workflow with violation categorization, admin takedown controls, and clear domain badges on all preview cards. |
| **Accidental admin privilege escalation** | Critical | Low | Role stored in isolated `user_roles` table with read-only access for regular users; queries gated by `SECURITY DEFINER` function. |
