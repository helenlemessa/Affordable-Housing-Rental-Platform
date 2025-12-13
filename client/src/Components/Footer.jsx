import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === "am";

  return (
    <footer className={`bg-gray-900 text-white pt-12 pb-6 font-noto-sans-ethiopic`} dir="ltr">
      <div className={`container mx-auto px-4 ${isAmharic ? "font-noto-sans-ethiopic" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo + Description */}
          <div>
            <h2 className="text-2xl font-bold text-blue-400">RentEasy</h2>
            <p className="text-gray-300 mt-4 text-left">
              {t("footer.description")}
            </p>
            <div className="flex space-x-4 mt-4">
              <Facebook className="text-gray-300 hover:text-blue-400 cursor-pointer" />
              <Twitter className="text-gray-300 hover:text-blue-400 cursor-pointer" />
              <Instagram className="text-gray-300 hover:text-blue-400 cursor-pointer" />
              <Linkedin className="text-gray-300 hover:text-blue-400 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              {t("footer.quickLinks")}
            </h3>
            <ul className="text-left space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">{t("nav.home")}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">{t("nav.browse")}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">{t("nav.about")}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">{t("nav.contact")}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              {t("footer.contact")}
            </h3>
            <ul className="text-left space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-1" />
                <span className="text-gray-300">{t("footer.address")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} />
                <span className="text-gray-300">+251 912 345 678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} />
                <span className="text-gray-300">info@renteasy.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              {t("footer.newsletter")}
            </h3>
            <p className="text-gray-300 mb-3 text-left">
              {t("footer.newsletterText")}
            </p>
            <div className="flex w-full">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="px-3 py-2 bg-gray-700 text-white rounded-l w-full focus:outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r">
                {t("footer.subscribe")}
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 font-noto-sans-ethiopic">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} RentEasy. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              {t("footer.privacy")}
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              {t("footer.terms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
