import React from 'react';
import { useTranslation } from 'react-i18next';

const Discover = () => {
  const { t } = useTranslation();

  return (
    <section className="p-8 bg-gray-50">
      {/* Main Heading */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('home.discoverTitle')}</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('home.discoverDescription')}
        </p>
      </div>

      {/* Grid Layout for Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 cursor-pointer">
        {/* Feature 1: Trustworthy Connections */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('home.feature1Title')}</h3>
          <p className="text-gray-600">
            {t('home.feature1Description')}
          </p>
        </div>

        {/* Feature 2: Personalized Recommendations */}
        <div className="p-6 bg-white rounded-lg shadow-lg cursor-pointer">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('home.feature2Title')}</h3>
          <p className="text-gray-600">
            {t('home.feature2Description')}
          </p>
        </div>

        {/* Feature 3: Interactive Map View */}
        <div className="p-6 bg-white rounded-lg shadow-lg cursor-pointer">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('home.feature3Title')}</h3>
          <p className="text-gray-600">
            {t('home.feature3Description')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Discover ;
