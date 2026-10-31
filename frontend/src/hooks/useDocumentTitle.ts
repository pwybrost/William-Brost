import { useEffect } from "react";

/** Sets the browser tab title, e.g. "Portfolio | William Brost". */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title === "William Brost" ? title : `${title} | William Brost`;
  }, [title]);
}
