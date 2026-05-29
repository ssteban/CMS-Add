# 🚀 CMS Headless Multi-tenant

El **CMS Multi-tenant Open Source** diseñado específicamente para desarrolladores y creadores de contenido que utilizan webs estáticas. 

Gestiona el contenido de múltiples sitios web desde un solo panel de control integrado y conecta tus frontends estáticos fácilmente mediante nuestra API ultra rápida.

## ✨ Características Principales

* **🏢 Multi-Proyecto (Multi-tenant):** Administra varias páginas web desde una única cuenta y panel de control. Genera una API Key diferente para cada proyecto.
* **⚡ Edición en Tiempo Real:** Actualiza tus textos, URLs de botones e imágenes al instante sin tocar una sola línea de código.
* **🚀 API Ultra Rápida:** Entrega tu contenido en milisegundos a cualquier frontend utilizando nuestra arquitectura optimizada con FastAPI.
* **💻 Agnostic Frontend:** Consume tu contenido en formato JSON desde cualquier web estática, framework (React, Vue, Astro, Angular) o aplicación móvil.
* **🎨 Diseño Moderno:** Interfaz de usuario limpia, profesional y responsiva construida con React, Tailwind CSS y Vite.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, React Router.
* **Backend:** FastAPI (Python) - *(En desarrollo)*.

## 🚀 Cómo Empezar (Clonar y Ejecutar)

Sigue estos pasos para obtener una copia local del proyecto y ejecutarlo en tu máquina.

### 1. Clonar el repositorio

Abre tu terminal y ejecuta el siguiente comando para descargar el código fuente:

```bash
git clone https://github.com/ssteban/CMS-Add.git
cd CMS-Add
```

### 2. Configurar y levantar el Frontend

El frontend de la aplicación web está construido con React y Vite.

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar las dependencias necesarias
npm install

# Iniciar el servidor de desarrollo local
npm run dev
```

Una vez que el servidor esté corriendo, abre tu navegador web y visita `http://localhost:5173` (o el puerto que te indique la terminal).

## 📄 Estructura del Proyecto

* `/frontend/`: Contiene toda la aplicación web cliente (Landing page, Login, Registro, Panel de administración).
* `/backend/`: Contiene la lógica del servidor, base de datos y la API.

## 🤝 Contribuir

¡Las contribuciones son totalmente bienvenidas! Si tienes ideas para mejorar este CMS, por favor:
1. Haz un Fork del repositorio.
2. Crea una rama para tu nueva característica (`git checkout -b feature/NuevaCaracteristica`).
3. Haz commit de tus cambios (`git commit -m 'Añadir alguna característica'`).
4. Haz push a la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un Pull Request.

## 📝 Licencia

Este proyecto es de código abierto.
