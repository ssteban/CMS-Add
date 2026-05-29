import { useState, useEffect } from 'react';

const features = [
  {
    title: 'Edición en Tiempo Real',
    description: 'Actualiza tus textos e imágenes al instante sin depender de un desarrollador.',
    image: 'https://placehold.co/800x500/2563eb/ffffff?text=Edicion+Tiempo+Real' // blue-600
  },
  {
    title: 'Multi-Proyecto',
    description: 'Administra varias páginas web desde un solo panel de control integrado.',
    image: 'https://placehold.co/800x500/4f46e5/ffffff?text=Multi-Proyecto' // indigo-600
  },
  {
    title: 'API Ultra Rápida',
    description: 'Nuestra API entrega tu contenido en milisegundos a cualquier frontend.',
    image: 'https://placehold.co/800x500/9333ea/ffffff?text=API+Ultra+Rapida' // purple-600
  }
];

const FeaturesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white py-24 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Características Destacadas</h2>
          <p className="mt-4 text-lg text-slate-600">Todo lo que necesitas para escalar tu contenido rápidamente.</p>
        </div>

        <div className="relative bg-slate-50 rounded-2xl p-6 sm:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          
          <div className="flex-1 text-center md:text-left z-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{features[currentIndex].title}</h3>
            <p className="text-lg text-slate-600 mb-8">{features[currentIndex].description}</p>
            
            <div className="flex justify-center md:justify-start gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-blue-600' : 'bg-slate-300'}`}
                  aria-label={`Ir a la diapositiva ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <img 
              src={features[currentIndex].image} 
              alt={features[currentIndex].title}
              className="w-full rounded-xl shadow-lg object-cover aspect-video"
            />
          </div>

          <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow hover:bg-white md:-left-4 text-slate-600 transition z-20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow hover:bg-white md:-right-4 text-slate-600 transition z-20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          
        </div>
      </div>
    </section>
  );
};

export default FeaturesCarousel;
