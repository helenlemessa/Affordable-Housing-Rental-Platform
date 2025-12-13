import React from "react";
import { useTranslation } from "react-i18next";
import home1 from "../../assets/home1.png";
import  { memo } from 'react';
const Hero =  memo(() => {
  const { t, i18n } = useTranslation( );

  return (
    <section
      className="relative h-[80vh] bg-cover bg-center flex items-center justify-start text-white"
      style={{
        backgroundImage: `url(${home1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 px-6 md:px-16 text-left max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
          {t("hero.headline") || "Find Your Perfect Home"}
        </h1>
        <p className="text-base md:text-xl mb-6">
          {t("hero.subtext") || "Discover thousands of properties across the country"}
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow transition">
          {t("hero.browse") || "Browse Properties"}
        </button>
      </div>
    </section>
  );
});

export default Hero;