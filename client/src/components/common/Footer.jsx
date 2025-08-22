import React from 'react';
import { Facebook, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    const aboutSection = document.querySelector('[data-section="about"]');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If about section not found, scroll to top
      scrollToTop();
    }
  };

  const scrollToPartners = () => {
    const partnersSection = document.querySelector('[data-section="partners"]');
    if (partnersSection) {
      partnersSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If partners section not found, scroll to top
      scrollToTop();
    }
  };
  return (
    <footer className="bg-primary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Logo showText={false} className="w-12 h-12" />
            </div>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Preserving and promoting Ethiopia's rich cultural heritage through digital innovation and immersive experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore Heritage */}
          <div>
            <h3 className="text-primary-foreground font-semibold mb-4">Explore Heritage</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Virtual Museums</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Artifacts Gallery</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Heritage Sites Map</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Live Tours</a></li>
            </ul>
          </div>

          {/* For Organizations */}
          <div>
            <h3 className="text-primary-foreground font-semibold mb-4">For Organizations</h3>
            <ul className="space-y-2">
              <li><Link to="/auth?role=museum_admin" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Museum Portal</Link></li>
              <li><Link to="/auth?role=tour_admin" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Tour Organizer</Link></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Educator Hub</a></li>
              <li><button onClick={scrollToPartners} className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors text-left">Partnerships</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-primary-foreground font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Help Center</a></li>
              <li><Link to="/contact" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Contact Us</Link></li>
              <li><button onClick={scrollToAbout} className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors text-left">About</button></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2025 EthioHeritage360. All rights reserved. Built with pride for Ethiopian cultural preservation.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

