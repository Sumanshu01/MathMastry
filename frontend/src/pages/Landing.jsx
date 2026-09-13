import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

/* ---------- animated counter hook ---------- */
function useCounter(target, duration = 2000, startCounting) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startCounting]);
  return count;
}

/* ---------- intersection observer hook ---------- */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ---------- floating math symbols ---------- */
const SYMBOLS = ["∑", "∫", "π", "√", "∞", "∂", "Δ", "θ", "α", "β", "γ", "λ", "≈", "≠", "±"];

/* ---------- course cards data ---------- */
const COURSES = [
  { icon: "📐", title: "Foundations of Pure Mathematics", level: "Beginner", category: "Pure Mathematics", fee: 140, color: "#6366f1" },
  { icon: "📊", title: "Probability & Inferential Statistics", level: "Intermediate", category: "Statistics", fee: 150, color: "#0ea5e9" },
  { icon: "📈", title: "Calculus I: Limits & Derivatives", level: "Advanced", category: "Calculus", fee: 175, color: "#10b981" },
  { icon: "🏆", title: "Olympiad Math & Problem Solving", level: "Elite", category: "Olympiad", fee: 210, color: "#f59e0b" },
  { icon: "🔢", title: "Advanced Algebra & Polynomials", level: "Advanced", category: "Algebra", fee: 160, color: "#ec4899" },
  { icon: "📏", title: "Euclidean & Analytic Geometry", level: "Intermediate", category: "Geometry", fee: 130, color: "#8b5cf6" },
];

/* ---------- features ---------- */
const FEATURES = [
  { icon: "🎓", title: "Expert Faculty", desc: "Learn from qualified mathematicians with degrees from top universities worldwide." },
  { icon: "📅", title: "Flexible Scheduling", desc: "Choose sessions that fit your timetable — morning, afternoon, or evening slots available." },
  { icon: "📊", title: "Real-Time Progress", desc: "Track every lesson, grade, and milestone with a live interactive dashboard." },
  { icon: "🏷️", title: "Sibling Discounts", desc: "Enroll siblings and get exclusive family discount rates approved by administration." },
  { icon: "🔔", title: "Smart Notifications", desc: "Stay informed with instant alerts for enrollment, grades, and course updates." },
  { icon: "🔒", title: "Secure Platform", desc: "Bank-grade JWT authentication, 2FA support, and fully encrypted session management." },
];

/* ---------- testimonials ---------- */
const TESTIMONIALS = [
  { name: "Priya S.", role: "Student", avatar: "PS", quote: "MathMastry transformed my understanding of calculus. I went from failing to scoring 94% in just 3 months!", rating: 5 },
  { name: "Dr. Marcus V.", role: "Faculty", avatar: "MV", quote: "The teacher dashboard makes it effortless to manage rosters, track progress, and update availability.", rating: 5 },
  { name: "Ravi K.", role: "Parent", avatar: "RK", quote: "Both my kids enrolled together and got a sibling discount. The platform is genuinely excellent.", rating: 5 },
];

