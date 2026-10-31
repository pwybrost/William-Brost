import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useSystemDialog } from "../../components/win98/SystemDialog";
import { useEditMode } from "../../context/EditModeContext";
import { usePortfolio } from "../../context/PortfolioContext";
import { api, errorMessage } from "../../lib/api";
import type { Product, Profile, Project, ProjectCategory, TimelineEntry, TimelineKind } from "../../lib/types";
import { DisplayEditor } from "./DisplayEditor";
import { ProductEditor } from "./ProductEditor";
import { ProfileEditor, type ProfileTab } from "./ProfileEditor";
import { ProjectEditor } from "./ProjectEditor";
import { SocialLinksEditor } from "./SocialLinksEditor";
import { TimelineEditor } from "./TimelineEditor";

type Dialog =
  | { type: "profile"; tab: ProfileTab }
  | { type: "links" }
  | { type: "display" }
  | { type: "project"; project: Project | null; category: ProjectCategory }
  | { type: "timeline"; kind: TimelineKind; entry: TimelineEntry | null }
  | { type: "product"; product: Product | null }
  | null;

interface EditorsApi {
  editProfile: (tab?: ProfileTab) => void;
  editLinks: () => void;
  editDisplay: () => void;
  editProject: (project: Project | null, category?: ProjectCategory) => void;
  editTimeline: (kind: TimelineKind, entry: TimelineEntry | null) => void;
  editProduct: (product: Product | null) => void;
  /** saves one or two profile fields right away (quick photo buttons) */
  quickSaveProfile: (patch: Partial<Profile>) => Promise<void>;
  deleteProject: (p: Project) => Promise<boolean>;
  deleteEntry: (e: TimelineEntry) => Promise<void>;
  deleteProduct: (p: Product) => Promise<void>;
}

const Ctx = createContext<EditorsApi | null>(null);

/**
 * Hosts every owner editor dialog once for the whole desktop, so any window can open
 * them. Nothing here renders for visitors, and the API checks permissions on its own.
 */
export function EditorsProvider({ children }: { children: ReactNode }) {
  const { data, reload } = usePortfolio();
  const { editing } = useEditMode();
  const dialogs = useSystemDialog();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);
  const saved = () => void reload();

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await reload();
      return true;
    } catch (err) {
      await dialogs.error({ message: errorMessage(err) });
      return false;
    }
  };

  const value: EditorsApi = {
    editProfile: (tab = "identity") => setDialog({ type: "profile", tab }),
    editLinks: () => setDialog({ type: "links" }),
    editDisplay: () => setDialog({ type: "display" }),
    editProject: (project, category = project?.category ?? "website") =>
      setDialog({ type: "project", project, category }),
    editTimeline: (kind, entry) => setDialog({ type: "timeline", kind, entry }),
    editProduct: (product) => setDialog({ type: "product", product }),
    quickSaveProfile: async (patch) => {
      if (!data) return;
      await run(() => api.updateProfile({ ...data.profile, ...patch }));
    },
    deleteProject: async (p) => {
      const ok = await dialogs.confirm({
        title: "Confirm File Delete",
        message: `Delete "${p.title}"?\nThis can't be undone.`,
      });
      return ok ? run(() => api.deleteProject(p.id)) : false;
    },
    deleteEntry: async (e) => {
      if (await dialogs.confirm({ message: `Delete "${e.title}"?` })) await run(() => api.deleteTimeline(e.id));
    },
    deleteProduct: async (p) => {
      if (await dialogs.confirm({ title: "Confirm Delete", message: `Delete "${p.name}"?` }))
        await run(() => api.deleteProduct(p.id));
    },
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {editing && data && (
        <>
          <ProfileEditor
            open={dialog?.type === "profile"}
            profile={data.profile}
            initialTab={dialog?.type === "profile" ? dialog.tab : "identity"}
            onClose={close}
            onSaved={saved}
          />
          <SocialLinksEditor open={dialog?.type === "links"} links={data.socialLinks} onClose={close} onSaved={saved} />
          <DisplayEditor open={dialog?.type === "display"} profile={data.profile} onClose={close} onSaved={saved} />
          <ProjectEditor
            open={dialog?.type === "project"}
            project={dialog?.type === "project" ? dialog.project : null}
            defaultCategory={dialog?.type === "project" ? dialog.category : "website"}
            onClose={close}
            onSaved={saved}
          />
          <TimelineEditor
            open={dialog?.type === "timeline"}
            kind={dialog?.type === "timeline" ? dialog.kind : "experience"}
            entry={dialog?.type === "timeline" ? dialog.entry : null}
            onClose={close}
            onSaved={saved}
          />
          <ProductEditor
            open={dialog?.type === "product"}
            product={dialog?.type === "product" ? dialog.product : null}
            onClose={close}
            onSaved={saved}
          />
        </>
      )}
    </Ctx.Provider>
  );
}

export function useEditors() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEditors must be used inside <EditorsProvider>");
  return ctx;
}
