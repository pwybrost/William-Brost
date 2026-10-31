import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface EditModeState {
  /** true only when the owner is signed in AND has edit mode switched on */
  editing: boolean;
  toggle: () => void;
}

const EditModeContext = createContext<EditModeState | null>(null);

/**
 * Lets the owner flip between "edit" and "view like a visitor".
 * This only hides/shows the edit controls; the API enforces permissions on its own.
 */
export function EditModeProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [on, setOn] = useState(true);

  return (
    <EditModeContext.Provider value={{ editing: isAdmin && on, toggle: () => setOn((v) => !v) }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error("useEditMode must be used inside <EditModeProvider>");
  return ctx;
}
