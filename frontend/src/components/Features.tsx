import { useEffect } from "react";
import {
  QrCode,
  Mail,
  BarChart3,
  Shield,
  Zap,
  Users,
  Calendar,
  Download,
  Clock,
  CheckCircle2,
} from "lucide-react";
import AOS from "aos";

const Features = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const mainFeatures = [
    {
      icon: QrCode,
      title: "Secure QR Codes",
      description:
        "Generate unique, encrypted QR codes for each guest with one-time use enforcement to prevent fraud.",
      color: "from-primary-600 to-primary-800",
    },
    {
      icon: Mail,
      title: "Email Invitations",
      description:
        "Send beautiful, customized email invitations with QR codes automatically to all your guests.",
      color: "from-primary-700 to-primary-900",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "Track attendance, check-ins, and event metrics in real-time with comprehensive dashboards.",
      color: "from-primary-600 to-primary-800",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-level encryption and security protocols to protect your event data and guest information.",
      color: "from-primary-700 to-primary-900",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Check-in guests in seconds with instant QR code scanning and validation.",
      color: "from-primary-600 to-primary-800",
    },
    {
      icon: Users,
      title: "Guest Management",
      description:
        "Easily manage guest lists, RSVPs, and plus-ones all in one intuitive dashboard.",
      color: "from-primary-700 to-primary-900",
    },
  ];

  const additionalFeatures = [
    { icon: Calendar, text: "Multi-event management" },
    { icon: Download, text: "Export guest lists (CSV/PDF)" },
    { icon: Clock, text: "Automated reminders" },
    { icon: CheckCircle2, text: "Manual check-in override" },
  ];

  return (
    <section
      id="features"
      className="relative py-24 bg-dark-light overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-800/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
          <span className="inline-block px-4 py-2 bg-primary-900/50 border border-primary-800 rounded-full text-primary-400 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-light mb-6">
            Everything You Need to
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-primary-600">
              Host Perfect Events
            </span>
          </h2>
          <p className="text-lg text-primary-300">
            Powerful features designed to make event management effortless and
            secure
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group relative bg-dark border border-primary-900 hover:border-primary-700 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-900/20 hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className={`inline-flex p-4 bg-linear-to-br ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon size={28} className="text-light" />
              </div>

              {/* Content */}
              <h3 className="font-heading text-xl font-bold text-light mb-3">
                {feature.title}
              </h3>
              <p className="text-primary-300 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-600/20 rounded-2xl transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div
          data-aos="fade-up"
          className="bg-linear-to-br from-dark to-dark-light border border-primary-900 rounded-2xl p-8 md:p-12"
        >
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-light mb-8 text-center">
            And Much More...
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                className="flex items-center gap-3 text-primary-300 hover:text-light transition-colors"
              >
                <div className="shrink-0 p-2 bg-primary-900/50 rounded-lg">
                  <feature.icon size={20} className="text-primary-400" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div
          data-aos="fade-up"
          className="mt-16 text-center bg-linear-to-r from-primary-900/30 to-primary-800/30 border border-primary-800 rounded-2xl p-8 md:p-12"
        >
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-light mb-4">
            Ready to transform your events?
          </h3>
          <p className="text-primary-300 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust EventInvite for their
            events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#signup"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-light px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
            >
              Start Free Trial
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-primary-700 hover:border-primary-600 text-light px-8 py-4 rounded-lg font-semibold transition-all hover:bg-primary-900/30"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
