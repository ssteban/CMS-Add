import { useState } from 'react';
import { BookOpen, Copy, Check, Key, Code, Database, Globe, ArrowRight, FileJson, Lock, Zap } from 'lucide-react';

const Docs = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // silent
    }
  };

  const codeSnippets = [
    {
      lang: 'cURL',
      code: `curl "<url-del-backend>/api/v1/public/content?api_key=<tu-api-key>"`,
    },
    {
      lang: 'JavaScript (fetch)',
      code: `const response = await fetch(
  "<url-del-backend>/api/v1/public/content?api_key=<tu-api-key>"
);
const data = await response.json();
console.log(data);`,
    },
    {
      lang: 'JavaScript (HTML)',
      code: `fetch("<url-del-backend>/api/v1/public/content?api_key=<tu-api-key>")
  .then(res => res.json())
  .then(data => {
    document.getElementById("titulo").textContent =
      data.data.find(f => f.key === "hero_title")?.value;
  });`,
    },
    {
      lang: 'Python',
      code: `import requests

response = requests.get(
  "<url-del-backend>/api/v1/public/content",
  params={"api_key": "<tu-api-key>"}
)
data = response.json()
print(data)`,
    },
  ];

  const fieldTypes = [
    { type: 'text', description: 'Texto plano. Ideal para títulos, descripciones, párrafos.', ejemplo: '"Hola Mundo"' },
    { type: 'image', description: 'URL de una imagen. Se renderiza con una etiqueta <img>.', ejemplo: '"https://ejemplo.com/foto.jpg"' },
    { type: 'link', description: 'URL de un enlace. Se usa en botones o anchors <a>.', ejemplo: '"https://ejemplo.com"' },
    { type: 'number', description: 'Valor numérico (entero o decimal).', ejemplo: '42' },
    { type: 'color', description: 'Código de color hexadecimal.', ejemplo: '"#1e40af"' },
    { type: 'richtext', description: 'Texto enriquecido con formato (HTML básico).', ejemplo: '"<p>Hola <strong>mundo</strong></p>"' },
  ];

  return (
    <section className="bg-slate-50 dark:bg-slate-900 flex-grow py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <BookOpen size={18} />
            Documentación para Desarrolladores
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            API del CMS Headless
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Aprende a consumir el contenido de tus proyectos desde cualquier frontend estático usando nuestra API pública.
          </p>
        </div>

        {/* 1. Introducción */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Globe size={22} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">¿Cómo funciona?</h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Este CMS Headless te permite gestionar el contenido de tus sitios web desde un panel de administración.
              Una vez que defines los campos y publicas el contenido, este queda disponible a través de una API pública
              que cualquier frontend puede consumir.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Flujo de trabajo:</p>
              <div className="flex flex-col sm:flex-row items-center gap-3 text-sm">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 px-3 py-1.5 rounded-lg font-medium">Panel CMS</span>
                <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block" />
                <span className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 px-3 py-1.5 rounded-lg font-medium">Crear Campos</span>
                <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block" />
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 px-3 py-1.5 rounded-lg font-medium">Publicar</span>
                <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block" />
                <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-medium">API Pública</span>
                <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block" />
                <span className="bg-slate-900 text-white px-3 py-1.5 rounded-lg font-medium">Frontend</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Estructura del JSON */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
              <FileJson size={22} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Estructura del JSON</h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              El endpoint público devuelve un objeto JSON con la siguiente estructura. Todos los campos que hayas
              definido en el editor aparecerán dentro del array <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-sm font-mono">data</code>.
            </p>

            <div className="relative">
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-5 text-sm font-mono leading-relaxed overflow-x-auto">
                <code>{`{
  "website": "nombre-del-proyecto",
  "total_fields": 3,
  "data": [
    {
      "key": "hero_title",
      "value": "Bienvenido a mi sitio",
      "type": "text"
    },
    {
      "key": "hero_image",
      "value": "https://ejemplo.com/foto.jpg",
      "type": "image"
    },
    {
      "key": "cta_link",
      "value": "https://ejemplo.com/contacto",
      "type": "link"
    }
  ]
}`}</code>
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">website</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nombre del proyecto. Identificador del sitio al que pertenece el contenido.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">total_fields</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Número total de campos definidos en este proyecto.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">data[]</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Array con todos los campos. Cada uno tiene key, value y type.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Endpoint Público */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <Zap size={22} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Endpoint de Contenido</h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Para obtener el JSON publicado, haz una petición GET al siguiente endpoint.
              Reemplaza los valores entre <code className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded text-sm font-mono">&lt;&gt;</code> con los datos de tu proyecto.
            </p>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <code className="text-emerald-400 font-mono text-sm sm:text-base break-all">
                GET /api/v1/public/content?api_key=&lt;tu-api-key&gt;
              </code>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-4 items-start">
              <Lock className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-800 mb-1">Importante</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  La URL base dependerá de dónde esté alojado tu backend. Por ejemplo,
                  si lo tienes en tu servidor propio o en la nube, la URL cambiará.
                  En local, usa <code className="text-amber-800 bg-amber-100 dark:bg-amber-900/20 px-1 rounded text-xs font-mono">http://localhost:8000</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Autenticación */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
              <Key size={22} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Autenticación</h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Cada proyecto tiene una o varias <strong>API Keys</strong> que funcionan como tokens de autenticación.
              Sin una API Key válida, el endpoint devolverá un error 404.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Obtener tu API Key</p>
                <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside">
                  <li>Ve a <strong>Mis Proyectos</strong></li>
                  <li>Selecciona un proyecto</li>
                  <li>Haz clic en <strong>Credenciales</strong></li>
                  <li>Genera una nueva llave</li>
                  <li><strong>Guárdala</strong> — solo se muestra una vez</li>
                </ol>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Formato</p>
                <div className="text-sm space-y-2">
                  <p className="text-slate-600 dark:text-slate-400">Las API Keys tienen el formato:</p>
                  <code className="block bg-slate-900 text-emerald-400 rounded-lg p-3 text-xs font-mono break-all">
                    cms_live_abc123def456...
                  </code>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Se pasan como query param: <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1 rounded">?api_key=...</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Ejemplos de código */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <Code size={22} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ejemplos de consumo</h2>
          </div>

          <div className="space-y-6">
            {codeSnippets.map((snippet, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{snippet.lang}</span>
                  <button
                    onClick={() => copyToClipboard(snippet.code, index)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                  >
                    {copiedIndex === index ? (
                      <><Check size={14} className="text-emerald-500" /> Copiado</>
                    ) : (
                      <><Copy size={14} /> Copiar</>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-sm font-mono leading-relaxed overflow-x-auto">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Tipos de campo */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-900/30 text-sky-600 rounded-lg">
              <Database size={22} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tipos de campo</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Tipo</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Descripción</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Ejemplo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {fieldTypes.map((ft) => (
                  <tr key={ft.type} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="py-3 px-4">
                      <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-mono font-bold">
                        {ft.type}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{ft.description}</td>
                    <td className="py-3 px-4">
                      <code className="text-xs font-mono text-blue-600 break-all">{ft.ejemplo}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            El campo <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-xs font-mono">type</code> en el JSON te permite
            saber cómo renderizar cada valor en tu frontend. Por ejemplo, si el tipo es{' '}
            <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-xs font-mono">image</code> debes usar una{' '}
            etiqueta <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-xs font-mono">&lt;img&gt;</code>,{' '}
            si es <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-xs font-mono">link</code> un{' '}
            <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-xs font-mono">&lt;a&gt;</code>, etc.
          </p>
        </div>

        {/* 7. Publicación */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
              <Lock size={22} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Guardar vs Publicar</h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              El sistema tiene dos acciones diferenciadas para que puedas trabajar en tu contenido
              sin afectar lo que ven tus usuarios.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <p className="font-bold text-slate-900 dark:text-slate-100">Guardar</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Persiste los campos en la base de datos como borrador.
                  No afecta el JSON que devuelve el endpoint público.
                  Úsalo mientras editas y ajustas el contenido.
                </p>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <p className="font-bold text-slate-900 dark:text-slate-100">Publicar</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Genera un snapshot del JSON con los campos actuales y lo guarda en la columna{' '}
                  <code className="text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 px-1 rounded text-xs font-mono mx-1">published_json</code>.
                  Solo cuando publicas, el endpoint público refleja los cambios.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3 items-start">
              <Zap className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold text-blue-800 mb-1">Consejo</p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Para desarrollo, puedes consumir el endpoint con la API Key de prueba.
                  En producción, <strong>siempre verifica que el contenido esté publicado</strong>
                  antes de hacer el deploy de tu frontend.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Ejemplo práctico */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg">
              <Code size={22} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ejemplo práctico</h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Imagina que has creado un proyecto con tres campos: <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-sm font-mono">hero_title</code>,
              <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-sm font-mono">hero_image</code> y
              <code className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-sm font-mono">cta_link</code>.
              Una vez publicado, desde tu frontend puedes consumirlos así:
            </p>

            <pre className="bg-slate-900 text-slate-100 rounded-xl p-5 text-sm font-mono leading-relaxed overflow-x-auto">
              <code>{`// 1. Obtener el JSON
const res = await fetch(
  "<url-del-backend>/api/v1/public/content?api_key=<tu-api-key>"
);
const json = await res.json();

// 2. Renderizar en tu HTML
document.getElementById("titulo").innerHTML =
  json.data.find(f => f.key === "hero_title")?.value;

document.getElementById("imagen").src =
  json.data.find(f => f.key === "hero_image")?.value;

document.getElementById("boton").href =
  json.data.find(f => f.key === "cta_link")?.value;

document.getElementById("boton").textContent = "Comenzar";`}</code>
            </pre>

            <p>
              De esta manera, cambias el contenido desde el panel CMS y tu web se actualiza
              automáticamente sin necesidad de hacer un nuevo deploy.
            </p>
          </div>
        </div>

        {/* Footer de la documentación */}
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ¿Tienes más preguntas?{' '}
            <a
              href="https://github.com/ssteban/CMS-Add"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Abre un issue en GitHub
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Docs;
