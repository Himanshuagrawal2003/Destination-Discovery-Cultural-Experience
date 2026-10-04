import { Link } from 'react-router-dom';
import { LuTwitter, LuInstagram, LuFacebook, LuGlobe } from 'react-icons/lu';

const LINKS = {
  Discover: [
    { label: 'Destinations', to: '/destinations' },
    { label: 'Hidden Gems', to: '/hidden-gems' },
    { label: 'Events & Festivals', to: '/events' },
    { label: 'Trip Planner', to: '/trip-planner' },
  ],
  'AI Tools': [
    { label: 'AI Discovery', to: '/ai/recommend' },
    { label: 'Itinerary Builder', to: '/ai/itinerary' },
    { label: 'Heritage Stories', to: '/ai/history' },
    { label: 'Food Guide', to: '/ai/food-guide' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'FAQs', to: '/faq' },
    { label: 'Privacy Policy', to: '/privacy' },
  ],
};

const SOCIALS = [
  { icon: LuTwitter, href: '#', label: 'Twitter' },
  { icon: LuInstagram, href: '#', label: 'Instagram' },
  { icon: LuFacebook, href: '#', label: 'Facebook' },
];

export default function Footer() {
  return (
    <footer className="bg-primary-50 dark:bg-dark-card border-t border-primary-100 dark:border-dark-border text-primary-900/60 dark:text-dark-muted">
      <div className="container-cq py-12 md:py-16">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand column — spans 2 cols on mobile */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <svg viewBox="0 0 32 32" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <circle cx="16" cy="13" r="9" stroke="#8b5cf6" strokeWidth="1.8" fill="none"/>
                <ellipse cx="16" cy="13" rx="9" ry="3.6" stroke="#8b5cf6" strokeWidth="1.4" fill="none" opacity="0.5"/>
                <line x1="16" y1="4" x2="16" y2="22" stroke="#8b5cf6" strokeWidth="1.4" opacity="0.5"/>
                <circle cx="16" cy="13" r="2" fill="#8b5cf6"/>
                <path d="M16 19 L16 27" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="16" cy="28.2" r="1.4" fill="#8b5cf6" opacity="0.5"/>
              </svg>
              <span className="font-black text-base text-primary-900 dark:text-white font-display tracking-tight whitespace-nowrap">
                Culture<span className="text-accent">Quest</span><span className="text-primary-900/40 dark:text-dark-muted font-bold text-sm ml-1">AI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Explore ancient history, discover local culture, uncover hidden gems, and plan customized itineraries with our advanced AI travel planner.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-dark-bg border border-primary-100 dark:border-dark-border text-primary-900/60 dark:text-dark-muted hover:text-accent dark:hover:text-accent hover:border-accent/40 transition-all"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-bold text-primary-900 dark:text-white mb-4 tracking-wide uppercase">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm hover:text-accent dark:hover:text-accent transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-primary-100 dark:border-dark-border my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-900/40 dark:text-dark-muted">
          <p>© {new Date().getFullYear()} CultureQuest AI. All rights reserved.</p>
          <div className="flex items-center gap-1 text-primary-900/30 dark:text-dark-muted">
            <LuGlobe className="text-xs" />
            <span>Made with ❤️ for cultural explorers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
