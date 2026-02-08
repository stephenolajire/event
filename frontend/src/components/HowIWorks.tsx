import { useEffect } from "react";
import {
  CalendarPlus,
  UserPlus,
  QrCode,
  Send,
  ScanLine,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import AOS from "aos";

const HowItWorks = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const steps = [
    {
      number: "01",
      icon: CalendarPlus,
      title: "Create Your Event",
      description:
        "Set up your event in minutes with our intuitive dashboard. Add event details, date, location, and capacity.",
      image: "📅",
    },
    {
      number: "02",
      icon: UserPlus,
      title: "Add Your Guests",
      description:
        "Import guest lists or add guests manually. Bulk upload support for large events with CSV files.",
      image: "👥",
    },
    {
      number: "03",
      icon: QrCode,
      title: "Generate QR Codes",
      description:
        "Unique, secure QR codes are automatically generated for each guest with encryption and expiry settings.",
      image: "🎫",
    },
    {
      number: "04",
      icon: Send,
      title: "Send Invitations",
      description:
        "Send beautiful email invitations with QR codes attached. Track who received and opened their invites.",
      image: "✉️",
    },
    {
      number: "05",
      icon: ScanLine,
      title: "Scan at Event",
      description:
        "Use our mobile app or web scanner to check in guests instantly. Works offline with sync capability.",
      image: "📱",
    },
    {
      number: "06",
      icon: CheckCircle,
      title: "Track & Analyze",
      description:
        "Monitor real-time attendance, generate reports, and export data for post-event analysis.",
      image: "📊",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-24 bg-dark overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-primary-800/10 rounded-full blur-3xl"></div>

        {/* Connecting Lines */}
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl">
          <svg className="w-full h-full opacity-10" viewBox="0 0 1000 600">
            <path
              d="M 100 100 Q 300 50 500 100 T 900 100"
              stroke="currentColor"
              className="text-primary-600"
              strokeWidth="2"
              fill="none"
              strokeDasharray="8 8"
            />
            <path
              d="M 100 300 Q 300 250 500 300 T 900 300"
              stroke="currentColor"
              className="text-primary-600"
              strokeWidth="2"
              fill="none"
              strokeDasharray="8 8"
            />
            <path
              d="M 100 500 Q 300 450 500 500 T 900 500"
              stroke="currentColor"
              className="text-primary-600"
              strokeWidth="2"
              fill="none"
              strokeDasharray="8 8"
            />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20" data-aos="fade-up">
          <span className="inline-block px-4 py-2 bg-primary-900/50 border border-primary-800 rounded-full text-primary-400 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-light mb-6">
            Get Started in
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-primary-600">
              6 Simple Steps
            </span>
          </h2>
          <p className="text-lg text-primary-300">
            From event creation to check-in, we've made it incredibly simple
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="relative group"
            >
              {/* Step Card */}
              <div className="relative bg-linear-to-br from-dark-light to-dark border border-primary-900 hover:border-primary-700 rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary-900/20 hover:-translate-y-2">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center font-heading font-bold text-light shadow-lg">
                  {step.number}
                </div>

                {/* Emoji Icon */}
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {step.image}
                </div>

                {/* Icon */}
                <div className="inline-flex p-3 bg-primary-900/50 rounded-xl mb-4">
                  <step.icon size={24} className="text-primary-400" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-xl font-bold text-light mb-3">
                  {step.title}
                </h3>
                <p className="text-primary-300 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow Indicator (except last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-primary-700">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Visual (Mobile) */}
        <div className="lg:hidden mb-16" data-aos="fade-up">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary-600 to-primary-900"></div>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="relative flex items-start gap-6">
                  {/* Node */}
                  <div className="relative z-10 shrink-0 w-16 h-16 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center font-heading font-bold text-light shadow-lg">
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h4 className="font-heading text-lg font-bold text-light mb-1">
                      {step.title}
                    </h4>
                    <p className="text-sm text-primary-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video/Demo Section */}
        <div
          data-aos="fade-up"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-800 rounded-2xl p-8 md:p-12 text-center"
        >
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-light mb-4">
            See It In Action
          </h3>
          <p className="text-primary-300 mb-8 max-w-2xl mx-auto">
            Watch our 2-minute video to see how easy event management can be
          </p>

          {/* Video Placeholder */}
          <div className="relative aspect-video bg-dark rounded-xl overflow-hidden border border-primary-900 max-w-4xl mx-auto group cursor-pointer hover:border-primary-700 transition-all">
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-dark/50 group-hover:bg-dark/30 transition-all">
              <div className="w-20 h-20 bg-primary-600 group-hover:bg-primary-700 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                <div className="w-0 h-0 border-t-12 border-t-transparent border-l-20 border-l-light border-b-12 border-b-transparent ml-1"></div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="w-full h-full flex items-center justify-center">
              <QrCode size={120} className="text-primary-800 opacity-20" />
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <a
              href="#signup"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-light px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
            >
              Start Creating Events
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
