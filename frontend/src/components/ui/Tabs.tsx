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

/** Windows "property sheet" tabs, used to split long editor forms into pages. */
export function Tabs<T extends string>({ tabs, value, onChange, label }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap items-end gap-0.5 border-b-2 border-silver-dark">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`label cursor-pointer px-3 ${
              active ? "bevel relative -mb-[2px] pt-2 pb-2.5" : "bg-body-light py-1.5 text-silver hover:text-phosphor"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
