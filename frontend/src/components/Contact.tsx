import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from "lucide-react";
import AOS from "aos";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const handleChange = (e:any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "support@eventinvite.com",
      link: "mailto:support@eventinvite.com",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: MapPin,
      title: "Office",
      details: "123 Business St, Suite 100\nSan Francisco, CA 94102",
      link: "https://maps.google.com",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon - Fri: 9:00 AM - 6:00 PM\nSat - Sun: Closed",
      link: null,
    },
  ];

  return (
    <section id="contact" className="relative py-24 bg-dark overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-800/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
          <span className="inline-block px-4 py-2 bg-primary-900/50 border border-primary-800 rounded-full text-primary-400 text-sm font-medium mb-4">
            Contact Us
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-light mb-6">
            Let's Start a
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              Conversation
            </span>
          </h2>
          <p className="text-lg text-primary-300">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div data-aos="fade-right">
            <div className="bg-gradient-to-br from-dark-light to-dark border border-primary-900 rounded-2xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-900/50 rounded-lg">
                  <MessageCircle size={24} className="text-primary-400" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-light">
                  Send us a Message
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark border border-primary-800 rounded-lg text-light placeholder-primary-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark border border-primary-800 rounded-lg text-light placeholder-primary-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Subject Input */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark border border-primary-800 rounded-lg text-light placeholder-primary-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 bg-dark border border-primary-800 rounded-lg text-light placeholder-primary-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all resize-none"
                    placeholder="Tell us what you need help with..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-light px-6 py-4 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-primary-600/50 flex items-center justify-center gap-2"
                >
                  Send Message
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div data-aos="fade-left" className="space-y-6">
            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="bg-gradient-to-br from-dark-light to-dark border border-primary-900 hover:border-primary-700 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-primary-900/20 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg group-hover:scale-110 transition-transform">
                      <info.icon size={24} className="text-light" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-heading text-lg font-semibold text-light mb-1">
                        {info.title}
                      </h4>
                      {info.link ? (
                        <a
                          href={info.link}
                          target={
                            info.link.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            info.link.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="text-primary-300 hover:text-primary-400 transition-colors whitespace-pre-line"
                        >
                          {info.details}
                        </a>
                      ) : (
                        <p className="text-primary-300 whitespace-pre-line">
                          {info.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div
              data-aos="fade-up"
              className="bg-gradient-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 h-64 flex items-center justify-center overflow-hidden relative group"
            >
              {/* Map Icon Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <MapPin size={120} className="text-primary-600" />
              </div>

              <div className="relative text-center">
                <MapPin size={48} className="text-primary-400 mx-auto mb-3" />
                <p className="text-primary-300 font-medium">
                  Click to view on Google Maps
                </p>
              </div>

              {/* Hover Overlay */}
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-primary-900/0 hover:bg-primary-900/20 transition-all cursor-pointer"
              ></a>
            </div>

            {/* Social Links */}
            <div
              data-aos="fade-up"
              className="bg-gradient-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
            >
              <h4 className="font-heading text-lg font-semibold text-light mb-4">
                Follow Us
              </h4>
              <div className="flex gap-3">
                {["Twitter", "LinkedIn", "Facebook", "Instagram"].map(
                  (social, index) => (
                    <a
                      key={index}
                      href="#"
                      className="flex-1 bg-primary-900/50 hover:bg-primary-800 border border-primary-800 hover:border-primary-600 rounded-lg py-3 text-center text-primary-300 hover:text-light font-medium transition-all hover:scale-105"
                    >
                      {social.charAt(0)}
                    </a>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          data-aos="fade-up"
          className="mt-16 text-center bg-gradient-to-r from-primary-900/30 to-primary-800/30 border border-primary-800 rounded-2xl p-8 md:p-12"
        >
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-light mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-primary-300 mb-6 max-w-2xl mx-auto">
            Join thousands of event organizers already using EventInvite
          </p>
          <a
            href="#signup"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-light px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
          >
            Create Your First Event Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
