# Deploy DebateFlow en Render

Esta guía te llevará paso a paso para hacer deploy de DebateFlow en Render.

## Prerequisitos

1. Cuenta en [Render](https://render.com) (gratis)
2. Cuenta en GitHub
3. Tu código debe estar en un repositorio de GitHub

---

## Paso 1: Subir el Código a GitHub

Si aún no lo has hecho:

```bash
cd debate-app

# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - DebateFlow MVP"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/debateflow.git
git branch -M main
git push -u origin main
```

---

## Paso 2: Crear el Servicio en Render

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `debateflow`

---

## Paso 3: Configurar el Servicio

En la página de configuración:

### Configuración Básica
- **Name**: `debateflow` (o el nombre que prefieras)
- **Region**: Elige la más cercana (ej: Oregon)
- **Branch**: `main`
- **Root Directory**: (dejar vacío)
- **Environment**: `Node`
- **Build Command**: 
  ```
  npm install && npx prisma generate && npx prisma migrate deploy && npm run build
  ```
- **Start Command**:
  ```
  npm start
  ```

### Plan
- Selecciona **Free** (suficiente para pruebas)

---

## Paso 4: Variables de Entorno

En la sección **Environment Variables**, agrega:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:/data/production.db` |
| `NEXTAUTH_SECRET` | Click en "Generate" (o usa uno aleatorio largo) |
| `NEXTAUTH_URL` | `https://TU-APP.onrender.com` (lo sabrás después del deploy) |
| `OPENAI_API_KEY` | Tu API key de OpenAI |

> **Nota**: Para `NEXTAUTH_URL`, primero deja un valor temporal como `https://temp.com`. Después del primer deploy, actualízalo con la URL real.

---

## Paso 5: Configurar Disco Persistente (CRÍTICO para SQLite)

**Esto es MUY importante** para que SQLite funcione:

1. Scroll hasta la sección **"Disks"**
2. Click en **"Add Disk"**
3. Configura:
   - **Name**: `debateflow-data`
   - **Mount Path**: `/data`
   - **Size**: `1 GB` (suficiente)

---

## Paso 6: Deploy

1. Click en **"Create Web Service"**
2. Render comenzará a hacer el deploy (toma ~5-10 minutos)
3. Verás los logs en tiempo real

---

## Paso 7: Actualizar NEXTAUTH_URL

Una vez que el deploy termine:

1. Copia la URL de tu app (algo como `https://debateflow-abc123.onrender.com`)
2. Ve a **Environment** en el dashboard de Render
3. Edita `NEXTAUTH_URL` y pon la URL real
4. Click en **"Save Changes"**
5. Render hará un redeploy automático

---

## Paso 8: Verificar

1. Abre tu URL: `https://TU-APP.onrender.com`
2. Deberías ver la landing page
3. Intenta registrarte y crear un debate

---

## Troubleshooting

### Error: "Database is locked"
- Asegúrate de que el disco persistente esté configurado correctamente en `/data`

### Error: "NEXTAUTH_URL mismatch"
- Verifica que `NEXTAUTH_URL` coincida exactamente con la URL de Render

### Error: "OpenAI API key invalid"
- Verifica que tu `OPENAI_API_KEY` sea correcta

### La app se "duerme" después de 15 min
- Es normal en el plan gratuito. La primera request después de dormir toma ~30 segundos

---

## Alternativa: Deploy con render.yaml (Automático)

Si prefieres un deploy más automatizado, Render puede leer el archivo `render.yaml` que ya está en el proyecto:

1. En Render, ve a **"Blueprints"**
2. Conecta tu repo
3. Render detectará automáticamente `render.yaml`
4. Solo necesitas configurar las variables de entorno secretas:
   - `NEXTAUTH_URL`
   - `OPENAI_API_KEY`

---

## Próximos Pasos

Una vez desplegado:
- Comparte la URL con tu amigo
- Ambos pueden registrarse y debatir
- Monitorea los logs en el dashboard de Render

¡Listo! 🚀
