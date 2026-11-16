import { useEffect, useState } from 'react';
import './City10K.css';

const raceDate = new Date('2027-03-14T09:00:00');
const faqItems = [
  ['Can beginners take part?', 'Yes. The course is flat and there is a 90-minute time limit, so walking is welcome.'],
  ['How much does registration cost?', 'Entry is 35 EUR before 1 February and 45 EUR after. Students pay 25 EUR.'],
  ['Can I transfer my bib to someone else?', 'Transfers are allowed up to 14 days before the race by emailing the organisers.'],
  ['Is there a refund policy?', 'Refunds are available until 1 month before the event, minus a 5 EUR processing fee.']
];
const stats = [{ value: 10, label: 'Kilometres' }, { value: 2500, label: 'Expected Runners' }, { value: 6, label: 'Water Stations' }, { value: 1200, label: 'Charity Funds (EUR)' }];

export default function City10K({ onBack }: { onBack: () => void }) {
  const [now, setNow] = useState(Date.now());
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [topVisible, setTopVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const onScroll = () => { setScrolled(window.scrollY > 50); setTopVisible(window.scrollY > 500); };
    window.addEventListener('scroll', onScroll);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('stats')) {
          const start = performance.now();
          const animate = (time: number) => {
            const p = Math.min((time - start) / 1800, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCounts(stats.map(s => Math.floor(s.value * eased)));
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.15 });
    document.querySelectorAll('.run-reveal, .run-stats').forEach(el => observer.observe(el));
    return () => { window.clearInterval(timer); window.removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, []);

  const diff = Math.max(0, raceDate.getTime() - now);
  const countdown = [
    Math.floor(diff / 86400000),
    Math.floor((diff % 86400000) / 3600000),
    Math.floor((diff % 3600000) / 60000),
    Math.floor((diff % 60000) / 1000)
  ];
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const age = Number(data.get('age'));
    const category = String(data.get('category') || '');
    const next = {
      name: name.split(/\s+/).length < 2,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      age: !Number.isFinite(age) || age < 10 || age > 99,
      category: !category
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      const first = Object.keys(next).find(k => next[k as keyof typeof next]);
      (document.getElementById(first!) as HTMLElement | null)?.focus();
      return;
    }
    setSuccess(true);
    const colours = ['#ff5a1f', '#ffb199', '#14181f', '#ffffff', '#22c55e'];
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      const size = 6 + Math.random() * 8;
      Object.assign(piece.style, { position: 'fixed', left: Math.random() * 100 + 'vw', top: '-20px', width: size + 'px', height: size * .5 + 'px', background: colours[Math.floor(Math.random() * colours.length)], zIndex: '999', pointerEvents: 'none', borderRadius: '2px' });
      document.body.appendChild(piece);
      const animation = piece.animate([{ transform: 'translate(0,0) rotate(0deg)', opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 200}px, 105vh) rotate(${Math.random() * 720}deg)`, opacity: .8 }], { duration: 2500 + Math.random() * 1500, easing: 'cubic-bezier(.25,.6,.4,1)' });
      animation.onfinish = () => piece.remove();
    }
  };

  return <main className="run-site">
    <nav className={scrolled ? 'run-navbar scrolled' : 'run-navbar'} id="run-top">
      <a href="#run-home" className="run-logo">City<span>10K</span></a>
      <button className="run-menu-toggle" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">☰</button>
      <ul className={menuOpen ? 'run-nav-links open' : 'run-nav-links'}>
        {['about', 'route', 'schedule', 'faq', 'register'].map(id => <li key={id}><a href={'#run-' + id} onClick={() => setMenuOpen(false)}>{id[0].toUpperCase() + id.slice(1)}</a></li>)}
      </ul>
      <button className="run-back" onClick={onBack}>← Cyber City</button>
    </nav>

    <header className="run-hero" id="run-home">
      <div className="run-runner-emoji">🏃</div>
      <span className="run-badge">Sunday, 14 March 2027 · City Park</span>
      <h1>City <span>10K</span> Run</h1>
      <p className="run-sub">Run for your health, your city, and your personal best.</p>
      <div className="run-countdown">{countdown.map((n, i) => <div key={i}><strong>{String(n).padStart(2, '0')}</strong><small>{['Days', 'Hours', 'Minutes', 'Seconds'][i]}</small></div>)}</div>
      <a href="#run-register" className="run-button">Register Now</a>
    </header>

    <section className="run-section" id="run-about">
      <div className="run-section-title run-reveal"><h2>Why <span>Run With Us</span>?</h2><p>A fast, friendly course for first-timers and seasoned runners alike.</p></div>
      <div className="run-stats">{stats.map((s, i) => <div className="run-stat run-reveal" key={s.label}><div className="run-stat-num">{counts[i].toLocaleString()}</div><div className="run-stat-label">{s.label}</div></div>)}</div>
    </section>

    <section className="run-section run-route-section" id="run-route">
      <div className="run-section-title run-reveal"><h2>The <span>Route</span></h2><p>A flat, scenic loop through the park and along the riverside.</p></div>
      <div className="run-route-wrap run-reveal">
        <svg viewBox="0 0 800 400" aria-label="Route map">
          <path className="run-route-path" d="M 80 320 C 150 80, 280 380, 380 170 S 600 60, 720 120 S 640 340, 520 300 S 300 360, 200 260 S 90 240, 80 320 Z"/>
          <circle className="run-route-dot" cx="80" cy="320" r="10"/><text className="run-route-label" x="95" y="350">Start / Finish</text>
          <circle className="run-route-dot" cx="380" cy="170" r="7"/><text className="run-route-label" x="395" y="160">Km 3 Water</text>
          <circle className="run-route-dot" cx="720" cy="120" r="7"/><text className="run-route-label" x="600" y="100">Km 7 Water</text>
        </svg>
      </div>
    </section>

    <section className="run-section" id="run-schedule">
      <div className="run-section-title run-reveal"><h2>Race <span>Day</span> Schedule</h2><p>Plan your morning, from bib pickup to the finish line.</p></div>
      <div className="run-timeline">
        {[['07:00', 'Bib Collection Opens', 'Main gate, City Park. Bring your confirmation email.'], ['08:30', 'Warm-Up Session', 'Led by certified coaches on the main lawn.'], ['09:00', '10K Race Start', 'Corral start. Chip timing at the start and finish.'], ['10:15', 'Awards Ceremony', 'Medals for finishers and age-group winners.']].map(([time, title, desc]) => <article className="run-event run-reveal" key={time}><time>{time}</time><h3>{title}</h3><p>{desc}</p></article>)}
      </div>
    </section>

    <section className="run-section" id="run-faq">
      <div className="run-section-title run-reveal"><h2>Frequently Asked <span>Questions</span></h2></div>
      <div className="run-faq">{faqItems.map(([q, a], i) => <article className={'run-faq-item run-reveal ' + (openFaq === i ? 'open' : '')} key={q}><button className="run-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>{q}<span>{openFaq === i ? '×' : '+'}</span></button><div className="run-faq-a" style={{ maxHeight: openFaq === i ? '180px' : '0' }}><p>{a}</p></div></article>)}</div>
    </section>

    <section className="run-section run-register-section" id="run-register">
      <div className="run-section-title run-reveal"><h2>Secure Your <span>Spot</span></h2><p>Limited to 2,500 runners. Register today.</p></div>
      <form className="run-reg-form" onSubmit={submit} noValidate>
        <div className={'run-field ' + (errors.name ? 'invalid' : '')}><label htmlFor="run-name">Full name</label><input id="run-name" name="name" placeholder="Jane Doe" onChange={() => setErrors(v => ({ ...v, name: false }))}/><small>Please enter your full name.</small></div>
        <div className={'run-field ' + (errors.email ? 'invalid' : '')}><label htmlFor="run-email">Email</label><input id="run-email" name="email" type="email" placeholder="jane@example.com" onChange={() => setErrors(v => ({ ...v, email: false }))}/><small>Please enter a valid email address.</small></div>
        <div className={'run-field ' + (errors.age ? 'invalid' : '')}><label htmlFor="run-age">Age</label><input id="run-age" name="age" type="number" min="10" max="99" placeholder="30" onChange={() => setErrors(v => ({ ...v, age: false }))}/><small>Runners must be between 10 and 99.</small></div>
        <div className={'run-field ' + (errors.category ? 'invalid' : '')}><label htmlFor="run-category">Category</label><select id="run-category" name="category" defaultValue="" onChange={() => setErrors(v => ({ ...v, category: false }))}><option value="">Choose a category</option><option>Individual</option><option>Student</option><option>Team (5+)</option><option>Wheelchair</option></select><small>Please choose a category.</small></div>
        <button type="submit" className="run-button" disabled={success}>{success ? 'Registered' : 'Register'}</button>
        {success && <div className="run-success" role="status">You're in! A confirmation email is on its way. See you at the start line.</div>}
      </form>
    </section>
    <footer className="run-footer"><p><strong>City 10K Run</strong> · City Park, Sunday 14 March 2027</p><p>© {new Date().getFullYear()} City Running Club. All rights reserved.</p></footer>
    <button className={'run-top-btn ' + (topVisible ? 'show' : '')} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button>
  </main>;
}
