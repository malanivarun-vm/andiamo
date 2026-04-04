import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Navigation */}
      <nav
        className="fixed top-0 w-full z-50"
        style={{ background: "rgba(251,249,246,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}
      >
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">menu</span>
            <span className="font-headline italic text-2xl tracking-tight text-primary">Andiamo</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-primary font-bold font-sans text-sm uppercase tracking-wider">Explore</span>
            <span className="text-outline font-sans text-sm uppercase tracking-wider">How it works</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-primary px-4 py-2">
              Log In
            </Link>
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "18px" }}>person</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                style={{ background: "#ffdcbf", color: "#6a3b00" }}
              >
                <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse inline-block"></span>
                5,000+ Groups Planning Now
              </div>
              <h1 className="font-headline text-5xl lg:text-7xl text-on-surface leading-tight mb-8">
                The easiest way to go from{" "}
                <span className="italic text-primary block">&ldquo;We should totally go&rdquo;</span>
                {" "}to{" "}
                <span className="italic text-tertiary block">&ldquo;We&rsquo;re actually going.&rdquo;</span>
              </h1>
              <p className="text-on-surface-variant text-lg lg:text-xl max-w-xl mb-10 leading-relaxed">
                Coordinate your group, vote on destinations, and align on budgets — all before anyone opens a browser tab to book.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/login"
                  className="text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:-translate-y-0.5 transition-all text-center"
                  style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}
                >
                  Start Planning
                </Link>
                <Link
                  href="/join"
                  className="text-on-surface px-8 py-4 rounded-full font-bold text-lg hover:bg-surface-container transition-all text-center border"
                  style={{ borderColor: "rgba(193,199,211,0.4)", background: "rgba(245,243,240,0.5)" }}
                >
                  Got an invite code?
                </Link>
              </div>
            </div>

            {/* Visual collage */}
            <div className="relative h-[420px] lg:h-[560px]">
              <div className="absolute top-0 left-0 w-3/5 h-3/5 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center" style={{ background: "rgba(41,118,199,0.12)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "80px", color: "rgba(0,93,167,0.25)" }}>beach_access</span>
              </div>
              <div className="absolute top-0 right-0 w-2/5 h-2/5 rounded-2xl shadow-lg mt-8 overflow-hidden flex items-center justify-center" style={{ background: "rgba(255,220,191,0.6)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "60px", color: "rgba(133,79,16,0.35)" }}>landscape</span>
              </div>
              <div className="absolute bottom-0 left-0 w-1/3 h-2/5 rounded-2xl shadow-lg mb-8 overflow-hidden flex items-center justify-center" style={{ background: "rgba(197,224,254,0.4)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "50px", color: "rgba(71,97,123,0.35)" }}>restaurant</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3/5 h-3/5 rounded-3xl shadow-2xl bg-surface overflow-hidden z-20 translate-x-2 translate-y-2" style={{ border: "8px solid #fbf9f6" }}>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary" style={{ fontSize: "20px" }}>travel_explore</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">Goa Summer &apos;25</p>
                      <p className="text-xs text-on-surface-variant">May 23–28 · 6 Members</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-surface-container-low border-l-4 border-primary">
                      <p className="text-xs font-semibold text-on-surface-variant">Leading Vote</p>
                      <p className="font-headline italic text-on-surface">Candolim Beach</p>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant">4/6 voted</span>
                      <span className="text-primary font-bold">Closes in 12h</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="w-2/3 h-full rounded-full" style={{ background: "linear-gradient(to right, #005da7, #2976c7)" }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-tertiary-fixed rounded-full blur-3xl opacity-40"></div>
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-10 bg-surface-container-low border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-10 lg:gap-20 opacity-50">
            {["VOGUE", "Condé Nast", "Traveler", "Architectural Digest", "Departures"].map((name) => (
              <span key={name} className="font-headline font-bold text-2xl tracking-tighter">{name}</span>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-headline text-4xl lg:text-5xl mb-4 italic">From chaos to confirmed</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Three steps. Everyone on the same page. Before anyone opens a browser tab to book.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20 relative">
            {[
              { icon: "edit_square", bg: "bg-primary-container", fg: "text-on-primary-container", title: "Create", desc: "Start a trip. Share an invite link to your WhatsApp group. No app install for invitees." },
              { icon: "how_to_vote", bg: "bg-tertiary-container", fg: "text-white", title: "Vote", desc: "Group commits, sets vibes and budgets privately. You propose destinations — they vote with a deadline." },
              { icon: "flight_takeoff", bg: "bg-secondary-container", fg: "text-on-secondary-container", title: "Go", desc: "Destination locked. Dates confirmed. Everyone committed. Before anyone opens a booking tab." },
            ].map((step) => (
              <div key={step.title} className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full ${step.bg} ${step.fg} flex items-center justify-center mb-8 shadow-xl`}>
                  <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>{step.icon}</span>
                </div>
                <h3 className="font-headline text-2xl mb-4">{step.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Bento */}
        <section className="py-24 px-6 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="font-headline text-4xl lg:text-5xl mb-6">Built for the group, not the solo planner.</h2>
              <p className="text-on-surface-variant text-lg">Every competing tool has a &ldquo;share&rdquo; button bolted on. Andiamo is built group-first.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface-container-low rounded-3xl p-10">
                <span className="material-symbols-outlined text-primary mb-6 block" style={{ fontSize: "36px" }}>lock</span>
                <h3 className="font-headline text-3xl mb-4">Budget Privacy by Design</h3>
                <p className="text-on-surface-variant max-w-sm mb-8 text-lg">
                  Your exact budget is never shared. The organiser only sees the group spread. RLS enforced at the database level.
                </p>
                <div className="flex gap-3">
                  <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: "rgba(0,93,167,0.1)", color: "#005da7" }}>3 under ₹25k</span>
                  <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: "rgba(133,79,16,0.1)", color: "#854f10" }}>2 up to ₹40k</span>
                </div>
              </div>
              <div className="bg-secondary-container/30 rounded-3xl p-8 border border-secondary-container/50">
                <span className="material-symbols-outlined text-secondary mb-4 block" style={{ fontSize: "28px" }}>how_to_vote</span>
                <h3 className="font-headline text-xl mb-2">Deadline-Gated Voting</h3>
                <p className="text-on-surface-variant text-sm">48h default. No response = abstain. No one person can hold the trip hostage.</p>
              </div>
              <div className="rounded-3xl p-8 border border-tertiary-fixed/50" style={{ background: "rgba(255,220,191,0.3)" }}>
                <span className="material-symbols-outlined text-tertiary mb-4 block" style={{ fontSize: "28px" }}>share</span>
                <h3 className="font-headline text-xl mb-2">WhatsApp-Native</h3>
                <p className="text-on-surface-variant text-sm">Share one link. No app install needed. Goes-alongs see a FOMO preview before signing in.</p>
              </div>
              <div className="lg:col-span-2 bg-surface-container-low rounded-3xl p-8">
                <span className="material-symbols-outlined text-primary mb-4 block" style={{ fontSize: "28px" }}>insights</span>
                <h3 className="font-headline text-2xl mb-2">Travel Style Compatibility</h3>
                <p className="text-on-surface-variant mb-4">See pace, accommodation, and activity style mismatches before they become fights on day 2.</p>
                <div className="flex flex-wrap gap-2">
                  {["Relaxed pace", "Mid-range hotels", "Food-first", "Mixed activities"].map(t => (
                    <span key={t} className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-6 relative overflow-hidden" style={{ background: "#005da7" }}>
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <span className="material-symbols-outlined mb-8 block opacity-20" style={{ fontSize: "60px", color: "#fff" }}>format_quote</span>
            <h2 className="font-headline text-3xl lg:text-5xl italic leading-tight mb-12 text-white">
              &ldquo;We&apos;d been talking about a Goa trip for two years. With Andiamo, we had a destination and dates locked in 48 hours.&rdquo;
            </h2>
            <p className="font-bold text-lg text-white">Priya M.</p>
            <p className="text-sm mt-1" style={{ color: "rgba(212,227,255,0.8)" }}>Organiser, &apos;The Bombay Six&apos;</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 bg-surface">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-headline text-4xl lg:text-6xl mb-8">Ready to finally leave the group chat?</h2>
            <p className="text-on-surface-variant text-xl mb-10">From &ldquo;let&apos;s go&rdquo; to confirmed destination + dates in under 48 hours.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/login" className="bg-primary text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-all text-center">
                Start Your First Trip
              </Link>
              <Link href="/join" className="bg-surface-container-high text-on-surface px-10 py-5 rounded-full font-bold text-xl hover:bg-surface-container-highest transition-all text-center">
                Join with Invite Code
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-surface-container-low border-t border-outline-variant/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-headline italic text-2xl text-primary">Andiamo</span>
            <p className="text-on-surface-variant text-sm">From &ldquo;let&apos;s go&rdquo; to confirmed. Without the chaos.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
