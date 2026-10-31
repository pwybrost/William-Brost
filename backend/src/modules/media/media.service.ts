import type { PoolClient } from "pg";
import { query } from "../../db/pool.js";

type Db = Pick<PoolClient, "query">;

const UNUSED = `
  NOT EXISTS (SELECT 1 FROM profile  p WHERE p.avatar_media_id = m.id OR p.cover_media_id = m.id)
  AND NOT EXISTS (SELECT 1 FROM projects pr WHERE pr.cover_media_id = m.id)
  AND NOT EXISTS (SELECT 1 FROM project_images pi WHERE pi.media_id = m.id)
`;

/** Deletes the given images if nothing references them any more. */
export async function deleteMediaIfUnused(db: Db, ids: (string | null | undefined)[]) {
  const list = ids.filter((id): id is string => Boolean(id));
  if (list.length === 0) return;
  await db.query(`DELETE FROM media m WHERE m.id = ANY($1::uuid[]) AND ${UNUSED}`, [list]);
}

/** Removes uploads that were never attached to anything (e.g. editor closed without saving). */
export async function cleanupOrphanMedia() {
  const { rowCount } = await query(
    `DELETE FROM media m WHERE m.created_at < now() - interval '1 day' AND ${UNUSED}`,
  );
  if (rowCount) console.log(`[media] removed ${rowCount} unused image(s)`);
}
