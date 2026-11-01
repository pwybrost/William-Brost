import { useState } from "react";
import type { FormEvent } from "react";
import { CheckboxField, DialogButtons, ErrorLine, SelectField, TextArea, TextField } from "../../components/ui/Field";
import { ImageUploader } from "../../components/ui/ImageUploader";
import { Modal } from "../../components/ui/Modal";
import { ShopIcon } from "../../components/win98/Icons";
import { api, errorMessage } from "../../lib/api";
import { PRODUCT_STATUS_LABELS, type Product, type ProductInput } from "../../lib/types";

interface Props {
  open: boolean;
  /** null = new product */
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: ProductInput = {
  name: "",
  tagline: "",
  price: "",
  url: "",
  mediaId: null,
  status: "available",
  published: true,
  sortOrder: 0,
};

/** Add or edit a product shown under the bio on Home (owner only). */
export function ProductEditor({ open, product, onClose, onSaved }: Props) {
  return (
    <Modal
      open={open}
      title={product ? `${product.name} Properties` : "New Product"}
      icon={<ShopIcon size={18} />}
      onClose={onClose}
      wide
    >
      {open && <ProductForm product={product} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function ProductForm({ product, onClose, onSaved }: Omit<Props, "open">) {
  const [form, setForm] = useState<ProductInput>(() =>
    product
      ? {
          name: product.name,
          tagline: product.tagline,
          price: product.price,
          url: product.url,
          mediaId: product.mediaId,
          status: product.status,
          published: product.published,
          sortOrder: product.sortOrder,
        }
      : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (product) await api.updateProduct(product.id, form);
      else await api.createProduct(form);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-[240px_1fr]">
      <ImageUploader
        label="Product photo"
        value={form.mediaId}
        onChange={(id) => set("mediaId", id)}
        aspect="aspect-square"
      />
      <div className="flex flex-col gap-4">
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          maxLength={100}
        />
        <TextArea
          label="Description"
          rows={3}
          placeholder="One or two lines about it."
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          maxLength={280}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Price"
            placeholder="₱1,200"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            maxLength={40}
          />
          <SelectField
            label="Status"
            value={form.status}
            options={PRODUCT_STATUS_LABELS}
            onChange={(v) => set("status", v)}
          />
        </div>
        <TextField
          label="Link (shop, order form, Instagram post...)"
          type="url"
          placeholder="https://..."
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <CheckboxField
            label="Published"
            hint="Drafts are only visible to you."
            checked={form.published}
            onChange={(v) => set("published", v)}
          />
          <TextField
            label="Order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
          />
        </div>
        <ErrorLine message={error} />
        <DialogButtons busy={busy} onCancel={onClose} okLabel={product ? "OK" : "Add product"} />
      </div>
    </form>
  );
}
