import { useEffect, useState } from "react";
import { Check, X, Sparkles, Zap, Crown } from "lucide-react";
import AOS from "aos";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const plans = [
    {
      name: "Free",
      icon: Sparkles,
      description: "Perfect for trying out EventInvite",
      price: {
        monthly: 0,
        annual: 0,
      },
      features: [
        { text: "Up to 2 events", included: true },
        { text: "Up to 50 guests per event", included: true },
        { text: "QR code generation", included: true },
        { text: "Email invitations", included: true },
        { text: "Basic analytics", included: true },
        { text: "Email support", included: true },
        { text: "Custom branding", included: false },
        { text: "Advanced analytics", included: false },
        { text: "Priority support", included: false },
        { text: "API access", included: false },
      ],
      cta: "Get Started",
      popular: false,
      gradient: "from-primary-800 to-primary-900",
    },
    {
      name: "Pro",
      icon: Zap,
      description: "For professionals and growing teams",
      price: {
        monthly: 29,
        annual: 24,
      },
      features: [
        { text: "Unlimited events", included: true },
        { text: "Up to 500 guests per event", included: true },
        { text: "QR code generation", included: true },
        { text: "Email invitations", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Custom branding", included: true },
        { text: "Priority email support", included: true },
        { text: "Bulk guest import", included: true },
        { text: "Export reports (CSV/PDF)", included: true },
        { text: "API access", included: false },
      ],
      cta: "Start Free Trial",
      popular: true,
      gradient: "from-primary-600 to-primary-800",
    },
    {
      name: "Enterprise",
      icon: Crown,
      description: "For large organizations and agencies",
      price: {
        monthly: 99,
        annual: 79,
      },
      features: [
        { text: "Unlimited events", included: true },
        { text: "Unlimited guests", included: true },
        { text: "QR code generation", included: true },
        { text: "Email invitations", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Custom branding", included: true },
        { text: "24/7 priority support", included: true },
        { text: "Bulk guest import", included: true },
        { text: "Export reports (CSV/PDF)", included: true },
        { text: "Full API access", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Custom integrations", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-primary-700 to-primary-900",
    },
  ];

  return (
    <section
      id="pricing"
      className="relative py-24 bg-dark-light overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary-800/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12" data-aos="fade-up">
          <span className="inline-block px-4 py-2 bg-primary-900/50 border border-primary-800 rounded-full text-primary-400 text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-light mb-6">
            Choose Your
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-primary-600">
              Perfect Plan
            </span>
          </h2>
          <p className="text-lg text-primary-300">
            Simple, transparent pricing that grows with you
          </p>
        </div>

        {/* Billing Toggle */}
        <div
          className="flex items-center justify-center gap-4 mb-16"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <span
            className={`text-sm font-medium transition-colors ${!isAnnual ? "text-light" : "text-primary-400"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-16 h-8 bg-primary-900 rounded-full border-2 border-primary-700 transition-colors hover:border-primary-600"
          >
            <div
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-linear-to-br from-primary-500 to-primary-700 rounded-full transition-transform duration-300 ${
                isAnnual ? "translate-x-8" : "translate-x-0"
              }`}
            ></div>
          </button>
          <span
            className={`text-sm font-medium transition-colors ${isAnnual ? "text-light" : "text-primary-400"}`}
          >
            Annual
            <span className="ml-2 px-2 py-1 bg-primary-600 text-light text-xs rounded-full">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className={`relative group ${
                plan.popular ? "md:-mt-4 md:mb-4" : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-primary-500 to-primary-700 rounded-full text-light text-sm font-semibold shadow-lg z-10">
                  Most Popular
                </div>
              )}

              {/* Card */}
              <div
                className={`relative bg-linear-to-br ${plan.gradient} border ${
                  plan.popular ? "border-primary-600" : "border-primary-900"
                } rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl ${
                  plan.popular
                    ? "hover:shadow-primary-600/20"
                    : "hover:shadow-primary-900/20"
                } hover:-translate-y-2`}
              >
                {/* Icon */}
                <div className="inline-flex p-3 bg-dark/30 rounded-xl mb-4">
                  <plan.icon size={28} className="text-primary-400" />
                </div>

                {/* Plan Name */}
                <h3 className="font-heading text-2xl font-bold text-light mb-2">
                  {plan.name}
                </h3>
                <p className="text-primary-300 text-sm mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="font-heading text-5xl font-bold text-light">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-primary-300 text-lg mb-2">
                      {plan.price.monthly > 0 ? "/month" : "forever"}
                    </span>
                  </div>
                  {plan.price.monthly > 0 && isAnnual && (
                    <p className="text-sm text-primary-400 mt-1">
                      Billed ${plan.price.annual * 12}/year
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <a
                  href="#signup"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all mb-8 ${
                    plan.popular
                      ? "bg-light text-dark hover:bg-primary-100"
                      : "bg-primary-700 text-light hover:bg-primary-600"
                  }`}
                >
                  {plan.cta}
                </a>

                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="shrink-0 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center mt-0.5">
                          <Check size={14} className="text-light" />
                        </div>
                      ) : (
                        <div className="shrink-0 w-5 h-5 bg-primary-900/50 rounded-full flex items-center justify-center mt-0.5">
                          <X size={14} className="text-primary-600" />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-light" : "text-primary-500"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div
          data-aos="fade-up"
          className="bg-linear-to-br from-dark to-dark-light border border-primary-900 rounded-2xl p-8 md:p-12"
        >
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-light mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, Pro and Enterprise plans come with a 14-day free trial. No credit card required.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and PayPal for your convenience.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely! Cancel your subscription anytime with no cancellation fees or penalties.",
              },
            ].map((faq, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-heading text-lg font-semibold text-light">
                  {faq.q}
                </h4>
                <p className="text-primary-300 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="mt-12 text-center">
            <p className="text-primary-300 mb-4">
              Still have questions? We're here to help!
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Contact Support
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
