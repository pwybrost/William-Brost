import { Link } from "react-router";
import { OwnerButton } from "../components/ui/OwnerButton";
import { AppWindow, WindowMessage } from "../components/shell/AppWindow";
import { PleaseWait } from "../components/shell/Loading";
import { ShopIcon } from "../components/win98/Icons";
import { useAuth } from "../context/AuthContext";
import { useEditMode } from "../context/EditModeContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useEditors } from "../features/editors/EditorsProvider";
import { ProfilePhoto } from "../features/home/ProfilePhoto";
import { ProductCard } from "../features/products/ProductCard";
import { ProjectCard } from "../features/projects/ProjectCard";
import { downloadUrl, mediaUrl } from "../lib/api";
import { OWNER_EMAIL } from "../lib/config";

/**
 * The main page: brand name, photo and bio side by side, account links and availability,
 * then products under the bio and a few featured projects.
 */
export function HomePage() {
  const { data, error, loading } = usePortfolio();
  const { editing } = useEditMode();
  const editors = useEditors();
  const { user, isAdmin } = useAuth();

  if (loading || error || !data) {
    return (
      <AppWindow title="William Brost">
        <WindowMessage>{error ? `Couldn't load the site: ${error}` : <PleaseWait />}</WindowMessage>
      </AppWindow>
    );
  }

  const { profile, socialLinks, products, projects } = data;
  const paragraphs = profile.bio.split(/\n\s*\n/).filter(Boolean);
  const cover = mediaUrl(profile.coverMediaId);
  const featured = (projects.filter((p) => p.featured).length ? projects.filter((p) => p.featured) : projects).slice(
    0,
    3,
  );
  const resumeHref = profile.resumeMediaId ? downloadUrl(profile.resumeMediaId) : profile.resumeUrl;
  // Signed in with the owner email but the server hasn't promoted the account yet.
  const ownerNotActive = !isAdmin && user?.email.toLowerCase() === OWNER_EMAIL;

  return (
    <AppWindow
      title="William Brost"
      status={[profile.availability || "Welcome", `${projects.length} project(s)`, `${products.length} product(s)`]}
    >
      {ownerNotActive && (
        <p role="alert" className="win-sunken mb-8 bg-note! px-4 py-3 text-[14px]">
          You're signed in as <b>{OWNER_EMAIL}</b> but the server hasn't made it the owner yet. Set{" "}
          <code>ADMIN_EMAIL={OWNER_EMAIL}</code> in <code>backend/.env</code> (or delete the line), restart the backend
          (<code>docker compose up --build</code> with Docker), then refresh.
        </p>
      )}

      {cover && (
        <div className="win-sunken mb-10 aspect-[4/1] animate-fade-up overflow-hidden p-[2px]">
          <img src={cover} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      {/* ---------- hero ---------- */}
      <section
        aria-labelledby="hero-name"
        className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"
      >
        <div className="animate-fade-up lg:sticky lg:top-0">
          <ProfilePhoto
            name={profile.fullName}
            mediaId={profile.avatarMediaId}
            editing={editing}
            onChange={(id) => editors.quickSaveProfile({ avatarMediaId: id })}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {profile.headline && <p className="eyebrow animate-fade-up">{profile.headline}</p>}
            <h1 id="hero-name" className="display text-6xl sm:text-7xl xl:text-8xl">
              <span className="inline-block animate-type">{profile.fullName}</span>
              <span className="ml-1 inline-block w-[0.08em] animate-blink bg-current align-baseline" aria-hidden>
                &nbsp;
              </span>
            </h1>
          </div>

          <div className="stagger flex flex-col gap-5">
            {paragraphs.length ? (
              paragraphs.map((p, i) => (
                <p key={i} className="prose-text" style={{ animationDelay: `${(i + 2) * 70}ms` }}>
                  {p}
                </p>
              ))
            ) : (
              <p className="prose-text">{editing ? "No bio yet. Click “Edit bio...” to write one." : ""}</p>
            )}
          </div>

          {(socialLinks.length > 0 || profile.contactEmail) && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Accounts">
              {socialLinks.map((l) => (
                <li key={l.id ?? l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="arrow-link">
                    {l.label}
                  </a>
                </li>
              ))}
              {profile.contactEmail && (
                <li>
                  <a href={`mailto:${profile.contactEmail}`} className="arrow-link">
                    Email
                  </a>
                </li>
              )}
            </ul>
          )}

          {/* availability bar */}
          <div className="win-sunken flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="flex items-center gap-2.5 text-[15px]">
              <span
                aria-hidden
                className={`size-2.5 rounded-full ${profile.availability ? "animate-blink bg-ok" : "bg-line"}`}
              />
              <span className="font-semibold">{profile.availability || "Say hello"}</span>
              {profile.location && <span className="text-muted">· {profile.location}</span>}
            </p>
            <Link to="/contact" className="arrow-link">
              Contact
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/projects" className="win-button-primary">
              View my work
            </Link>
            {resumeHref && (
              <a
                href={resumeHref}
                className="win-button"
                target={profile.resumeMediaId ? undefined : "_blank"}
                rel="noopener noreferrer"
              >
                Download resume
              </a>
            )}
            <Link to="/contact" className="win-button">
              Get in touch
            </Link>
          </div>

          {editing && (
            <div className="flex flex-wrap gap-2 border-t border-dashed border-line pt-4">
              <OwnerButton onClick={() => editors.editProfile("identity")}>Edit name & headline...</OwnerButton>
              <OwnerButton onClick={() => editors.editProfile("about")}>Edit bio...</OwnerButton>
              <OwnerButton onClick={editors.editLinks}>Edit links...</OwnerButton>
              <OwnerButton onClick={() => editors.editProfile("photos")}>Cover banner...</OwnerButton>
            </div>
          )}
        </div>
      </section>

      {/* ---------- products ---------- */}
      {(products.length > 0 || editing) && (
        <section aria-labelledby="products-title" className="mt-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Shop</p>
              <h2 id="products-title" className="display mt-2 text-4xl sm:text-5xl">
                Products
              </h2>
            </div>
            {editing && <OwnerButton onClick={() => editors.editProduct(null)}>New product...</OwnerButton>}
          </div>
          {products.length === 0 ? (
            <button
              type="button"
              onClick={() => editors.editProduct(null)}
              className="win-sunken flex w-full cursor-pointer items-center justify-center gap-3 py-12 text-[15px] text-muted hover:text-fg"
            >
              <ShopIcon /> Add your first product
            </button>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  editing={editing}
                  onEdit={() => editors.editProduct(p)}
                  onDelete={() => void editors.deleteProduct(p)}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ---------- featured work ---------- */}
      {featured.length > 0 && (
        <section aria-labelledby="work-title" className="mt-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 id="work-title" className="display mt-2 text-4xl sm:text-5xl">
                Featured
              </h2>
            </div>
            <Link to="/projects" className="arrow-link">
              All projects
            </Link>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                editing={editing}
                onEdit={() => editors.editProject(p)}
                onDelete={() => void editors.deleteProject(p)}
              />
            ))}
          </ul>
        </section>
      )}
    </AppWindow>
  );
}
