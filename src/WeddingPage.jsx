import { useState, useEffect, useRef } from "react";
import "./WeddingPage.css";
import pedida from "./assets/images/pedida.png"

// ─── CONFIG — EDIT THESE ──────────────────────────────────────────────────────
const CONFIG = {
  bride: "Mariana",
  groom: "Sergio",
  weddingDate: "1 de Agosto de 2026",
  weddingDateISO: "2026-08-01T14:00:00",
  weddingDay: "Sabado",
  ceremonyTime: "2:00 p.m.",
  receptionTime: "4:00 p.m.",
  dresscode: "Formal",
  rsvpDeadline: "Abril 06, 2026",
  venue: "Terra Serena",
  address: "Terra Serena, 25366 Arteaga, Coah.",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.3910814864944!2d-100.7678359241564!3d25.492000577522443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86881afa96595181%3A0xede249f443ecf482!2sTerra%20Serena!5e0!3m2!1ses!2smx!4v1774664435915!5m2!1ses!2smx",
  // ── COUPLE PHOTO ──────────────────────────────────────────────────────────
  // Replace with your photo URL, or import and reference the variable.
  // e.g.  import photo from "./couple.jpg";  →  couplePhotoUrl: photo
  couplePhotoUrl: pedida,
  // ── GOOGLE SHEETS ─────────────────────────────────────────────────────────
  // See GOOGLE SHEETS SETUP comment below.
  scriptUrl: "https://script.google.com/macros/s/AKfycbzUCuzfBWcauFSncOeECMoV0q7koqbzq_N5cRgnM2k7TTTOooEP5jA9lYJwhk4R3MDFSA/exec",
};

