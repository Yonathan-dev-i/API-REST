# 🚀 Instalación y Ejecución Local

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu sistema:

- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** o **pnpm**

## 📥 Pasos para Instalar

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Yonathan-dev-i/API-REST.git
cd API-REST
```

### 2. Instalar Dependencias

**Con npm:**
```bash
npm install
```

**Con pnpm:**
```bash
pnpm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Luego edita el archivo `.env` con tus configuraciones:

```env
# Ejemplo de configuración
VITE_API_URL=http://localhost:3000
PORT=3000

# API Keys requeridas
NEWS_API_KEY=tu_api_key_aqui
TMDB_API_KEY=tu_api_key_aqui
```

#### 🔑 Obtener las API Keys

Para que los módulos de **Noticias** y **Películas** funcionen correctamente, necesitas crear tus propias API keys:

**News API Key:**
1. Visita [https://newsapi.org/](https://newsapi.org/)
2. Regístrate gratis
3. Copia tu API key
4. Pégala en el archivo `.env` como valor de `NEWS_API_KEY`

**TMDB API Key:**
1. Visita [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Crea una cuenta
3. Ve a Configuración → API
4. Solicita una API key (opción gratuita)
5. Copia tu API key
6. Pégala en el archivo `.env` como valor de `TMDB_API_KEY`

> ⚠️ **Importante**: Sin estas API keys, los módulos de Noticias y Películas no funcionarán correctamente.

## ▶️ Ejecutar el Proyecto

### Modo Desarrollo

El proyecto tiene dos partes: el frontend (Vite + React) y el backend (servidor API).

#### Opción 1: Ejecutar Ambos Servicios Simultáneamente

**Con npm:**
```bash
npm run dev
```

#### Opción 2: Ejecutar Frontend y Backend por Separado

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:client
```

### Modo Producción

#### 1. Construir el proyecto:

```bash
npm run build
```

#### 2. Ejecutar la versión de producción:

```bash
npm run preview
```

## 🌐 Acceder a la Aplicación

Una vez que el proyecto esté ejecutándose:

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `dev` | Inicia el servidor de desarrollo |
| `build` | Compila el proyecto para producción |
| `preview` | Previsualiza la versión de producción |
| `lint` | Ejecuta el linter para revisar el código |

## 🐛 Solución de Problemas

### Error de puerto ocupado

Si el puerto 3000 o 5173 está ocupado, puedes cambiarlo en:
- Backend: Modifica `PORT` en el archivo `.env`
- Frontend: Modifica `vite.config.ts`

### Error de dependencias

Si encuentras problemas con las dependencias:

```bash
# Limpia la caché y reinstala
rm -rf node_modules
rm package-lock.json
npm install
```

### Error de permisos

En sistemas Unix/Linux, puede que necesites permisos adicionales:

```bash
sudo chown -R $USER:$USER .
```

## 📦 Tecnologías Utilizadas

- **Frontend**: React + Vite + TypeScript
- **Styling**: TailwindCSS + Shadcn/ui
- **Backend**: Node.js
- **Build Tool**: Vite
- **Package Manager**: npm

