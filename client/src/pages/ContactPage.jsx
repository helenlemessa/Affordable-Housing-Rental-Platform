import { useTranslation } from "react-i18next";
import contactImage from "../assets/contact.jpg"; // Replace with your image
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useState } from "react";

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === "am";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log("Form submitted:", formData);
    alert(t("contact.successMessage", { defaultValue: "Thank you! We'll contact you soon." }));
  };

  return (
    <div className={`min-h-screen ${isAmharic ? "font-noto-sans-ethiopic" : ""}`} dir="ltr">
      {/* Hero Section */}
      <section className="relative h-64 bg-gray-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("contactus.title", { defaultValue: "Contact Us" })}
          </h1>
          <p className="text-lg text-gray-300">
            {t("contactus.subtitle", {
              defaultValue: "We're here to help with your rental needs",
            })}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Information */}
          <div className="lg:w-1/3 bg-gray-50 p-8 rounded-lg shadow-md text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {t("contactus.infoTitle", { defaultValue: "Get in Touch" })}
            </h2>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start">
                <MapPin className="mt-1 mr-4 text-blue-600" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {t("contactus.addressTitle", { defaultValue: "Our Office" })}
                  </h3>
                  <p className="text-gray-600">
                    {t("contactus.address", {
                      defaultValue: "Bole Road, Addis Ababa, Ethiopia",
                    })}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center">
                <Phone className="mr-4 text-green-600" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {t("contactus.phoneTitle", { defaultValue: "Phone" })}
                  </h3>
                  <p className="text-gray-600">+251 912 345 678</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center">
                <Mail className="mr-4 text-red-600" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {t("contactus.emailTitle", { defaultValue: "Email" })}
                  </h3>
                  <p className="text-gray-600">info@renteasy.com</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center">
                <Clock className="mr-4 text-yellow-600" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {t("contactus.hoursTitle", { defaultValue: "Working Hours" })}
                  </h3>
                  <p className="text-gray-600">
                    {t("contactus.hours", {
                      defaultValue: "Mon-Fri: 8:30AM - 5:30PM",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8 flex justify-start space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-400">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-600">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3 text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {t("contactus.formTitle", { defaultValue: "Send Us a Message" })}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contactus.nameLabel", { defaultValue: "Your Name" })}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contactus.emailLabel", { defaultValue: "Email Address" })}
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contactus.messageLabel", { defaultValue: "Your Message" })}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Send className="mr-2" size={18} />
                {t("contactus.submitButton", { defaultValue: "Send Message" })}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {t("contactus.findUs", { defaultValue: "Find Us on the Map" })}
        </h2>
        <div className="bg-gray-200 h-64 rounded-lg overflow-hidden">
          {/* Replace with your actual map embed */}
          <iframe
            title="Office Location"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src="https://maps.google.com/maps?q=Bole%20Road%2C%20Addis%20Ababa&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="border-0"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
