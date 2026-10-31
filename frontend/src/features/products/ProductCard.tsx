import { OwnerButton } from "../../components/ui/OwnerButton";
import { ShopIcon } from "../../components/win98/Icons";
import { mediaUrl } from "../../lib/api";
import { PRODUCT_STATUS_LABELS, type Product } from "../../lib/types";

interface Props {
  product: Product;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** A product as a small window: photo, name, price, status, and a link out. */
export function ProductCard({ product, editing, onEdit, onDelete }: Props) {
  const img = mediaUrl(product.mediaId);
  const body = (
    <>
      <div className="win-sunken aspect-square overflow-hidden p-[2px]">
        {img ? (
          <img src={img} alt="" loading="lazy" className="lift-img h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center">
            <ShopIcon size={48} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-2 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-semibold">{product.name}</h3>
          {product.price && <span className="shrink-0 font-mono text-[14px]">{product.price}</span>}
        </div>
        {product.tagline && <p className="line-clamp-2 text-[14px] text-muted">{product.tagline}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className={`eyebrow ${product.status === "available" ? "text-ok!" : ""}`}>
            {product.status === "available" && "● "}
            {PRODUCT_STATUS_LABELS[product.status]}
          </span>
          {product.url && <span className="arrow-link">View</span>}
        </div>
      </div>
    </>
  );

  return (
    <li className={`lift win-raised relative flex flex-col p-[3px] ${product.published ? "" : "opacity-70"}`}>
      {!product.published && (
        <span className="absolute top-2 left-2 z-10 bg-danger px-2 text-[12px] font-bold text-white">Draft</span>
      )}
      {product.url ? (
        <a href={product.url} target="_blank" rel="noopener noreferrer" className="flex flex-1 flex-col">
          {body}
        </a>
      ) : (
        <div className="flex flex-1 flex-col">{body}</div>
      )}
      {editing && (
        <div className="flex gap-1 px-2 pb-2">
          <OwnerButton onClick={onEdit}>Edit...</OwnerButton>
          <OwnerButton onClick={onDelete}>Delete</OwnerButton>
        </div>
      )}
    </li>
  );
}