export default function Landing() {
  const [statsRef, statsInView] = useInView();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const students = useCounter(1200, 2000, statsInView);
  const courses  = useCounter(24,   1500, statsInView);
  const teachers = useCounter(18,   1600, statsInView);
  const rating   = useCounter(98,   1800, statsInView);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-root">

      {/* ── Floating Math Symbols ── */}
      <div className="landing-floats" aria-hidden="true">
        {SYMBOLS.map((s, i) => (
          <span key={i} className="float-symbol" style={{ "--i": i }}>{s}</span>
        ))}
      </div>

      {/* ── Navbar ── */}
      <header className={`land-nav ${scrolled ? "land-nav--scrolled" : ""}`}>
        <div className="land-nav__inner">
          <a href="#hero" className="land-nav__brand">
            <span className="land-nav__sigma">∑</span>
            <span>MathMastry</span>
          </a>
          <nav className={`land-nav__links ${menuOpen ? "land-nav__links--open" : ""}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#courses"  onClick={() => setMenuOpen(false)}>Courses</a>
            <a href="#stats"    onClick={() => setMenuOpen(false)}>Impact</a>
            <a href="#about"    onClick={() => setMenuOpen(false)}>About</a>
          </nav>
          <div className="land-nav__cta">
            <Link to="/login" className="land-btn land-btn--ghost">Sign In</Link>
            <Link to="/register" className="land-btn land-btn--primary">Get Started</Link>
          </div>
          <button className="land-hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section id="hero" className="land-hero">
        <div className="land-hero__blob land-hero__blob--1" />
        <div className="land-hero__blob land-hero__blob--2" />
        <div className="land-hero__blob land-hero__blob--3" />

        <div className="land-hero__content">
          <div className="land-hero__badge">
            <span className="badge-dot" />
            Trusted by 1,200+ learners across 12 countries
          </div>

          <h1 className="land-hero__title">
            Master Mathematics<br />
            <span className="land-hero__gradient-text">with Confidence</span>
          </h1>

          <p className="land-hero__sub">
            A world-class online tutoring platform connecting passionate students with expert
            faculty — from foundational arithmetic to elite olympiad-level problem solving.
          </p>

          <div className="land-hero__actions">
            <Link to="/register" className="land-btn land-btn--primary land-btn--lg">
              Start Learning Free →
            </Link>
            <a href="#courses" className="land-btn land-btn--outline land-btn--lg">
              Explore Courses
            </a>
          </div>

          <div className="land-hero__trust">
            <div className="trust-avatars">
              {["A","B","C","D","E"].map((l,i) => (
                <div key={i} className="trust-av" style={{"--n": i}}>{l}</div>
              ))}
            </div>
            <p>Join <strong>1,200+ students</strong> already learning</p>
          </div>
        </div>

        <div className="land-hero__visual">
          <div className="hero-card hero-card--main">
            <div className="hcard-header">
              <span className="hcard-icon">📊</span>
              <div>
                <p className="hcard-title">My Progress</p>
                <p className="hcard-sub">Calculus I — Week 6</p>
              </div>
            </div>
            <div className="hcard-bar-wrap">
              <div className="hcard-bar"><div className="hcard-bar__fill" style={{ "--w": "78%" }} /></div>
              <span>78%</span>
            </div>
            <div className="hcard-stats">
              <div><strong>12</strong><small>Lessons Done</small></div>
              <div><strong>A+</strong><small>Current Grade</small></div>
              <div><strong>4</strong><small>Days Streak</small></div>
            </div>
          </div>

          <div className="hero-card hero-card--notify">
            <span>🎉</span>
            <div>
              <p>Enrollment Confirmed!</p>
              <small>Advanced Algebra · Starting Mon</small>
            </div>
          </div>

          <div className="hero-card hero-card--rating">
            <div className="rating-stars">★★★★★</div>
            <p>4.9 / 5 average rating</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section id="features" className="land-section land-features">
        <div className="land-section__inner">
          <div className="land-section__header">
            <span className="section-pill">Why MathMastry?</span>
            <h2>Everything you need to <span className="text-accent">excel</span></h2>
            <p>A complete ecosystem built for students, teachers, and administrators to thrive together.</p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div className="feature-card" key={i} style={{ "--delay": `${i * 0.08}s` }}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          COURSES
      ══════════════════════════════════════ */}
      <section id="courses" className="land-section land-courses">
        <div className="land-section__inner">
          <div className="land-section__header">
            <span className="section-pill">Our Curriculum</span>
            <h2>World-class <span className="text-accent">courses</span> for every level</h2>
            <p>From beginner foundations to elite competition-level mathematics — we have you covered.</p>
          </div>

          <div className="courses-grid">
            {COURSES.map((c, i) => (
              <div className="course-card" key={i} style={{ "--accent": c.color, "--delay": `${i * 0.07}s` }}>
                <div className="course-card__top">
                  <span className="course-icon">{c.icon}</span>
                  <span className="course-level">{c.level}</span>
                </div>
                <h3 className="course-title">{c.title}</h3>
                <span className="course-category">{c.category}</span>
                <div className="course-footer">
                  <strong className="course-fee">${c.fee}<small>/mo</small></strong>
                  <Link to="/register" className="course-enroll-btn">Enroll →</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="courses-cta">
            <Link to="/register" className="land-btn land-btn--primary land-btn--lg">
              View All 24 Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS
      ══════════════════════════════════════ */}
      <section id="stats" className="land-section land-stats" ref={statsRef}>
        <div className="stats-blob" />
        <div className="land-section__inner">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{students.toLocaleString()}+</span>
              <span className="stat-label">Students Enrolled</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{courses}+</span>
              <span className="stat-label">Active Courses</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{teachers}+</span>
              <span className="stat-label">Expert Faculty</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{rating}%</span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="land-section land-how">
        <div className="land-section__inner">
          <div className="land-section__header">
            <span className="section-pill">Simple Process</span>
            <h2>Get started in <span className="text-accent">3 easy steps</span></h2>
          </div>

          <div className="how-steps">
            {[
              { n: "01", title: "Create Your Account", desc: "Register in under 60 seconds. No credit card required to explore." },
              { n: "02", title: "Choose Your Course", desc: "Browse our curriculum, pick your level, and enroll with one click." },
              { n: "03", title: "Learn & Grow", desc: "Attend live sessions, track your progress, and achieve mastery." },
            ].map((s, i) => (
              <div className="how-step" key={i}>
                <div className="how-step__num">{s.n}</div>
                <div className="how-connector" />
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="land-section land-testimonials">
        <div className="land-section__inner">
          <div className="land-section__header">
            <span className="section-pill">Testimonials</span>
            <h2>Loved by <span className="text-accent">students & teachers</span></h2>
          </div>

          <div className="testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className="testi-card" key={i} style={{ "--delay": `${i * 0.1}s` }}>
                <div className="testi-stars">{"★".repeat(t.rating)}</div>
                <p className="testi-quote">"{t.quote}"</p>
                <div className="testi-author">
                  <div className="testi-avatar">{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ABOUT
      ══════════════════════════════════════ */}
      <section id="about" className="land-section land-about">
        <div className="land-section__inner land-about__inner">
          <div className="about-visual">
            <div className="about-card about-card--1">
              <span>∑</span>
              <p>Pure Mathematics</p>
            </div>
            <div className="about-card about-card--2">
              <span>∫</span>
              <p>Calculus</p>
            </div>
            <div className="about-card about-card--3">
              <span>π</span>
              <p>Geometry</p>
            </div>
            <div className="about-card about-card--4">
              <span>🏆</span>
              <p>Olympiad</p>
            </div>
            <div className="about-center-ring">
              <span>MathMastry</span>
            </div>
          </div>

          <div className="about-content">
            <span className="section-pill">About This Project</span>
            <h2>Built to make <span className="text-accent">math mastery</span> accessible</h2>
            <p>
              MathMastry is a full-stack educational platform designed to bridge the gap between
              talented students and qualified mathematics educators. Our mission is to make
              world-class math education accessible, structured, and enjoyable for everyone.
            </p>
            <p>
              The platform features a complete role-based ecosystem — <strong>students</strong> can
              browse and enroll in courses, track real-time progress, and apply for sibling
              discounts; <strong>teachers</strong> manage their course rosters and availability;
              and <strong>administrators</strong> oversee the entire platform with live analytics
              and full control over users, courses, and discount approvals.
            </p>

            <div className="about-tech">
              {["React 19", "Vite 8", "Node.js", "Express", "PostgreSQL", "Knex.js", "JWT Auth", "REST API"].map((t) => (
                <span key={t} className="tech-pill">{t}</span>
              ))}
            </div>

            <div className="about-highlights">
              <div className="about-hl">
                <span className="hl-icon">✅</span>
                <span>Full RBAC — Student, Teacher, Admin portals</span>
              </div>
              <div className="about-hl">
                <span className="hl-icon">✅</span>
                <span>Secure JWT + httpOnly cookie sessions</span>
              </div>
              <div className="about-hl">
                <span className="hl-icon">✅</span>
                <span>Real-time admin analytics & reports</span>
              </div>
              <div className="about-hl">
                <span className="hl-icon">✅</span>
                <span>Sibling discount request & review system</span>
              </div>
              <div className="about-hl">
                <span className="hl-icon">✅</span>
                <span>Two-factor authentication (2FA) support</span>
              </div>
              <div className="about-hl">
                <span className="hl-icon">✅</span>
                <span>11 Jest tests · Postman collection included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="land-cta">
        <div className="land-cta__blob" />
        <div className="land-cta__inner">
          <h2>Ready to begin your<br /><span className="text-accent">mathematics journey?</span></h2>
          <p>Join thousands of students mastering math with expert guidance.</p>
          <div className="land-cta__btns">
            <Link to="/register" className="land-btn land-btn--primary land-btn--lg">Create Free Account</Link>
            <Link to="/login" className="land-btn land-btn--ghost-white land-btn--lg">I Already Have an Account</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="land-footer">
        <div className="land-footer__inner">
          <div className="footer-brand">
            <span className="land-nav__sigma">∑</span>
            <strong>MathMastry</strong>
            <p>Empowering learners through expert-led mathematics education.</p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Platform</strong>
              <a href="#features">Features</a>
              <a href="#courses">Courses</a>
              <a href="#about">About</a>
            </div>
            <div>
              <strong>Access</strong>
              <Link to="/login">Student Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/forgot-password">Forgot Password</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 MathMastry. Built with React 19 + Node.js + PostgreSQL.</p>
        </div>
      </footer>

    </div>
  );
}
