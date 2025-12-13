import { useTranslation } from "react-i18next";

const TestimonialsSection = () => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  // Testimonial data with translations
  const testimonials = [
    {
      id: 1,
      initials: "JD",
      name: t('testimonials.1.name', { defaultValue: "John D." }),
      role: t('testimonials.1.role', { defaultValue: "Renter • New York" }),
      quote: t('testimonials.1.quote', {
        defaultValue: "Found my perfect apartment in 3 days! The transparent pricing saved me from hidden fees I'd encountered elsewhere."
      }),
      rating: 5,
      color: "blue"
    },
    {
      id: 2,
      initials: "SM",
      name: t('testimonials.2.name', { defaultValue: "Sarah M." }),
      role: t('testimonials.2.role', { defaultValue: "Landlord • Chicago" }),
      quote: t('testimonials.2.quote', {
        defaultValue: "As a small property owner, the affordable listing fees made all the difference. My unit was rented in a week!"
      }),
      rating: 5,
      color: "green"
    },
    {
      id: 3,
      initials: "TP",
      name: t('testimonials.3.name', { defaultValue: "Tyler P." }),
      role: t('testimonials.3.role', { defaultValue: "Student • Austin" }),
      quote: t('testimonials.3.quote', {
        defaultValue: "Budget-friendly options for students with verified listings. No more scam hunting – this platform is a lifesaver."
      }),
      rating: 4,
      color: "purple"
    }
  ];

  return (
    <section className="py-16 pl-8  bg-white" dir={isAmharic ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12  ">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t("testimonials.title", { defaultValue: "Trusted by Renters & Landlords" })}
          </h2>
          <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${isAmharic ? 'font-noto-sans-ethiopic' : ''}`}>
            {t("testimonials.subtitle", { defaultValue: "Don't just take our word for it. Here's what our community says." })}
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-gray-80 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={`flex items-center mb-4 ${isAmharic ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 ${`bg-${testimonial.color}-100`} rounded-full flex items-center justify-center ${isAmharic ? 'ml-4' : 'mr-4'}`}>
                  <span className={`${`text-${testimonial.color}-600`} font-bold`}>
                    {testimonial.initials}
                  </span>
                </div>
                <div className={isAmharic ? 'text-right' : 'text-left'}>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className={`text-gray-700 italic ${isAmharic ? 'text-right font-noto-sans-ethiopic' : 'text-left'}`}>
                "{testimonial.quote}"
              </p>
              <div className={`mt-3 flex text-yellow-400 ${isAmharic ? 'justify-end' : 'justify-start'}`}>
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < testimonial.rating ? '★' : '☆'}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            {t("testimonials.cta", { defaultValue: "Join Our Community" })}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;