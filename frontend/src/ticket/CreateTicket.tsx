import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  X,
  Calendar,
  DollarSign,
  Users,
  Package,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import AOS from "aos";
import { toast } from "react-toastify";
import { useCreateTicketType } from "../hooks/useTicket";
import { useEvents } from "../hooks/useEvent";
import type { CreateTicketTypePayload } from "../services/ticketService";

interface Benefit {
  title: string;
  description: string;
  icon: string;
  order: number;
}

const CreateTicketType = () => {
  const createTicketMutation = useCreateTicketType();
  const { data: events, isLoading: eventsLoading } = useEvents();
  console.log(events)

  const [formData, setFormData] = useState({
    event: "",
    name: "",
    category: "general" as const,
    description: "",
    price: "",
    quantity_available: "",
    sale_start_date: "",
    sale_end_date: "",
    min_purchase: "1",
    max_purchase: "10",
    is_active: true,
    is_visible: true,
  });

  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [newBenefit, setNewBenefit] = useState({
    title: "",
    description: "",
    icon: "check",
  });

  const categories = [
    { value: "general", label: "General Admission" },
    { value: "premium", label: "Premium" },
    { value: "vip", label: "VIP" },
    { value: "vvip", label: "VVIP" },
    { value: "early_bird", label: "Early Bird" },
    { value: "student", label: "Student" },
    { value: "group", label: "Group" },
  ];

  const iconOptions = [
    "check",
    "star",
    "gift",
    "music",
    "drink",
    "food",
    "trophy",
    "crown",
    "heart",
    "sparkles",
  ];

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

    const handleInputChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    };

  const handleAddBenefit = () => {
    if (newBenefit.title.trim()) {
      setBenefits((prev) => [
        ...prev,
        {
          ...newBenefit,
          order: prev.length,
        },
      ]);
      setNewBenefit({ title: "", description: "", icon: "check" });
      toast.success("Benefit added successfully");
    } else {
      toast.error("Please enter a benefit title");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
    toast.info("Benefit removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.event) {
      toast.error("Please select an event");
      return;
    }

    const payload: CreateTicketTypePayload = {
      event: parseInt(formData.event),
      name: formData.name,
      category: formData.category,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      quantity_available: parseInt(formData.quantity_available),
      sale_start_date: formData.sale_start_date,
      sale_end_date: formData.sale_end_date,
      min_purchase: parseInt(formData.min_purchase) || undefined,
      max_purchase: parseInt(formData.max_purchase) || undefined,
      is_active: formData.is_active,
      is_visible: formData.is_visible,
      benefits: benefits.length > 0 ? benefits : undefined,
    };

    try {
      await createTicketMutation.mutateAsync(payload);
      toast.success("Ticket type created successfully!");
    } catch (error) {
      console.error("Error creating ticket:", error);
      const errorMessage =
        (error as any).response?.data?.message ||
        (error as any).response?.data?.detail ||
        (error as any).message ||
        "Failed to create ticket type. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/ticket"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-2 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Tickets
          </Link>
          <h1 className="font-heading text-3xl font-bold text-light">
            Create Ticket Type
          </h1>
          <p className="text-primary-300 mt-1">
            Set up a new ticket type with pricing and benefits
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          data-aos="fade-up"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-light mb-6 flex items-center gap-2">
            <Package className="text-primary-400" size={24} />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Event <span className="text-red-400">*</span>
              </label>
              <select
                name="event"
                value={formData.event}
                onChange={handleInputChange}
                required
                disabled={eventsLoading}
                className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors disabled:opacity-50"
              >
                <option value="">
                  {eventsLoading ? "Loading events..." : "Select an event"}
                </option>
                {events?.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Ticket Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., VIP Pass, Early Bird Special"
                className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Price <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
                  size={18}
                />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Quantity Available <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="quantity_available"
                value={formData.quantity_available}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="e.g., 100"
                className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe what's included with this ticket..."
                className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600 resize-none"
              />
            </div>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-light mb-6 flex items-center gap-2">
            <Calendar className="text-primary-400" size={24} />
            Sales Period
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Sale Start Date <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                name="sale_start_date"
                value={formData.sale_start_date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Sale End Date <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                name="sale_end_date"
                value={formData.sale_end_date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
              />
            </div>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-light mb-6 flex items-center gap-2">
            <Users className="text-primary-400" size={24} />
            Purchase Limits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Minimum Purchase
              </label>
              <input
                type="number"
                name="min_purchase"
                value={formData.min_purchase}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Maximum Purchase
              </label>
              <input
                type="number"
                name="max_purchase"
                value={formData.max_purchase}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
              />
            </div>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="300"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-light mb-6 flex items-center gap-2">
            <Tag className="text-primary-400" size={24} />
            Ticket Benefits
          </h2>

          <div className="bg-primary-900/20 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <input
                  type="text"
                  value={newBenefit.title}
                  onChange={(e) =>
                    setNewBenefit((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Benefit title (e.g., 2 VSOP Drinks)"
                  className="w-full px-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600"
                />
              </div>
              <div className="md:col-span-4">
                <input
                  type="text"
                  value={newBenefit.description}
                  onChange={(e) =>
                    setNewBenefit((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description (optional)"
                  className="w-full px-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600"
                />
              </div>
              <div className="md:col-span-2">
                <select
                  value={newBenefit.icon}
                  onChange={(e) =>
                    setNewBenefit((prev) => ({
                      ...prev,
                      icon: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="w-full h-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all flex items-center justify-center"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          {benefits.length > 0 ? (
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-primary-900/10 border border-primary-800 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-primary-400 text-sm font-mono">
                      {benefit.icon}
                    </span>
                    <div>
                      <p className="text-light font-medium">{benefit.title}</p>
                      {benefit.description && (
                        <p className="text-sm text-primary-400">
                          {benefit.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(index)}
                    className="p-2 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-primary-500">
              No benefits added yet. Add benefits to make this ticket more
              attractive.
            </div>
          )}
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="400"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
        >
          <h2 className="font-heading text-xl font-bold text-light mb-6">
            Status
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-5 h-5 rounded bg-dark border-primary-800 text-primary-600 focus:ring-primary-600"
              />
              <div>
                <p className="text-light font-medium">Active</p>
                <p className="text-sm text-primary-400">
                  Tickets can be purchased when active
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_visible"
                checked={formData.is_visible}
                onChange={handleInputChange}
                className="w-5 h-5 rounded bg-dark border-primary-800 text-primary-600 focus:ring-primary-600"
              />
              <div>
                <p className="text-light font-medium">Visible</p>
                <p className="text-sm text-primary-400">
                  Show this ticket type on the public ticket page
                </p>
              </div>
            </label>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="500"
          className="flex items-center justify-end gap-4"
        >
          <Link to="/dashboard/tickets">
            <button
              type="button"
              className="px-6 py-3 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={createTicketMutation.isPending}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {createTicketMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={18} />
                Create Ticket Type
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketType;