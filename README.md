# 🏢 inHOUSE 52 - Plataforma Educativa

Plataforma web educativa para la gestión de contenido multimedia del Centro de Gestión de Mercados, Logística y Tecnologías de la Información (CGMLTI) del SENA.

## 🚀 Características

- **Página de inicio informativa** con información sobre la agencia y sus servicios
- **Sistema de autenticación** para colaboradores y administradores
- **Gestión de contenido multimedia** (imágenes, videos, documentos)
- **Panel de usuario** con estadísticas y organización por pestañas
- **Panel de administración** para supervisar todo el contenido
- **Previsualización de archivos** multimedia
- **Interfaz responsive** y moderna

## 👥 Roles de Usuario

- **Administrador**: Puede ver y gestionar todo el contenido de la plataforma
- **Colaborador**: Puede subir y gestionar únicamente su propio contenido

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Pasos de instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd In-House
   ```

2. **Instalar dependencias de Python**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ejecutar el servidor backend**
   ```bash
   python server.py
   ```

4. **Abrir la aplicación**
   - Abre tu navegador web
   - Navega a: `https://geralsilva.github.io/In-house/`
   - O simplemente abre el archivo `index.html` en tu navegador

## 🔐 Credenciales por Defecto

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

## 📁 Estructura del Proyecto

```
In-House/
├── index.html          # Página principal
├── app.js             # Lógica del frontend
├── style.css          # Estilos CSS
├── server.py          # Servidor backend (FastAPI)
├── requirements.txt   # Dependencias de Python
├── README.md          # Este archivo
├── data.json          # Base de datos (se crea automáticamente)
└── uploads/           # Carpeta de archivos subidos (se crea automáticamente)
```

## 🌐 API Endpoints

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /users/me` - Obtener información del usuario actual

### Contenido
- `POST /content/upload` - Subir archivo
- `GET /content/me` - Obtener mi contenido
- `GET /content/all` - Obtener todo el contenido (solo admin)
- `DELETE /content/{id}` - Eliminar contenido

### Utilidades
- `GET /health` - Estado del servidor
- `GET /docs` - Documentación interactiva de la API

## 🎨 Funcionalidades del Frontend

### Página de Inicio
- Información sobre inHOUSE 52
- Servicios ofrecidos
- Programas de formación
- Galería de imágenes
- Estadísticas de impacto

### Sistema de Autenticación
- Formularios de login y registro con pestañas
- Validaciones del lado del cliente
- Mensajes de error y éxito
- Almacenamiento seguro de tokens

### Panel de Usuario
- **Pestaña "Subir Contenido"**: Formulario para subir archivos con preview
- **Pestaña "Mi Contenido"**: Visualización de archivos propios con preview
- **Pestaña "Administración"**: Solo para admins, gestión de todo el contenido

### Características Avanzadas
- Preview de imágenes y videos
- Estadísticas en tiempo real
- Filtros por tipo de contenido
- Descarga de archivos
- Eliminación de contenido
- Interfaz responsive

## 🔧 Desarrollo

### Tecnologías Utilizadas

**Frontend:**
- HTML5
- CSS3 (con Flexbox y Grid)
- JavaScript (ES6+)
- Fetch API para comunicación con el backend

**Backend:**
- Python 3.8+
- FastAPI (framework web moderno)
- JWT para autenticación
- Almacenamiento en JSON (para desarrollo)
- Uvicorn como servidor ASGI

### Personalización

1. **Cambiar colores**: Modifica las variables CSS en `style.css`
2. **Agregar funcionalidades**: Extiende las rutas en `server.py` y la lógica en `app.js`
3. **Cambiar base de datos**: Reemplaza el sistema de archivos JSON por una base de datos real

## 📱 Responsive Design

La aplicación está optimizada para:
- 💻 Escritorio (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Móvil (< 768px)

## 🛡️ Seguridad

- Autenticación basada en JWT
- Validación de archivos en el frontend
- Protección de rutas sensibles
- Hashing de contraseñas
- CORS configurado para desarrollo

## 📞 Soporte

Para soporte técnico o consultas sobre la plataforma, contacta al equipo de desarrollo de inHOUSE 52.

---

**© 2025 inHOUSE 52 - Centro de Gestión de Mercados, Logística y Tecnologías de la Información - SENA**