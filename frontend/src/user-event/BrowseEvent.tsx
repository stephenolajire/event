// src/pages/BrowseEvents.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Ticket as TicketIcon } from "lucide-react";
import AOS from "aos";
import { useUpcomingEvents } from "../hooks/useEvent";

const BrowseEvents = () => {
  const { data: events, isLoading } = useUpcomingEvents();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-950 via-dark to-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div data-aos="fade-down" className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-light mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-primary-300 text-lg">
            Find and book tickets for the best events happening around you
          </p>
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Link
                key={event.id}
                to={`/event/${event.slug}/tickets`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl overflow-hidden hover:border-primary-600 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary-900/20"
              >
                {event.banner_image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.banner_image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-light mb-2 group-hover:text-primary-400 transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-primary-300 text-sm">
                      <Calendar size={16} />
                      <span>
                        {new Date(event.event_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-primary-300 text-sm">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    {event.total_guests > 0 && (
                      <div className="flex items-center gap-2 text-primary-300 text-sm">
                        <Users size={16} />
                        <span>{event.total_guests} attending</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary-800">
                    <span className="text-primary-400 text-sm font-medium">
                      View Tickets
                    </span>
                    <TicketIcon
                      size={20}
                      className="text-primary-600 group-hover:text-primary-400 transition-colors"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar className="w-20 h-20 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-light mb-2">
              No Events Available
            </h3>
            <p className="text-primary-400">
              Check back soon for upcoming events!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseEvents;
