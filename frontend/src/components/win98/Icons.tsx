/** Small Windows 98 style icons drawn as SVG (no image files needed). */

interface IconProps {
  size?: number;
  className?: string;
}

const svg = (size: number, className = "") => ({
  width: size,
  height: size,
  viewBox: "0 0 32 32",
  shapeRendering: "crispEdges" as const,
  className: `inline-block shrink-0 ${className}`,
  "aria-hidden": true,
});

export function FolderIcon({ size = 32, className, open }: IconProps & { open?: boolean }) {
  return (
    <svg {...svg(size, className)}>
      <path d="M2 7h11l3 3h14v18H2z" fill="#d9b23c" stroke="#7a5a10" />
      {open ? (
        <path d="M5 14h26l-4 14H2z" fill="#fbe57a" stroke="#7a5a10" />
      ) : (
        <path d="M2 12h28v16H2z" fill="#fbe57a" stroke="#7a5a10" />
      )}
    </svg>
  );
}

export function CheckIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)} shapeRendering="geometricPrecision">
      <circle cx="16" cy="16" r="14" fill="#2fa83a" stroke="#0f5c17" strokeWidth="1.5" />
      <path
        d="M9 16.5l5 5 9-10"
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ErrorIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)} shapeRendering="geometricPrecision">
      <circle cx="16" cy="16" r="14" fill="#e3242b" stroke="#7a0a0e" strokeWidth="1.5" />
      <path d="M10.5 10.5l11 11M21.5 10.5l-11 11" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function WarningIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)} shapeRendering="geometricPrecision">
      <path d="M16 3l14 26H2z" fill="#ffd400" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="14.5" y="11" width="3" height="10" fill="#000" />
      <rect x="14.5" y="23" width="3" height="3" fill="#000" />
    </svg>
  );
}

export function KeyIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)} shapeRendering="geometricPrecision">
      <circle cx="16" cy="9" r="7" fill="#f2c200" stroke="#7a5a00" strokeWidth="1.5" />
      <circle cx="16" cy="8" r="2.5" fill="#fff" stroke="#7a5a00" />
      <path d="M14 15h4v14h-4zM18 21h4v2h-4zM18 25h3v2h-3z" fill="#f2c200" stroke="#7a5a00" />
    </svg>
  );
}

export function ComputerIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <rect x="4" y="3" width="24" height="18" fill="#c0c0c0" stroke="#000" />
      <rect x="7" y="6" width="18" height="12" fill="#1084d0" stroke="#404040" />
      <rect x="8" y="7" width="6" height="3" fill="#7fc4ff" />
      <rect x="12" y="21" width="8" height="3" fill="#808080" stroke="#000" />
      <rect x="3" y="24" width="26" height="5" fill="#c0c0c0" stroke="#000" />
      <rect x="22" y="26" width="4" height="1" fill="#2fa83a" />
    </svg>
  );
}

export function NotepadIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <rect x="6" y="3" width="20" height="26" fill="#fff" stroke="#000" />
      <rect x="6" y="3" width="20" height="4" fill="#1084d0" stroke="#000" />
      <path d="M9 11h14M9 15h14M9 19h14M9 23h9" stroke="#808080" />
    </svg>
  );
}

export function GlobeIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)} shapeRendering="geometricPrecision">
      <circle cx="16" cy="16" r="13" fill="#fff" stroke="#000" strokeWidth="1.5" />
      <ellipse cx="16" cy="16" rx="6" ry="13" fill="none" stroke="#000" strokeWidth="1.2" />
      <path d="M3 16h26M5.5 9h21M5.5 23h21" stroke="#000" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function CmdIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <rect x="2" y="5" width="28" height="22" fill="#000" stroke="#808080" />
      <rect x="2" y="5" width="28" height="4" fill="#000080" />
      <path d="M6 14l4 3-4 3" stroke="#c0c0c0" strokeWidth="1.5" fill="none" />
      <path d="M12 21h7" stroke="#c0c0c0" strokeWidth="1.5" />
    </svg>
  );
}

export function MailIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <rect x="3" y="7" width="26" height="18" fill="#fff" stroke="#000" />
      <path d="M3 7l13 10 13-10" fill="none" stroke="#000" />
      <rect x="22" y="9" width="5" height="5" fill="#e3242b" />
    </svg>
  );
}

