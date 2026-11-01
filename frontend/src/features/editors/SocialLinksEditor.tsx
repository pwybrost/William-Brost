import { useState } from "react";
import type { FormEvent } from "react";
import { DialogButtons, ErrorLine } from "../../components/ui/Field";
import { cleanLinks, LinkListEditor } from "../../components/ui/LinkListEditor";
import { Modal } from "../../components/ui/Modal";
import { GlobeIcon } from "../../components/win98/Icons";
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
    <Modal open={open} title="Account Links" icon={<GlobeIcon size={18} />} onClose={onClose} wide>
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
      <p className="text-[15px] text-muted">
        Links to your accounts: GitHub, LinkedIn, Behance, Instagram, anything. They show on Home and Contact. Add as
        many as you want.
      </p>
      <LinkListEditor label="Accounts" links={draft} onChange={setDraft} max={30} />
      <ErrorLine message={error} />
      <DialogButtons busy={busy} onCancel={onClose} />
    </form>
  );
}
