import { useEffect } from "react";
import { ArrowRight, Sparkles, QrCode, Users, CheckCircle } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Hero = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out",
    });
  }, []);

  const stats = [
    { icon: Users, value: "10K+", label: "Events Created" },
    { icon: QrCode, value: "50K+", label: "QR Codes Generated" },
    { icon: CheckCircle, value: "99.9%", label: "Success Rate" },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-dark overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary-800/20 rounded-full blur-3xl"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size[4rem_4rem]"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div data-aos="fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900/50 border border-primary-800 rounded-full text-primary-300 text-sm font-medium">
                <Sparkles size={16} />
                Smart Event Management
              </span>
            </div>

            {/* Main Heading */}
            <div data-aos="fade-up" data-aos-delay="100">
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-light leading-tight">
                Manage Events with
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-primary-600">
                  QR Code Magic
                </span>
              </h1>
            </div>

            {/* Description */}
            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-lg md:text-xl text-primary-300 leading-relaxed max-w-xl"
            >
              Create stunning events, invite guests, and manage check-ins
              seamlessly with secure QR codes. Say goodbye to paper tickets and
              hello to the future of event management.
            </p>

            {/* CTA Buttons */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#signup"
                className="group inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-light px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-primary-600/50"
              >
                Get Started Free
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-primary-700 hover:border-primary-600 text-light px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:bg-primary-900/30"
              >
                Watch Demo
              </a>
            </div>

            {/* Stats */}
            <div
              data-aos="fade-up"
              data-aos-delay="400"
              className="grid grid-cols-3 gap-6 pt-8 border-t border-primary-900"
            >
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2 text-primary-400">
                    <stat.icon size={20} />
                  </div>
                  <div className="font-heading text-2xl md:text-3xl font-bold text-light">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Visual/Mockup */}
          <div data-aos="fade-left" data-aos-delay="200" className="relative">
            <div className="relative">
              {/* Main Card */}
              <div className="relative bg-linear-to-br from-primary-900/80 to-dark-light border border-primary-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                {/* QR Code Mockup */}
                <div className="aspect-square bg-light rounded-xl p-6 mb-6 flex items-center justify-center">
                  <div className="w-full h-full bg-dark rounded-lg flex items-center justify-center">
                    <QrCode size={120} className="text-primary-400" />
                  </div>
                </div>

                {/* Event Details Mockup */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-800 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-primary-800 rounded w-3/4"></div>
                      <div className="h-3 bg-primary-900 rounded w-1/2"></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="h-8 bg-primary-800 rounded flex-1"></div>
                    <div className="h-8 bg-primary-800 rounded flex-1"></div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-primary-600 text-light px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  ✓ Verified
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary-600/20 rounded-full blur-2xl"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary-700/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        data-aos="fade-up"
        data-aos-delay="500"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <div className="w-6 h-10 border-2 border-primary-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-600 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