export function PictureIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <rect x="3" y="5" width="26" height="22" fill="#fff" stroke="#000" />
      <rect x="5" y="7" width="22" height="18" fill="#7fc4ff" />
      <path d="M5 25l7-9 5 6 4-4 6 7z" fill="#2fa83a" />
      <circle cx="22" cy="11" r="2.5" fill="#ffd400" />
    </svg>
  );
}

export function CertificateIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)} shapeRendering="geometricPrecision">
      <rect x="3" y="5" width="26" height="18" fill="#fffbe6" stroke="#000" />
      <path d="M7 10h18M7 14h12" stroke="#808080" />
      <circle cx="22" cy="20" r="5" fill="#e3242b" stroke="#7a0a0e" />
      <path d="M19 24l-2 6 5-2 5 2-2-6" fill="#e3242b" stroke="#7a0a0e" />
    </svg>
  );
}

export function WindowsLogo({ size = 16, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <path d="M3 6l11-2v11H3z" fill="#e3242b" />
      <path d="M16 4l13-2v13H16z" fill="#2fa83a" />
      <path d="M3 17h11v11L3 26z" fill="#1084d0" />
      <path d="M16 17h13v13l-13-2z" fill="#ffd400" />
    </svg>
  );
}

export function PdfIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <path d="M7 2h13l6 6v22H7z" fill="#fff" stroke="#000" />
      <path d="M20 2v6h6" fill="#dfdfdf" stroke="#000" />
      <rect x="4" y="15" width="18" height="8" fill="#c8102e" />
      <path d="M6 17h2.5v1.5H7v2.5H6zM10 17h2l1 1v2l-1 1h-2zM15 17h3v1h-2v1h2v1h-2v1h-1z" fill="#fff" />
      <path d="M10 26h12" stroke="#808080" />
    </svg>
  );
}

export function GearIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)} shapeRendering="geometricPrecision">
      <path
        d="M14 3h4l1 4 3 1.5 3.5-2 3 3-2 3.5L28 16l3 1v4l-3 1-1.5 3 2 3.5-3 3-3.5-2L19 29l-1 3h-4l-1-3-3-1.5-3.5 2-3-3 2-3.5L4 20l-3-1v-4l3-1 1.5-3-2-3.5 3-3 3.5 2L13 7z"
        transform="scale(0.94) translate(1 0)"
        fill="#c0c0c0"
        stroke="#000"
        strokeWidth="1.2"
      />
      <circle cx="16" cy="16.5" r="5" fill="#1084d0" stroke="#000" strokeWidth="1.2" />
    </svg>
  );
}

export function InboxIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <path d="M3 18l5-12h16l5 12v9H3z" fill="#c0c0c0" stroke="#000" />
      <path d="M3 18h8l2 3h6l2-3h8" fill="none" stroke="#000" />
      <rect x="10" y="8" width="12" height="9" fill="#fff" stroke="#000" />
      <path d="M10 8l6 5 6-5" fill="none" stroke="#000" />
    </svg>
  );
}

export function ShopIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <path d="M5 11h22l-2 18H7z" fill="#ffd400" stroke="#000" />
      <path
        d="M11 13V8a5 5 0 0 1 10 0v5"
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
        shapeRendering="geometricPrecision"
      />
      <rect x="10" y="12" width="2" height="2" fill="#000" />
      <rect x="20" y="12" width="2" height="2" fill="#000" />
    </svg>
  );
}

export function HourglassIcon({ size = 32, className }: IconProps) {
  return (
    <svg {...svg(size, className)}>
      <rect x="7" y="3" width="18" height="3" fill="#808080" stroke="#000" />
      <rect x="7" y="26" width="18" height="3" fill="#808080" stroke="#000" />
      <path d="M9 6h14v4l-5 6 5 6v4H9v-4l5-6-5-6z" fill="#fff" stroke="#000" />
      <path d="M11 22l5-4 5 4v2H11z" fill="#d9b23c" />
      <path d="M12 9h8l-4 4z" fill="#d9b23c" />
    </svg>
  );
}

export function ThemeIcon({ size = 16, className, dark }: IconProps & { dark?: boolean }) {
  return (
    <svg {...svg(size, className)} shapeRendering="geometricPrecision">
      {dark ? (
        <path d="M20 4a12 12 0 1 0 8 19A10 10 0 0 1 20 4z" fill="#ffd400" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <>
          <circle cx="16" cy="16" r="6" fill="#ffd400" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M16 2v5M16 25v5M2 16h5M25 16h5M6 6l3.5 3.5M22.5 22.5 26 26M6 26l3.5-3.5M22.5 9.5 26 6"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  );
}
