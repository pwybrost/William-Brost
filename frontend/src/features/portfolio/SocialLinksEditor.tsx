import { useState } from "react";
import type { FormEvent } from "react";
import { ErrorLine } from "../../components/ui/Field";
import { cleanLinks, LinkListEditor } from "../../components/ui/LinkListEditor";
import { Modal } from "../../components/ui/Modal";
import { api, errorMessage } from "../../lib/api";
import type { Link } from "../../lib/types";

interface Props {
  open: boolean;
  links: Link[];
  onClose: () => void;
  onSaved: () => void;
}

export function SocialLinksEditor({ open, links, onClose, onSaved }: Props) {
  return (
    <Modal open={open} title="EDIT ACCOUNT LINKS" onClose={onClose} wide>
      {open && <LinksForm links={links} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function LinksForm({ links, onClose, onSaved }: Omit<Props, "open">) {
  const [draft, setDraft] = useState<Link[]>(() => links.map((l) => ({ ...l })));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.updateSocialLinks(cleanLinks(draft));
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <p className="text-sm text-text">
        Links to your accounts: GitHub, LinkedIn, Instagram, email, anything. Add as many as you want.
      </p>
      <LinkListEditor label="Accounts" links={draft} onChange={setDraft} max={30} />
      <ErrorLine message={error} />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-lcd" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
