import { useTranslation } from "react-i18next";
import { useEffect } from 'react';
import teamImage from "../assets/team.jpg";
import { Building, Globe, ShieldCheck, Heart } from "lucide-react";

const AboutUs = () => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  useEffect(() => {
    console.log('Current language:', i18n.language);
    console.log('Translation resources:', i18n.store.data);
    console.log('About title:', t('about.heroTitle'));
  }, [i18n.language, t]);

  return (
    <div className={`min-h-screen ${isAmharic ? 'font-noto-sans-ethiopic' : ''}`}>
      {/* Hero Section */}
      <section className="relative h-96 bg-gray-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("about.heroTitle", { defaultValue: "About RentEasy" })}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t("about.heroSubtitle", {
              defaultValue: "Transforming the way Ethiopians find affordable housing"
            })}
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <img 
              src={teamImage} 
              alt={t("about.teamAlt", { defaultValue: "RentEasy team working together" })}
              className="rounded-lg shadow-xl w-full"
            />
          </div>
          <div className="md:w-1/2 text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {t("about.ourStory", { defaultValue: "Our Story" })}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {t("about.storyPart1", {
                defaultValue: "Founded in 2023, RentEasy began with a simple mission: to make finding affordable housing in Ethiopia stress-free and transparent."
              })}
            </p>
            <p className="text-lg text-gray-600">
              {t("about.storyPart2", {
                defaultValue: "After experiencing the challenges of rental markets firsthand, our team set out to create a platform that benefits both renters and property owners through fair pricing and verified listings."
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            {t("about.ourValues", { defaultValue: "Our Values" })}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Value 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <Building className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">
                {t("about.value1Title", { defaultValue: "Affordable Housing" })}
              </h3>
              <p className="text-gray-600">
                {t("about.value1Desc", {
                  defaultValue: "We prioritize listings that offer real value for money in Ethiopia's competitive rental market."
                })}
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <Globe className="text-green-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">
                {t("about.value2Title", { defaultValue: "Nationwide Access" })}
              </h3>
              <p className="text-gray-600">
                {t("about.value2Desc", {
                  defaultValue: "From Addis Ababa to regional cities, we connect you with properties across Ethiopia."
                })}
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <ShieldCheck className="text-yellow-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">
                {t("about.value3Title", { defaultValue: "Verified Listings" })}
              </h3>
              <p className="text-gray-600">
                {t("about.value3Desc", {
                  defaultValue: "Every property is personally vetted by our team to ensure accuracy and prevent scams."
                })}
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <Heart className="text-red-600 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">
                {t("about.value4Title", { defaultValue: "Community Focus" })}
              </h3>
              <p className="text-gray-600">
                {t("about.value4Desc", {
                  defaultValue: "We reinvest in housing education programs and tenant-landlord mediation services."
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          {t("about.joinUs", { defaultValue: "Join Our Mission" })}
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          {t("about.ctaText", {
            defaultValue: "Whether you're looking to rent or list a property, we're here to make the process simple and fair for everyone."
          })}
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
          {t("about.ctaButton", { defaultValue: "Get Started Today" })}
        </button>
      </section>
    </div>
  );
};

export default AboutUs;
