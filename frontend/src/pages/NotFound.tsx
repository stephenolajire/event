import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import AOS from "aos";

const NotFound = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center bg-dark px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div data-aos="fade-up" className="mb-8">
          <h1 className="font-heading text-9xl md:text-[12rem] font-bold text-primary-600/30 leading-none">
            404
          </h1>
        </div>

        {/* Content Card */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-2xl shadow-2xl p-8 md:p-12"
        >
          {/* Icon */}
          <div className="inline-flex p-4 bg-primary-900/30 rounded-xl mb-6">
            <Search size={48} className="text-primary-500" />
          </div>

          {/* Heading */}
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-light mb-4">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-primary-300 text-lg mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-light px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-primary-600/50"
            >
              <Home size={20} />
              Go to Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 bg-dark border border-primary-800 hover:border-primary-600 text-light px-6 py-3 rounded-lg font-semibold transition-all hover:bg-primary-900/30"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-8 pt-8 border-t border-primary-900">
            <p className="text-sm text-primary-400 mb-4">
              Here are some helpful links instead:
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Login
              </Link>
              <span className="text-primary-800">•</span>
              <Link
                to="/signup"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Sign Up
              </Link>
              <span className="text-primary-800">•</span>
              <Link
                to="/about"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                About
              </Link>
              <span className="text-primary-800">•</span>
              <Link
                to="/contact"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <p
          data-aos="fade-up"
          data-aos-delay="200"
          className="mt-6 text-sm text-primary-500"
        >
          Error Code: 404 | Page Not Found
        </p>
      </div>
    </section>
  );
};

export default NotFound;
