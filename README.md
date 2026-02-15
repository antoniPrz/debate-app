# DebateFlow 🎯

Aplicación de debates moderados por IA que analiza argumentos en busca de falacias lógicas, ambigüedades, errores de razonamiento y sesgos cognitivos.

## Características

- 💬 **Chat en tiempo real** - Debates asíncronos con polling
- 🤖 **Análisis de IA** - GPT-4o-mini detecta falacias y errores lógicos
- 📖 **Definiciones compartidas** - Panel colaborativo de términos clave
- ⏸️ **Pausar/Reanudar** - Control total del flujo del debate
- 🎨 **UI Premium** - Dark mode con glassmorphism y animaciones

## Stack Tecnológico

- **Frontend**: Next.js 16 (App Router) + React 19
- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite + Prisma 6
- **Autenticación**: NextAuth.js
- **IA**: OpenAI API (GPT-4o-mini + Whisper)
- **Estilos**: Vanilla CSS

## Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/debateflow.git
cd debateflow/debate-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Generar Prisma Client y migrar DB
npx prisma generate
npx prisma migrate dev --name init

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Variables de Entorno

Crea un archivo `.env` con:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu-secret-aleatorio-muy-largo"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."
```

## Deploy en Render

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones completas.

**Resumen rápido:**
1. Sube el código a GitHub
2. Crea un Web Service en Render
3. Configura disco persistente en `/data` (1GB)
4. Agrega variables de entorno
5. Deploy automático

## Uso

1. **Registrarse** - Crea una cuenta con email/password
2. **Crear debate** - Define título, tema y descripción
3. **Invitar oponente** - Comparte el código de 6 caracteres
4. **Debatir** - Envía argumentos y recibe análisis de IA en tiempo real
5. **Definir términos** - Propón y acuerda definiciones clave
6. **Pausar/Finalizar** - Controla el flujo del debate

## Estructura del Proyecto

```
debate-app/
├── src/
│   ├── app/              # Pages y API routes
│   │   ├── api/          # Endpoints REST
│   │   ├── debate/       # Chat del debate
│   │   ├── dashboard/    # Lista de debates
│   │   └── ...
│   ├── components/       # Componentes React
│   ├── lib/              # Utilidades (Prisma, AI)
│   └── generated/        # Prisma Client (auto-generado)
├── prisma/
│   └── schema.prisma     # Modelo de datos
├── public/               # Assets estáticos
└── ...
```

## Licencia

MIT

## Autor

Tu nombre
