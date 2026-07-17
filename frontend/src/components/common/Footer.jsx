import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-50 dark:bg-dark-card text-primary-900/70 dark:text-dark-muted py-12 border-t border-primary-200 dark:border-dark-border">
      <div className="container-cq">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span className="font-bold text-lg text-primary-900 dark:text-dark-text font-display">
                Culture<span className="gradient-text">Quest</span> AI
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Explore ancient history, discover local culture, uncover hidden gems, and plan customized itineraries with our advanced AI travel planner.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-primary-900 dark:text-white font-semibold mb-4">Discover</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/destinations" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Destinations</Link></li>
              <li><Link to="/hidden-gems" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Hidden Gems</Link></li>
              <li><Link to="/events" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Events & Festivals</Link></li>
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="text-primary-900 dark:text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-primary-900 dark:text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="divider border-primary-200 dark:border-dark-border my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-dark-muted gap-4">
          <p>© {new Date().getFullYear()} CultureQuest AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
