import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  blankItem,
  categories,
  MAX_UPLOAD,
  sections,
  validateItem,
} from "../../shared/content";
import ContentMedia from "../components/ContentMedia";
import "./Admin.css";

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    cache: "no-store",
    ...options,
  });
  const data = await response
    .json()
    .catch(() => ({ error: "The server returned an unexpected response." }));
  if (!response.ok) {
    const error = new Error(
      data.error || "Something went wrong. Please try again.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
const jsonOptions = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
function Icon({ name, ...props }) {
  const paths = {
    work: (
      <>
        <rect x="3" y="6" width="18" height="15" rx="2" />
        <path d="M8 6V3h8v3M3 12h18" />
      </>
    ),
    stories: (
      <>
        <path d="M21 11a8 8 0 0 1-8 8H6l-4 3V11a9 9 0 0 1 19 0Z" />
        <path d="M7 8h9M7 12h6" />
      </>
    ),
    brands: (
      <>
        <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="m14 5-7 7 7 7" />,
    external: (
      <>
        <path d="M14 3h7v7M21 3 10 14" />
        <path d="M10 3H3v18h18v-7" />
      </>
    ),
    logout: (
      <>
        <path d="M9 3H3v18h6M8 12h13m-5-5 5 5-5 5" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="1" />
        <path d="m3 17 6-6 4 4 3-3 5 5" />
      </>
    ),
    video: (
      <>
        <rect x="2" y="5" width="14" height="14" rx="2" />
        <path d="m16 10 6-4v12l-6-4" />
      </>
    ),
    text: <path d="M4 5h16M12 5v15M8 20h8" />,
    up: <path d="m6 14 6-6 6 6" />,
    down: <path d="m6 10 6 6 6-6" />,
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
function Field({ label, hint, children }) {
  const id = useId();
  const wire = (nodes) =>
    Children.map(nodes, (node) => {
      if (!isValidElement(node)) return node;
      if (["input", "select", "textarea"].includes(node.type))
        return cloneElement(node, {
          id,
          "aria-describedby": hint ? `${id}-hint` : undefined,
        });
      return node.props.children
        ? cloneElement(node, {}, wire(node.props.children))
        : node;
    });
  return (
    <div className="ma-field">
      <label htmlFor={id}>{label}</label>
      {wire(children)}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
function Login({ onLogin, error, busy }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false);
  return (
    <div className="ma-login">
      <div className="ma-login-art">
        <span className="ma-wordmark">
          mohor<span>media</span>
        </span>
        <div>
          <p className="ma-kicker">THE STUDIO DESK</p>
          <h1>
            Good work.
            <br />
            Ready to bloom.
          </h1>
          <p>
            A little space to keep your work,
            <br />
            your stories, and your people growing.
          </p>
        </div>
        <small>MOHOR MEDIA · CONTENT STUDIO</small>
      </div>
      <div className="ma-login-form">
        <div>
          <p className="ma-kicker">WELCOME BACK</p>
          <h2>Sign in to your studio</h2>
          <p>Manage what the world sees.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(email, password);
            }}
          >
            <Field label="Email">
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password">
              <div className="ma-password">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </Field>
            {error && (
              <p className="ma-error" role="alert">
                {error}
              </p>
            )}
            <button className="ma-btn ma-primary" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <a className="ma-back" href="/">
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
function Preview({ item, section }) {
  return (
    <article className={`ma-preview ma-preview--${section}`}>
      <ContentMedia
        key={`${item.kind}-${item.mediaUrl}-${item.posterUrl}`}
        item={item}
      />
      <div>
        {section === "work" && item.category !== "Other" && (
          <small>{item.category}</small>
        )}
        {section === "stories" && item.description && (
          <blockquote>“{item.description.replace(/^"|"$/g, "")}”</blockquote>
        )}
        <h3>{item.title || "Your title goes here"}</h3>
        {section !== "brands" && item.subtitle && <p>{item.subtitle}</p>}
        {section !== "stories" && item.description && <p>{item.description}</p>}
        {section === "work" && item.result && <strong>{item.result}</strong>}
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            {section === "work"
              ? "View project"
              : section === "brands"
                ? "Visit brand"
                : "Visit client"}{" "}
            ↗
          </a>
        )}
      </div>
    </article>
  );
}
export default function Admin() {
  const [data, setData] = useState(null),
    [signed, setSigned] = useState(false),
    [loading, setLoading] = useState(true);
  const [section, setSection] = useState("work"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const [editor, setEditor] = useState(null),
    [original, setOriginal] = useState(null),
    [step, setStep] = useState(0),
    [editorRevision, setEditorRevision] = useState(0);
  const [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [conflict, setConflict] = useState(false);
  const heading = useRef(null);
  const dirty = !!editor && JSON.stringify(editor) !== JSON.stringify(original);
  useEffect(() => {
    document.title = "Content Studio · Mohor Media";
    document.querySelector('meta[name="robots"]')?.remove();
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    api("/api/admin/content")
      .then((d) => {
        setData(d);
        setSigned(true);
      })
      .catch((e) => {
        if (e.status !== 401) setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => meta.remove();
  }, []);
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (editor) heading.current?.focus();
  }, [step, !!editor]);
  function fail(e) {
    setError(e.message);
    setConflict(e.status === 409);
    if (e.status === 401) setSigned(false);
  }
  async function login(email, password) {
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", jsonOptions("POST", { email, password }));
      setData(await api("/api/admin/content"));
      setSigned(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function leave() {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return false;
    setEditor(null);
    setError("");
    setConflict(false);
    return true;
  }
  function chooseSection(key) {
    if (!leave()) return;
    setSection(key);
    setQuery("");
    setFilter("all");
    setNotice("");
  }
  function open(item) {
    setEditor(structuredClone(item));
    setOriginal(structuredClone(item));
    setEditorRevision(data.revision);
    setStep(0);
    setNotice("");
    setError("");
    setConflict(false);
  }
  function update(key, value) {
    setEditor((prev) => ({ ...prev, [key]: value }));
    setError("");
  }
  async function save(status) {
    const candidate = { ...editor, status };
    const checked = validateItem(candidate, section);
    if (checked.error) {
      setError(checked.error);
      setStep(["mediaUrl", "alt", "posterUrl"].includes(checked.field) ? 1 : 0);
      return;
    }
    if (
      original.status === "published" &&
      status === "draft" &&
      !window.confirm(
        "Unpublish this item? It will be removed from the website and saved as a draft.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const next = await api(
        "/api/admin/content",
        jsonOptions("PUT", {
          section,
          item: checked.item,
          revision: editorRevision,
        }),
      );
      setData(next);
      setEditor(null);
      setQuery("");
      setFilter("all");
      setNotice(
        status === "published"
          ? `“${candidate.title}” is published on the website.`
          : `“${candidate.title}” saved as a draft.`,
      );
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function remove(item) {
    if (
      !window.confirm(
        `Delete “${item.title}”?${item.status === "published" ? " It will also be removed from the website." : ""} This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      setData(
        await api(
          "/api/admin/content",
          jsonOptions("DELETE", {
            section,
            id: item.id,
            revision: data.revision,
          }),
        ),
      );
      setNotice(`“${item.title}” deleted.`);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function move(item, offset) {
    const ids = data[section].map((i) => i.id),
      index = ids.indexOf(item.id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    setBusy(true);
    setError("");
    try {
      setData(
        await api(
          "/api/admin/content",
          jsonOptions("PATCH", { section, ids, revision: data.revision }),
        ),
      );
      setNotice("Display order updated.");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file, field) {
    if (!file) return;
    const accepted =
      field === "posterUrl" || editor.kind === "image"
        ? ["image/jpeg", "image/png", "image/webp"]
        : ["video/mp4", "video/webm"];
    if (!accepted.includes(file.type)) {
      setError("Choose a file that matches the selected media type.");
      return;
    }
    if (file.size > MAX_UPLOAD) {
      setError(
        "Files must be 4 MB or smaller. For longer videos, use a video link.",
      );
      return;
    }
    setUploading(true);
    setError("");
    try {
      const result = await api("/api/admin/uploads", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      update(field, result.url);
    } catch (e) {
      fail(e);
    } finally {
      setUploading(false);
    }
  }
  async function reload() {
    if (
      editor &&
      !window.confirm(
        "Reload the latest version? Your unsaved edits will be discarded.",
      )
    )
      return;
    setBusy(true);
    try {
      setData(await api("/api/admin/content"));
      setEditor(null);
      setConflict(false);
      setError("");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    if (!leave()) return;
    setBusy(true);
    try {
      await api("/api/admin/logout", { method: "POST" });
      setSigned(false);
      setData(null);
      setError("");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <div className="ma-loading" role="status">
        Opening your studio…
      </div>
    );
  if (!signed)
    return (
      <div className="ma">
        <Login onLogin={login} error={error} busy={busy} />
      </div>
    );
  const list = data[section],
    visible = list.filter(
      (i) =>
        (filter === "all" || i.status === filter) &&
        `${i.title} ${i.subtitle} ${i.description}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
  const noun =
    section === "work" ? "work" : section === "stories" ? "story" : "brand";
  const disabled = busy || uploading;
  return (
    <div className="ma ma-shell">
      <aside className="ma-sidebar">
        <a className="ma-wordmark" href="/" target="_blank" rel="noreferrer">
          mohor<span>media</span>
        </a>
        <p className="ma-kicker">CONTENT STUDIO</p>
        <nav aria-label="Admin sections">
          {Object.entries(sections).map(([key, label]) => (
            <button
              key={key}
              aria-current={key === section ? "page" : undefined}
              onClick={() => chooseSection(key)}
              disabled={disabled}
            >
              <Icon name={key} />
              <span>{label}</span>
              <small>{data[key].length}</small>
            </button>
          ))}
        </nav>
        <div className="ma-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            <Icon name="external" />
            View website
          </a>
          <button onClick={signOut} disabled={disabled}>
            <Icon name="logout" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="ma-main">
        <header className="ma-topbar">
          <span>
            YOUR STUDIO / <b>{sections[section]}</b>
          </span>
          <span className="ma-account">
            <i />
            Admin
          </span>
        </header>
        {editor ? (
          <>
            <div className="ma-editor-heading">
              <button className="ma-back" onClick={leave} disabled={disabled}>
                <Icon name="arrow" />
                Back to {sections[section].toLowerCase()}
              </button>
              <div className="ma-title-row">
                <div>
                  <p className="ma-kicker">
                    {original.title ? "EDIT" : "CREATE"} {noun.toUpperCase()}
                  </p>
                  <h1>
                    {original.title ||
                      `A new ${section === "work" ? "project" : noun}`}
                  </h1>
                </div>
                <span className="ma-badge">
                  {dirty
                    ? "Unsaved changes"
                    : original.status === "published"
                      ? "Published"
                      : "Draft"}
                </span>
              </div>
            </div>
            <ol className="ma-steps">
              {["Content", "Media", "Review"].map((label, index) => (
                <li key={label}>
                  <button
                    aria-current={step === index ? "step" : undefined}
                    disabled={disabled}
                    onClick={() => {
                      setStep(index);
                      setError("");
                    }}
                  >
                    <span>{index + 1}</span>
                    {label}
                  </button>
                </li>
              ))}
            </ol>
            {error && (
              <div className="ma-error" role="alert">
                {error}
                {conflict && (
                  <button onClick={reload} disabled={disabled}>
                    Reload latest
                  </button>
                )}
              </div>
            )}
            <div className="ma-editor-grid">
              <section className="ma-form-card">
                <h2 tabIndex={-1} ref={heading}>
                  {
                    [
                      "Tell the story",
                      "Choose how it looks",
                      "Ready for the website?",
                    ][step]
                  }
                </h2>
                <p className="ma-help">
                  {
                    [
                      "Start with the essentials. You can save a draft at any time.",
                      "Text, an image, or a playable video. Choose what fits this item.",
                      "Check your content, then publish it for everyone to see.",
                    ][step]
                  }
                </p>
                {step === 0 && (
                  <div className="ma-fields">
                    <Field
                      label={
                        section === "stories"
                          ? "Client name"
                          : section === "brands"
                            ? "Brand name"
                            : "Project title"
                      }
                    >
                      <input
                        maxLength={180}
                        value={editor.title}
                        onChange={(e) => update("title", e.target.value)}
                        autoComplete="off"
                      />
                    </Field>
                    {section !== "brands" && (
                      <Field
                        label={
                          section === "stories"
                            ? "Role & company (optional)"
                            : "Client / industry (optional)"
                        }
                      >
                        <input
                          maxLength={180}
                          value={editor.subtitle}
                          onChange={(e) => update("subtitle", e.target.value)}
                        />
                      </Field>
                    )}
                    <Field
                      label={
                        section === "stories"
                          ? "Client quote"
                          : "Description (optional)"
                      }
                    >
                      <textarea
                        rows={4}
                        maxLength={2500}
                        value={editor.description}
                        onChange={(e) => update("description", e.target.value)}
                      />
                    </Field>
                    {section === "work" && (
                      <div className="ma-pair">
                        <Field label="Service">
                          <select
                            value={editor.category}
                            onChange={(e) => update("category", e.target.value)}
                          >
                            {categories.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Result (optional)">
                          <input
                            placeholder="e.g. 40% more enquiries"
                            maxLength={180}
                            value={editor.result}
                            onChange={(e) => update("result", e.target.value)}
                          />
                        </Field>
                      </div>
                    )}
                    <Field
                      label="Website link (optional)"
                      hint="Opens in a new tab from the website."
                    >
                      <input
                        type="url"
                        placeholder="https://"
                        value={editor.link}
                        onChange={(e) => update("link", e.target.value)}
                      />
                    </Field>
                  </div>
                )}
                {step === 1 && (
                  <div className="ma-fields">
                    <fieldset className="ma-kind">
                      <legend>Content format</legend>
                      {["text", "image", "video"].map((kind) => (
                        <label key={kind}>
                          <input
                            type="radio"
                            name="kind"
                            value={kind}
                            checked={editor.kind === kind}
                            onChange={() => {
                              setEditor((prev) => ({
                                ...prev,
                                kind,
                                mediaUrl: "",
                                posterUrl: "",
                                alt: "",
                              }));
                              setError("");
                            }}
                            disabled={disabled}
                          />
                          <span>
                            <Icon name={kind} />
                            <b>
                              {kind === "text"
                                ? "Text only"
                                : kind === "image"
                                  ? "Image"
                                  : "Video"}
                            </b>
                            <small>
                              {kind === "text"
                                ? "Let the words lead"
                                : kind === "image"
                                  ? "A photo or brand logo"
                                  : "A film or testimonial"}
                            </small>
                          </span>
                        </label>
                      ))}
                    </fieldset>
                    {editor.kind === "text" ? (
                      <div className="ma-tip">
                        No media needed. Your text will appear in a card
                        designed for reading.
                      </div>
                    ) : (
                      <>
                        <Field
                          label={
                            editor.kind === "image"
                              ? "Upload image"
                              : "Upload short video"
                          }
                          hint={
                            editor.kind === "image"
                              ? "JPG, PNG or WebP · up to 4 MB"
                              : "MP4 or WebM · up to 4 MB. For larger videos, paste a link below."
                          }
                        >
                          <input
                            type="file"
                            accept={
                              editor.kind === "image"
                                ? "image/jpeg,image/png,image/webp"
                                : "video/mp4,video/webm"
                            }
                            disabled={disabled}
                            onChange={(e) => {
                              upload(e.target.files?.[0], "mediaUrl");
                              e.target.value = "";
                            }}
                          />
                        </Field>
                        {uploading && <p role="status">Uploading media…</p>}
                        <Field
                          label={
                            editor.kind === "image" ? "Image URL" : "Video URL"
                          }
                          hint={
                            editor.kind === "image"
                              ? "Upload above, or paste a direct HTTPS image link."
                              : "YouTube, Vimeo, or a direct HTTPS .mp4 / .webm link."
                          }
                        >
                          <input
                            value={editor.mediaUrl}
                            onChange={(e) => update("mediaUrl", e.target.value)}
                            placeholder="https://"
                            disabled={disabled}
                          />
                        </Field>
                        {editor.mediaUrl && (
                          <button
                            className="ma-text-button"
                            onClick={() => update("mediaUrl", "")}
                            disabled={disabled}
                          >
                            Remove media
                          </button>
                        )}
                        {editor.kind === "image" && (
                          <Field
                            label="Image description"
                            hint="Describe the image for people using a screen reader."
                          >
                            <input
                              value={editor.alt}
                              maxLength={180}
                              onChange={(e) => update("alt", e.target.value)}
                            />
                          </Field>
                        )}
                        {editor.kind === "video" && (
                          <details className="ma-details">
                            <summary>Video cover image (optional)</summary>
                            <Field label="Upload video cover">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={disabled}
                                onChange={(e) => {
                                  upload(e.target.files?.[0], "posterUrl");
                                  e.target.value = "";
                                }}
                              />
                            </Field>
                            <Field label="Cover image URL">
                              <input
                                value={editor.posterUrl}
                                onChange={(e) =>
                                  update("posterUrl", e.target.value)
                                }
                              />
                            </Field>
                          </details>
                        )}
                      </>
                    )}
                  </div>
                )}
                {step === 2 && (
                  <div className="ma-review">
                    <div>
                      <span>Section</span>
                      <strong>{sections[section]}</strong>
                    </div>
                    <div>
                      <span>Format</span>
                      <strong>
                        {editor.kind === "text" ? "Text only" : editor.kind}
                      </strong>
                    </div>
                    <div>
                      <span>Visibility after publishing</span>
                      <strong>Public · Homepage</strong>
                    </div>
                    <p className="ma-tip">
                      Publishing updates the website immediately on the next
                      visit or refresh. Open website tabs also check for changes
                      every 30 seconds.
                    </p>
                    {editor.status === "published" && (
                      <p>
                        This item is already live. Publishing will replace its
                        current content.
                      </p>
                    )}
                    <div className="ma-mobile-preview">
                      <Preview item={editor} section={section} />
                    </div>
                  </div>
                )}
              </section>
              <aside className="ma-preview-panel">
                <div className="ma-preview-label">
                  LIVE PREVIEW <span>Unsaved</span>
                </div>
                <Preview item={editor} section={section} />
                <p>
                  Preview of your content. The website adapts the layout to each
                  screen.
                </p>
              </aside>
            </div>
            <footer className="ma-editor-footer">
              <button
                className="ma-btn"
                disabled={disabled}
                onClick={() => save("draft")}
              >
                {busy
                  ? "Saving…"
                  : original.status === "published"
                    ? "Unpublish & save draft"
                    : "Save draft"}
              </button>
              <div>
                {step > 0 && (
                  <button
                    className="ma-btn"
                    disabled={disabled}
                    onClick={() => setStep(step - 1)}
                  >
                    Previous
                  </button>
                )}
                {step < 2 ? (
                  <button
                    className="ma-btn ma-primary"
                    disabled={disabled}
                    onClick={() => setStep(step + 1)}
                  >
                    Continue <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button
                    className="ma-btn ma-primary"
                    disabled={disabled}
                    onClick={() => save("published")}
                  >
                    {busy
                      ? "Publishing…"
                      : original.status === "published"
                        ? "Publish changes"
                        : "Publish to website"}
                  </button>
                )}
              </div>
            </footer>
          </>
        ) : (
          <>
            <div className="ma-page-heading">
              <div>
                <p className="ma-kicker">MAKE ROOM FOR GOOD WORK</p>
                <h1>{sections[section]}</h1>
                <p>
                  {section === "work"
                    ? "The projects that show what your studio can do."
                    : section === "stories"
                      ? "Real experiences, in your clients’ own words."
                      : "The people and brands growing alongside you."}
                </p>
              </div>
              <button
                className="ma-btn ma-primary"
                onClick={() => open(blankItem())}
                disabled={disabled}
              >
                <Icon name="plus" />
                Add {noun}
              </button>
            </div>
            <div className="ma-stats">
              <div>
                <strong>{list.length}</strong>
                <span>Total {section === "work" ? "projects" : section}</span>
              </div>
              <div>
                <strong>
                  {list.filter((i) => i.status === "published").length}
                </strong>
                <span>Published on website</span>
              </div>
              <div>
                <strong>
                  {list.filter((i) => i.status === "draft").length}
                </strong>
                <span>Drafts to grow</span>
              </div>
            </div>
            {notice && (
              <div className="ma-success" role="status">
                {notice}
                <a
                  href={`/${section === "brands" ? "" : "#mm-" + section}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View website ↗
                </a>
              </div>
            )}
            {error && (
              <div className="ma-error" role="alert">
                {error}
                {conflict && (
                  <button onClick={reload} disabled={disabled}>
                    Reload latest
                  </button>
                )}
              </div>
            )}
            <section
              className="ma-list-panel"
              aria-label={`${sections[section]} items`}
            >
              <div className="ma-toolbar">
                <input
                  type="search"
                  aria-label="Search items"
                  placeholder={`Search ${noun}…`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  aria-label="Filter by status"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
              <div className="ma-list-label">
                <span>
                  {visible.length} {visible.length === 1 ? "item" : "items"}
                </span>
                <span>Displayed in this order on the website</span>
              </div>
              {!visible.length ? (
                <div className="ma-empty">
                  <Icon name={section} width="34" height="34" />
                  <h2>
                    {list.length
                      ? "No matching items"
                      : `Your next ${noun} starts here`}
                  </h2>
                  <p>
                    {list.length
                      ? "Try a different search or status filter."
                      : "Add text, an image, or a video. Publish when you’re ready."}
                  </p>
                  {list.length ? (
                    <button
                      className="ma-btn"
                      onClick={() => {
                        setQuery("");
                        setFilter("all");
                      }}
                    >
                      Clear filters
                    </button>
                  ) : (
                    <button
                      className="ma-btn ma-primary"
                      onClick={() => open(blankItem())}
                    >
                      Add {noun}
                    </button>
                  )}
                </div>
              ) : (
                visible.map((item) => (
                  <article className="ma-item" key={item.id}>
                    <div className="ma-thumb">
                      {item.kind === "image" && item.mediaUrl ? (
                        <img src={item.mediaUrl} alt="" />
                      ) : item.posterUrl ? (
                        <img src={item.posterUrl} alt="" />
                      ) : (
                        <Icon name={item.kind} width="26" height="26" />
                      )}
                    </div>
                    <div className="ma-item-copy">
                      <h2>{item.title}</h2>
                      <p>
                        {item.kind === "text" ? "Text only" : item.kind}
                        {item.subtitle ? ` · ${item.subtitle}` : ""}
                      </p>
                      <span className={`ma-badge ma-badge--${item.status}`}>
                        {item.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="ma-item-actions">
                      <div className="ma-order">
                        <button
                          aria-label={`Move ${item.title} up`}
                          disabled={
                            disabled ||
                            list[0].id === item.id ||
                            !!query ||
                            filter !== "all"
                          }
                          onClick={() => move(item, -1)}
                        >
                          <Icon name="up" />
                        </button>
                        <button
                          aria-label={`Move ${item.title} down`}
                          disabled={
                            disabled ||
                            list.at(-1).id === item.id ||
                            !!query ||
                            filter !== "all"
                          }
                          onClick={() => move(item, 1)}
                        >
                          <Icon name="down" />
                        </button>
                      </div>
                      <button
                        className="ma-btn"
                        onClick={() => open(item)}
                        disabled={disabled}
                        aria-label={`Edit ${item.title}`}
                      >
                        Edit
                      </button>
                      <button
                        className="ma-delete"
                        onClick={() => remove(item)}
                        disabled={disabled}
                        aria-label={`Delete ${item.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
            <p className="ma-footnote">
              Drafts are private. Published items appear on the homepage. Empty
              sections hide automatically.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