/*
  GOOGLE SHEETS SETUP
  ───────────────────
  1. Create a Google Sheet with columns:
     Timestamp | Name | Email | RSVP | Guests | Message

  2. Extensions → Apps Script → paste and save:

     function doPost(e) {
       var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var data = JSON.parse(e.postData.contents);
       sheet.appendRow([new Date(), data.name, data.email, data.rsvp, data.guests || 0, data.message || ""]);
       return ContentService
         .createTextOutput(JSON.stringify({ result: "success" }))
         .setMimeType(ContentService.MimeType.JSON);
     }

  3. Deploy → New deployment → Web App
     Execute as: Me  |  Who has access: Anyone
     Copy the Web App URL into CONFIG.scriptUrl above.

  ADDING YOUR PHOTO
  ─────────────────
  Set CONFIG.couplePhotoUrl to any hosted image URL:
    couplePhotoUrl: "https://your-cdn.com/couple.jpg"
  Or import locally:
    import photo from "./couple.jpg";
    then set  couplePhotoUrl: photo
*/

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setVis(true); obs.disconnect(); }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const h = () => {
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 80) {
          setActive(ids[i]);
          return;
        }
      }
      setActive(ids[0]);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return active;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function smooth(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── ORNAMENT ────────────────────────────────────────────────────────────────
function Ornament() {
  return (
    <div className="ornament">
      <div className="ornament__line ornament__line--left" />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1 L8.2 5.2 L13 7 L8.2 8.8 L7 13 L5.8 8.8 L1 7 L5.8 5.2 Z" fill="var(--tan)" />
      </svg>
      <div className="ornament__line ornament__line--right" />
    </div>
  );
}

// ─── COUNTDOWN ───────────────────────────────────────────────────────────────
function Countdown() {
  const [t, setT] = useState({});

  useEffect(() => {
    const tick = () => {
      const diff = new Date(CONFIG.weddingDateISO) - Date.now();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 });
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { v: t.d, l: "Dias" },
    { v: t.h, l: "Horas" },
    { v: t.m, l: "Min" },
    { v: t.s, l: "Seg" },
  ];

  return (
    <div className="countdown">
      {units.map(({ v, l }) => (
        <div key={l} className="countdown__unit">
          <div className="countdown__number">{String(v ?? 0).padStart(2, "0")}</div>
          <div className="countdown__label">{l}</div>
        </div>
      ))}
    </div>
  );
}

// ─── PRINTED PHOTO FRAME ─────────────────────────────────────────────────────
function PrintedPhoto() {
  const hasPhoto = Boolean(CONFIG.couplePhotoUrl);

  return (
    <div className="photo-frame">
      <div className="photo-frame__card">
        <div className={`photo-frame__image-area${hasPhoto ? "" : " photo-frame__image-area--placeholder"}`}>
          {hasPhoto ? (
            <img
              src={CONFIG.couplePhotoUrl}
              alt={`${CONFIG.bride} y ${CONFIG.groom}`}
              className="photo-frame__img"
            />
          ) : (
            <div className="photo-frame__placeholder-inner">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <circle cx="22" cy="20" r="10" fill="var(--tan-light)" opacity="0.7" />
                <circle cx="42" cy="20" r="10" fill="var(--tan-light)" opacity="0.7" />
                <path
                  d="M4 56 Q4 38 22 38 Q30 38 32 42 Q34 38 42 38 Q60 38 60 56"
                  fill="var(--tan-light)"
                  opacity="0.7"
                />
              </svg>
              <p className="photo-frame__placeholder-text">
                Add your photo in<br />CONFIG.couplePhotoUrl
              </p>
            </div>
          )}
          <div className="photo-frame__vignette" />
        </div>

        <div className="photo-frame__caption">
          <p className="photo-frame__caption-name">
            {CONFIG.bride} &amp; {CONFIG.groom}
          </p>
          <p className="photo-frame__caption-date">{CONFIG.weddingDate}</p>
        </div>

        <div className="photo-frame__tape" />
      </div>
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { id: "home",  label: "Inicio" },
  { id: "fecha", label: "Fecha" },
  { id: "lugar", label: "Lugar" },
  { id: "rsvp",  label: "Confirmar" },
];

function Navbar({ scrollY }) {
  const active   = useScrollSpy(["home", "fecha", "lugar", "rsvp"]);
  const [menuOpen, setMenuOpen] = useState(false);
  const solid = scrollY > 60;

  return (
    <>
      <nav className={`navbar ${solid ? "solid" : "transparent"}`}>
        <div className="navbar__inner">
          <button className="navbar__monogram" onClick={() => smooth("home")}>
            {CONFIG.bride[0]} &amp; {CONFIG.groom[0]}
          </button>

          {/* Desktop links */}
          <div className="navbar__links">
            {NAV_LINKS.map(({ id, label }) => (
              <button
                key={id}
                className={`navbar__link ${active === id ? "active" : ""}`}
                onClick={() => smooth(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menú"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`navbar__hamburger-bar ${menuOpen ? `open-${i}` : ""}`}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          {NAV_LINKS.map(({ id, label }) => (
            <button
              key={id}
              className={`navbar__mobile-link ${active === id ? "active" : ""}`}
              onClick={() => { smooth(id); setMenuOpen(false); }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── RSVP FORM ───────────────────────────────────────────────────────────────
function RSVPForm() {
  const [choice, setChoice] = useState(null);
  const [form,   setForm]   = useState({ name: "", email: "", guests: 1, message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | done

  const valid = form.name.trim() && form.email.trim();

  const handleSubmit = async () => {
    if (!valid) return;
    setStatus("sending");
    const payload = {
      name:    form.name,
      email:   form.email,
      rsvp:    choice,
      guests:  choice === "Yes" ? form.guests : 0,
      message: form.message,
    };
    try {
      await fetch(CONFIG.scriptUrl, {
        method:  "POST",
        mode:    "no-cors",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
    } catch (_) {
      // no-cors: request fires even if fetch appears to throw
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="rsvp-form__success">
        <div className="rsvp-form__success-icon">
          {choice === "Yes" ? "✓" : "–"}
        </div>
        <h3 className="rsvp-form__success-title">
          {choice === "Yes" ? "¡Hasta pronto!" : "Te extrañaremos."}
        </h3>
        <p className="rsvp-form__success-text">
          {choice === "Yes"
            ? "Tu confirmación fue recibida. ¡No podemos esperar a celebrar contigo!"
            : "Gracias por avisarnos. Los tendremos en mente ese día tan especial."}
        </p>
      </div>
    );
  }

  return (
    <div className="rsvp-form">
      <p className="rsvp-form__deadline">
        Confirma antes del <strong>{CONFIG.rsvpDeadline}</strong>
      </p>

      {/* Accept / Decline */}
      <div className="rsvp-form__choices">
        {[
          { v: "Yes", label: "Asisto con gusto" },
          { v: "No",  label: "No podré asistir" },
        ].map(({ v, label }) => (
          <button
            key={v}
            className={`rsvp-form__choice-btn ${choice === v ? "selected" : ""}`}
            onClick={() => setChoice(v)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Fields — shown once a choice is made */}
      {choice && (
        <div className="rsvp-form__fields">
          <div className="rsvp-form__field">
            <label className="rsvp-form__label">Nombre completo *</label>
            <input
              className="rsvp-form__input"
              value={form.name}
              placeholder="Tu nombre"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="rsvp-form__field">
            <label className="rsvp-form__label">Correo electrónico *</label>
            <input
              type="email"
              className="rsvp-form__input"
              value={form.email}
              placeholder="tu@correo.com"
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>

          {choice === "Yes" && (
            <div className="rsvp-form__field">
              <label className="rsvp-form__label">Personas confirmadas</label>
              <div className="rsvp-form__counter">
                <button
                  className="rsvp-form__counter-btn"
                  onClick={() => setForm((f) => ({ ...f, guests: Math.max(1, f.guests - 1) }))}
                >−</button>
                <span className="rsvp-form__counter-value">{form.guests}</span>
                <button
                  className="rsvp-form__counter-btn"
                  onClick={() => setForm((f) => ({ ...f, guests: Math.min(15, f.guests + 1) }))}
                >+</button>
              </div>
            </div>
          )}

          <div className="rsvp-form__field">
            <label className="rsvp-form__label">Mensaje para los novios</label>
            <textarea
              className="rsvp-form__textarea"
              value={form.message}
              placeholder="Escribe tus buenos deseos…"
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>

          <button
            className={`rsvp-form__submit ${valid ? "enabled" : "disabled"}`}
            onClick={handleSubmit}
            disabled={!valid || status === "sending"}
          >
            {status === "sending" ? "Enviando…" : "Confirmar asistencia"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function WeddingPage() {
  const scrollY = useScrollY();
  const [fechaRef, fechaVis] = useInView();
  const [lugarRef, lugarVis] = useInView();
  const [rsvpRef,  rsvpVis]  = useInView();

  return (
    <div className="wedding-page">
      <Navbar scrollY={scrollY} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="home" className="hero">
        <div className="hero__texture" />
        <div className="hero__glow" />

        <div className="hero__label">
          <p className="hero__save-the-date">Save the Date</p>
        </div>

        <div className="hero__photo-wrap">
          <PrintedPhoto />
        </div>

        <div className="hero__names">
          <div className="hero__divider">
            <div className="hero__divider-line" />
            <div className="hero__divider-diamond" />
            <div className="hero__divider-line" />
          </div>

          <h1 className="hero__title">
            {CONFIG.bride}
            <span className="hero__ampersand">&amp;</span>
            {CONFIG.groom}
          </h1>

          <div className="hero__divider">
            <div className="hero__divider-line" />
            <div className="hero__divider-diamond" />
            <div className="hero__divider-line" />
          </div>

          <p className="hero__date-text">
            {CONFIG.weddingDay} · {CONFIG.weddingDate}
          </p>

          <button className="hero__cta" onClick={() => smooth("rsvp")}>
            Confirmar asistencia
          </button>
        </div>

        <div className="hero__scroll-cue">
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* ── LA FECHA ─────────────────────────────────────────────────────── */}
      <section id="fecha" className="section section--white">
        <div className="section__inner" ref={fechaRef}>
          <div className={`reveal ${fechaVis ? "visible" : ""}`}>
            <p className="section__label">La Fecha</p>
            <h2 className="section__title">{CONFIG.weddingDay}, {CONFIG.weddingDate}</h2>
            <div className="section__ornament-wrap"><Ornament /></div>
          </div>

          <div className={`info-cards reveal delay-1 ${fechaVis ? "visible" : ""}`}>
            {[
              { icon: "○", label: "Ceremonia",  val: CONFIG.ceremonyTime },
              { icon: "◇", label: "Recepción",  val: CONFIG.receptionTime },
              { icon: "△", label: "Vestimenta", val: CONFIG.dresscode },
            ].map(({ icon, label, val }) => (
              <div key={label} className="info-card">
                <div className="info-card__icon">{icon}</div>
                <p className="info-card__label">{label}</p>
                <p className="info-card__value">{val}</p>
              </div>
            ))}
          </div>

          <div className={`reveal delay-2 ${fechaVis ? "visible" : ""}`}>
            <Countdown />
          </div>
        </div>
      </section>

      <div className="section__separator" />

      {/* ── EL LUGAR ─────────────────────────────────────────────────────── */}
      <section id="lugar" className="section section--cream">
        <div className="section__inner" ref={lugarRef}>
          <div className={`reveal ${lugarVis ? "visible" : ""}`}>
            <p className="section__label">El Lugar</p>
            <h2 className="section__title">{CONFIG.venue}</h2>
            <div className="section__ornament-wrap"><Ornament /></div>
            <p className="venue-address">{CONFIG.address}</p>
          </div>

          <div className={`map-wrap reveal delay-1 ${lugarVis ? "visible" : ""}`}>
            <iframe
              title="Venue Location"
              src={CONFIG.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className={`map-link-wrap reveal delay-2 ${lugarVis ? "visible" : ""}`}>
            <a
              className="map-link"
              href={`https://maps.google.com/?q=${encodeURIComponent(CONFIG.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir en Google Maps ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── RSVP ─────────────────────────────────────────────────────────── */}
      <section id="rsvp" className="section section--offwhite">
        <div className="section__inner--narrow" ref={rsvpRef}>
          <div className={`rsvp-header reveal ${rsvpVis ? "visible" : ""}`}>
            <p className="section__label">Confirmación</p>
            <h2 className="section__title">¿Nos acompañas?</h2>
            <Ornament />
          </div>
          <div className={`reveal delay-1 ${rsvpVis ? "visible" : ""}`}>
            <RSVPForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="footer">
        <p className="footer__names">{CONFIG.bride} &amp; {CONFIG.groom}</p>
        <p className="footer__date">{CONFIG.weddingDate}</p>
        <Ornament />
      </footer>
    </div>
  );
}
