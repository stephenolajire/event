import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  // Smooth scroll to section
  const scrollToSection = (e: any, href: any) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false); // Close mobile menu
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-dark/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="shrink-0">
            <Link
              to='/'
              onClick={(e) => scrollToSection(e, "#home")}
              className="font-heading text-2xl font-bold text-light hover:text-primary-400 transition-colors"
            >
              <img  src="./event.jpg" className="w-25 h-25 rounded-full"/>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-light-dark hover:text-light text-sm font-medium transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}

              {/* CTA Buttons */}
              <div className="flex items-center space-x-4 ml-6">
                <Link
                  to="/login"
                  className="text-light-dark hover:text-light text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 hover:bg-primary-700 text-light px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-light hover:text-primary-400 transition-colors p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 bg-dark-light border-t border-primary-900">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="block px-4 py-3 text-light-dark hover:text-light hover:bg-dark-lighter rounded-lg transition-all text-base font-medium"
            >
              {link.name}
            </a>
          ))}

          {/* Mobile CTA Buttons */}
          <div className="pt-4 space-y-2 border-t border-primary-900">
            <Link
              to="/login"
              className="block px-4 py-3 text-light-dark hover:text-light hover:bg-dark-lighter rounded-lg transition-all text-base font-medium text-center"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="block bg-primary-600 hover:bg-primary-700 text-light px-4 py-3 rounded-lg text-base font-medium transition-all text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
