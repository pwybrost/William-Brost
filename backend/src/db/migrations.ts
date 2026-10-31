/**
 * Ordered list of schema migrations. Never edit a migration that has already run;
 * add a new entry at the end instead.
 */
export const migrations: { id: string; sql: string }[] = [
  {
    id: "001_init",
    sql: /* sql */ `
      CREATE TABLE users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        display_name  TEXT NOT NULL,
        role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Images are stored in Postgres so the app needs no extra storage service.
      CREATE TABLE media (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mime_type  TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        data       BYTEA NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Single-row table holding the owner's profile.
      CREATE TABLE profile (
        id              SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        full_name       TEXT NOT NULL DEFAULT 'William Brost',
        headline        TEXT NOT NULL DEFAULT '',
        bio             TEXT NOT NULL DEFAULT '',
        location        TEXT NOT NULL DEFAULT '',
        contact_email   TEXT NOT NULL DEFAULT '',
        resume_url      TEXT NOT NULL DEFAULT '',
        skills          TEXT[] NOT NULL DEFAULT '{}',
        avatar_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
        cover_media_id  UUID REFERENCES media(id) ON DELETE SET NULL,
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      INSERT INTO profile (id) VALUES (1);

      CREATE TABLE social_links (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        label      TEXT NOT NULL,
        url        TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE projects (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title          TEXT NOT NULL,
        summary        TEXT NOT NULL DEFAULT '',
        description    TEXT NOT NULL DEFAULT '',
        tech_stack     TEXT[] NOT NULL DEFAULT '{}',
        cover_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
        featured       BOOLEAN NOT NULL DEFAULT false,
        sort_order     INTEGER NOT NULL DEFAULT 0,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE project_links (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        label      TEXT NOT NULL,
        url        TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX project_links_project_idx ON project_links(project_id);

      -- Work experience and education share one table, split by "kind".
      CREATE TABLE timeline_entries (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kind         TEXT NOT NULL CHECK (kind IN ('experience', 'education')),
        title        TEXT NOT NULL,
        organization TEXT NOT NULL DEFAULT '',
        location     TEXT NOT NULL DEFAULT '',
        start_date   TEXT NOT NULL DEFAULT '',
        end_date     TEXT NOT NULL DEFAULT '',
        description  TEXT NOT NULL DEFAULT '',
        sort_order   INTEGER NOT NULL DEFAULT 0
      );
    `,
  },
  {
    id: "002_portfolio_upgrade",
    sql: /* sql */ `
      -- Project type, details, and draft/published state.
      ALTER TABLE projects
        ADD COLUMN category  TEXT NOT NULL DEFAULT 'website'
          CHECK (category IN ('graphic_design', 'website', 'app', 'other')),
        ADD COLUMN role      TEXT NOT NULL DEFAULT '',
        ADD COLUMN year      TEXT NOT NULL DEFAULT '',
        ADD COLUMN status    TEXT NOT NULL DEFAULT 'completed'
          CHECK (status IN ('completed', 'in_progress', 'concept')),
        ADD COLUMN published BOOLEAN NOT NULL DEFAULT true;

      -- Image gallery per project (screenshots, design boards, mockups...).
      CREATE TABLE project_images (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        media_id   UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
        caption    TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX project_images_project_idx ON project_images(project_id);

      -- "Open to internships" style status shown on the profile.
      ALTER TABLE profile ADD COLUMN availability TEXT NOT NULL DEFAULT '';

      -- Certifications, awards and achievements join experience/education.
      ALTER TABLE timeline_entries DROP CONSTRAINT IF EXISTS timeline_entries_kind_check;
      ALTER TABLE timeline_entries ADD CONSTRAINT timeline_entries_kind_check
        CHECK (kind IN ('experience', 'education', 'achievement'));

      -- Contact form messages, readable only by the owner.
      CREATE TABLE messages (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name       TEXT NOT NULL,
        email      TEXT NOT NULL,
        subject    TEXT NOT NULL DEFAULT '',
        body       TEXT NOT NULL,
        user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
        is_read    BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX messages_created_idx ON messages(created_at DESC);
    `,
  },
];
