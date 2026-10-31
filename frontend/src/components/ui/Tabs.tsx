interface Tab<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}

/** Windows 98 "property sheet" tabs, used to split long editor forms into pages. */
export function Tabs<T extends string>({ tabs, value, onChange, label }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex flex-wrap items-end gap-0 border-b border-white shadow-[0_1px_#808080]"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === value}
          onClick={() => onChange(t.id)}
          className="win-tab"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
