import { useTranslation } from "react-i18next";
import map from "../../assets/map.png";

const ContactSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left side: Map Image - Added padding and centering */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={map}
            alt="Map View"
            className="w-full max-w-lg h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Right side: Contact Information */}
        <div className="w-full md:w-1/2 px-4 md:px-8">
          <h2 className="text-3xl font-semibold mb-4 text-center md:text-left">
            {t("Contact.connectRentersLandowners")}
          </h2>
          <p className="text-lg mb-6 text-center md:text-left">{t("Contact.easyConnectionText")}</p>

          {/* Contact items in separate lines with consistent styling */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
              <span className="font-semibold min-w-[80px]">{t("Contact.email")}:</span>
              <a href="mailto:info@rentalapp.com" className="text-blue-600 hover:underline">
                info@rentalapp.com
              </a>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
              <span className="font-semibold min-w-[80px]">{t("Contact.phone")}:</span>
              <span>+1 (123) 456-7890</span>
            </div>
          </div>

          <div className="text-center md:text-left">
            <button className="bg-yellow-500 text-gray-800 py-2 px-6 rounded-md hover:bg-yellow-400 transition-colors">
              {t("Contact.contactUs")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;