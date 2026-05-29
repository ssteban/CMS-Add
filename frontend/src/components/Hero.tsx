import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-gradient-to-b from-blue-700 from-50% via-blue-500 via-85% to-white min-h-[90vh] pt-24 sm:pt-32 pb-24 sm:pb-32 flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-8 drop-shadow-sm">
          El CMS Multi-tenant Open Source para tus Webs Estáticas
        </h1>
        <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto mb-10 drop-shadow-sm">
          Gestiona el contenido de múltiples sitios web desde un solo lugar. Conecta tus frontend estáticos fácilmente mediante nuestra API.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 text-center">
            Comenzar Gratis / Registrarse
          </Link>
          <a
            href="https://github.com/ssteban/CMS-Add"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 hover:border-slate-700 font-semibold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Ver en GitHub
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
