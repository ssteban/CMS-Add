const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Crea tu cuenta y registra tus webs.',
      description: 'Regístrate en segundos y añade tus sitios. Genera tu API Key al instante para cada proyecto.'
    },
    {
      number: '02',
      title: 'Administra el contenido.',
      description: 'Cambia textos, URLs de botones y fotos desde nuestro panel intuitivo sin tocar una sola línea de código.'
    },
    {
      number: '03',
      title: 'Conéctalo a tu Frontend.',
      description: 'Consume el JSON optimizado desde cualquier web estática o framework usando nuestra API con FastAPI.'
    }
  ];

  return (
    <section className="bg-slate-50 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">¿Cómo funciona?</h2>
          <p className="mt-4 text-lg text-slate-600">Una arquitectura simple diseñada para desarrolladores y creadores de contenido.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 ease-out cursor-default">
              <div className="text-5xl font-black text-blue-600 mb-6 drop-shadow-sm">{step.number}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
