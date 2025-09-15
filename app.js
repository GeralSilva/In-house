// ============================================
// CONFIGURACIÓN INICIAL Y VARIABLES GLOBALES
// ============================================

// URL base de la API del servidor backend
const API = "http://127.0.0.1:8001";

// Referencias a las diferentes vistas/secciones de la aplicación
const views = {
  public: document.getElementById("view-public"),    // Vista pública (página de inicio)
  login: document.getElementById("view-login"),      // Vista de login/registro
  panel: document.getElementById("view-panel"),      // Panel de usuario autenticado
};

// Referencias a elementos de navegación y autenticación
const navLinks = document.querySelectorAll("nav a[data-view]");  // Enlaces de navegación
const logoutBtn = document.getElementById("logout");             // Botón de cerrar sesión
const onlyAuth = document.querySelectorAll(".only-auth");        // Elementos solo visibles para usuarios autenticados

// Variables de estado de autenticación
let token = localStorage.getItem("token");  // Token JWT almacenado en localStorage
let currentUser = null;                     // Información del usuario actual

// ============================================
// FUNCIONES DE NAVEGACIÓN Y MANEJO DE VISTAS
// ============================================

/**
 * Muestra una vista específica y oculta las demás
 * @param {string} name - Nombre de la vista a mostrar ('public', 'login', 'panel')
 */
function showView(name) {
  // Ocultar todas las vistas agregando la clase 'hidden'
  Object.values(views).forEach(v => v.classList.add("hidden"));
  // Mostrar la vista solicitada removiendo la clase 'hidden'
  views[name].classList.remove("hidden");
  
  // Si el usuario está autenticado y va al inicio, ocultar el botón de colaboradores
  if (name === 'home' && currentUser) {
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
      ctaSection.style.display = 'none';
    }
  } else if (name === 'home' && !currentUser) {
    // Si no está autenticado, mostrar el botón de colaboradores
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
      ctaSection.style.display = 'block';
    }
  }
}

// Configurar event listeners para los enlaces de navegación
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();  // Prevenir comportamiento por defecto del enlace
    const v = link.dataset.view;  // Obtener el nombre de la vista del atributo data-view
    showView(v);  // Mostrar la vista correspondiente
  });
});

// Configurar event listener para el botón de cerrar sesión
logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  // Limpiar datos de autenticación
  token = null;
  currentUser = null;
  localStorage.removeItem("token");  // Eliminar token del almacenamiento local
  // Ocultar elementos que solo deben ver usuarios autenticados
  onlyAuth.forEach(el => el.classList.add("hidden"));
  // Mostrar la pestaña de colaboradores nuevamente
  document.querySelector('a[data-view="login"]').classList.remove("hidden");
  // Mostrar nuevamente el botón de colaboradores
  const ctaSection = document.querySelector('.cta-section');
  if (ctaSection) {
    ctaSection.style.display = 'block';
  }
  // Redirigir a la vista pública
  showView("public");
});

// ============================================
// FUNCIONES DE AUTENTICACIÓN E INICIALIZACIÓN
// ============================================

/**
 * Obtiene la información del usuario actual desde el servidor
 * @returns {Object|null} - Datos del usuario o null si no está autenticado
 */
async function fetchMe() {
  if (!token) return null;  // Si no hay token, retornar null
  
  // Realizar petición al endpoint /users/me con el token de autorización
  const res = await fetch(API + "/users/me", {
    headers: { Authorization: "Bearer " + token }
  });
  
  if (!res.ok) return null;  // Si la respuesta no es exitosa, retornar null
  return res.json();  // Retornar los datos del usuario en formato JSON
}

/**
 * Función de inicialización que se ejecuta al cargar la página
 * Verifica si hay un usuario autenticado y configura la interfaz accordingly
 */
async function init() {
  if (token) {
    // Si hay token, intentar obtener información del usuario
    currentUser = await fetchMe();
    if (currentUser) {
      // Si el usuario es válido, mostrar elementos de usuario autenticado
      document.querySelector('a[data-view="panel"]').classList.remove("hidden");
      logoutBtn.classList.remove("hidden");
      // Ocultar la pestaña de colaboradores para usuarios autenticados
      document.querySelector('a[data-view="login"]').classList.add("hidden");
      // Cambiar automáticamente a la vista de inicio
      showView("public");
      // Renderizar el panel de usuario (prepararlo para cuando lo necesite)
      // await renderPanel(); // Comentado temporalmente para evitar errores
    }
  }
}

// La inicialización se ejecutará cuando el DOM esté listo

// ============================================
// FUNCIONALIDAD DE PESTAÑAS Y MENSAJES
// ============================================

/**
 * Configuración de pestañas para alternar entre Login y Registro
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', function() {
  // Ejecutar la inicialización cuando el DOM esté listo
  init();
  
  // Inicializar previsualización de archivos
  handleFilePreview();
  
  const tabButtons = document.querySelectorAll('.tab-button');  // Botones de pestañas
  const tabContents = document.querySelectorAll('.tab-content'); // Contenidos de pestañas
  
  // Configurar event listeners para cada botón de pestaña
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;  // Obtener el nombre de la pestaña objetivo
      
      // Remover clase 'active' de todos los botones
      tabButtons.forEach(btn => btn.classList.remove('active'));
      // Agregar clase 'active' al botón clickeado
      button.classList.add('active');
      
      // Ocultar todos los contenidos de pestañas
      tabContents.forEach(content => content.classList.add('hidden'));
      // Mostrar el contenido de la pestaña objetivo
      document.getElementById(targetTab + '-tab').classList.remove('hidden');
    });
  });
});

/**
 * Función para mostrar mensajes de éxito o error al usuario
 * @param {string} elementId - ID del elemento donde mostrar el mensaje
 * @param {string} message - Texto del mensaje a mostrar
 * @param {string} type - Tipo de mensaje ('error', 'success', etc.)
 */
function showMessage(elementId, message, type = 'error') {
  const messageEl = document.getElementById(elementId);
  messageEl.textContent = message;  // Establecer el texto del mensaje
  messageEl.className = `message ${type}`;  // Aplicar clases CSS apropiadas
  messageEl.classList.remove('hidden');  // Mostrar el mensaje
  
  // Ocultar automáticamente el mensaje después de 5 segundos
  setTimeout(() => {
    messageEl.classList.add('hidden');
  }, 5000);
}

// ============================================
// MANEJO DE FORMULARIO DE LOGIN
// ============================================

/**
 * Event listener para el formulario de inicio de sesión
 * Maneja la autenticación del usuario y la configuración de la sesión
 */
document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();  // Prevenir el envío normal del formulario
  
  // Referencias al botón de envío para mostrar estado de carga
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    // Mostrar estado de carga en el botón
    submitBtn.textContent = 'Ingresando...';
    submitBtn.disabled = true;
    
    // Preparar datos del formulario para envío
    const data = new FormData(e.target);
    const body = new URLSearchParams();
    body.append("username", data.get("username"));
    body.append("password", data.get("password"));
    body.append("grant_type", "password");  // Requerido por OAuth2

    // Realizar petición de login al servidor
    const res = await fetch(API + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    
    // Manejar errores de autenticación
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Credenciales incorrectas. Verifica tu usuario y contraseña.';
      showMessage('login-message', errorMessage, 'error');
      return;
    }
    
    // Procesar respuesta exitosa
    const json = await res.json();
    token = json.access_token;  // Guardar token JWT
    localStorage.setItem("token", token);  // Persistir token en localStorage
    currentUser = await fetchMe();  // Obtener información del usuario
    
    if (currentUser) {
      // Mostrar elementos de usuario autenticado
      document.querySelector('a[data-view="panel"]').classList.remove("hidden");
      logoutBtn.classList.remove("hidden");
      showMessage('login-message', '¡Bienvenido! Redirigiendo al inicio...', 'success');
      
      // Redirigir al inicio después de un breve delay
      setTimeout(() => {
        showView("home");    // Cambiar a vista del inicio
      }, 1500);
    } else {
      showMessage('login-message', 'Error al obtener información del usuario', 'error');
    }
  } catch (error) {
    // Manejar errores de conexión
    showMessage('login-message', 'Error de conexión. Intenta nuevamente.', 'error');
  } finally {
    // Restaurar estado original del botón
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// ============================================
// MANEJO DE FORMULARIO DE REGISTRO
// ============================================

/**
 * Event listener para el formulario de registro de nuevos usuarios
 * Incluye validaciones del lado cliente y manejo de errores del servidor
 */
document.getElementById("form-register").addEventListener("submit", async (e) => {
  e.preventDefault();  // Prevenir el envío normal del formulario
  
  // Referencias al botón de envío para mostrar estado de carga
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // ============================================
  // VALIDACIONES DEL LADO CLIENTE
  // ============================================
  
  // Obtener valores del formulario
  const username = e.target.username.value.trim();
  const email = e.target.email.value.trim();
  const password = e.target.password.value;
  const termsAccepted = e.target.querySelector('#terms').checked;
  
  // Validar longitud mínima del nombre de usuario
  if (username.length < 3) {
    showMessage('register-message', 'El nombre de usuario debe tener al menos 3 caracteres', 'error');
    return;
  }
  
  // Validar longitud mínima de la contraseña
  if (password.length < 6) {
    showMessage('register-message', 'La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }
  
  // Validar formato básico del email
  if (!email.includes('@')) {
    showMessage('register-message', 'Por favor ingresa un correo electrónico válido', 'error');
    return;
  }
  
  // Validar aceptación de términos y condiciones
  if (!termsAccepted) {
    showMessage('register-message', 'Debes aceptar los términos y condiciones', 'error');
    return;
  }
  
  // ============================================
  // PROCESAMIENTO DEL REGISTRO
  // ============================================
  
  try {
    // Mostrar estado de carga en el botón
    submitBtn.textContent = 'Creando cuenta...';
    submitBtn.disabled = true;
    
    // Preparar datos para enviar al servidor
    const payload = {
      username: username,
      email: email,
      password: password,
    };
    
    // Realizar petición de registro al servidor
    const res = await fetch(API + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    // Manejar errores del servidor
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      let errorMessage = 'Error al crear la cuenta';
      
      // Personalizar mensajes de error según el tipo
      if (err.detail) {
        if (err.detail.includes('username')) {
          errorMessage = 'El nombre de usuario ya está en uso';
        } else if (err.detail.includes('email')) {
          errorMessage = 'El correo electrónico ya está registrado';
        } else {
          errorMessage = err.detail;
        }
      }
      
      showMessage('register-message', errorMessage, 'error');
      return;
    }
    
    // Mostrar mensaje de éxito y limpiar formulario
    showMessage('register-message', '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');
    e.target.reset();  // Limpiar todos los campos del formulario
    
    // Cambiar automáticamente a la pestaña de login después del registro exitoso
    setTimeout(() => {
      document.querySelector('.tab-button[data-tab="login"]').click();
    }, 2000);
    
  } catch (error) {
    // Manejar errores de conexión
    showMessage('register-message', 'Error de conexión. Intenta nuevamente.', 'error');
  } finally {
    // Restaurar estado original del botón
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

/**
 * Renderizar y configurar el panel de usuario autenticado
 * Configura la interfaz según el rol del usuario y carga el contenido inicial
 */
async function renderPanel() {
  // Obtener elementos del DOM para personalizar el panel
  const panelTitle = document.getElementById("panel-title");
  const roleInfo = document.getElementById("role-info");
  
  // Mostrar elementos que solo son visibles para usuarios autenticados
  if (onlyAuth && onlyAuth.length > 0) {
    onlyAuth.forEach(el => {
      if (el) {
        el.classList.remove("hidden");
      }
    });
  }

  // Personalizar título y mostrar información del usuario
  if (panelTitle) {
    panelTitle.textContent = "Panel de " + currentUser.username;
  }
  if (roleInfo) {
    roleInfo.textContent = "Tu rol: " + currentUser.role;
  }

  // Mostrar pestaña de administración solo si el usuario es admin
  const adminTab = document.querySelector('[data-tab="admin"]');
  if (adminTab) {
    if (currentUser.role === "admin") {
      adminTab.style.display = "block";
    } else {
      adminTab.style.display = "none";
    }
  }

  // Inicializar sistema de pestañas del panel
  initPanelTabs();
  
  // Cargar contenido inicial del usuario
  await fetchMyContent();
  
  // Si es admin, también cargar todo el contenido para gestión
  if (currentUser.role === "admin") {
    await fetchAllContent();
  }

  // Actualizar estadísticas del panel
  updatePanelStats();
}

/**
 * Inicializar sistema de pestañas del panel de usuario
 * Configura la navegación entre diferentes secciones del panel
 */
function initPanelTabs() {
  // Obtener todos los botones y contenidos de las pestañas
  const tabButtons = document.querySelectorAll('.panel-tab-button');
  const tabContents = document.querySelectorAll('.panel-tab-content');

  // Configurar evento click para cada botón de pestaña
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Desactivar todas las pestañas
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.add('hidden'));
      
      // Activar la pestaña seleccionada
      button.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.remove('hidden');
    });
  });

  // Activar la primera pestaña por defecto
  if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
}

/**
 * Cargar y mostrar el contenido subido por el usuario actual
 * Obtiene la lista de archivos del usuario desde el servidor
 */
async function fetchMyContent() {
  // Realizar petición al servidor para obtener contenido del usuario
  const myRes = await fetch(API + "/content/me", { 
    headers: { Authorization: "Bearer " + token } 
  });
  
  // Obtener contenedor donde se mostrará la lista
  const myList = document.getElementById("my-content");
  myList.innerHTML = "";  // Limpiar contenido anterior
  
  if (myRes.ok) {
    const items = await myRes.json();
    
    // Mostrar mensaje si no hay contenido
    if (items.length === 0) {
      myList.innerHTML = '<p class="no-content">No has subido contenido aún. ¡Comienza subiendo tu primer archivo!</p>';
      return;
    }
    
    // Crear y mostrar cada elemento de contenido
    items.forEach(i => {
      const contentItem = createContentItem(i, false);
      myList.appendChild(contentItem);
    });
  }
}

/**
 * Crear elemento HTML para mostrar un archivo de contenido
 * @param {Object} item - Objeto con información del archivo
 * @param {boolean} isAdmin - Si se muestra en vista de administrador
 * @returns {HTMLElement} Elemento div con la información del archivo
 */
function createContentItem(item, isAdmin = false) {
  // Crear contenedor principal
  const div = document.createElement('div');
  div.className = 'content-item';
  
  // Generar elementos necesarios
  const preview = createPreview(item);  // Vista previa del archivo
  const typeIcon = getTypeIcon(item.type);  // Icono según tipo
  const uploadDate = new Date(item.created_at || Date.now()).toLocaleDateString('es-ES');
  
  // Construir HTML del elemento
  div.innerHTML = `
    <div class="content-preview">
      ${preview}
    </div>
    <div class="content-info">
      <div class="content-title">${item.title || 'Sin título'}</div>
      <div class="content-meta">
        ${typeIcon} ${item.type.toUpperCase()} • ${uploadDate}
        ${isAdmin ? ` • Usuario: ${item.owner_id}` : ''}
      </div>
      <div class="content-description">
        ${item.description || 'Sin descripción'}
      </div>
    </div>
    <div class="content-actions">
      <button class="action-btn download" onclick="downloadFile('${item.path}', '${item.title || 'archivo'}')">
        📥 Descargar
      </button>
      ${!isAdmin ? `<button class="action-btn delete" onclick="deleteFile(${item.id})">🗑️ Eliminar</button>` : ''}
    </div>
  `;
  
  return div;
}

/**
 * Crear vista previa del archivo según su tipo
 * @param {Object} item - Objeto con información del archivo
 * @returns {string} HTML para la vista previa
 */
function createPreview(item) {
  const filePath = `${API}${item.path}`;
  
  // Debug: Log de la URL generada
  console.log('Generando preview para:', item.title, 'URL:', filePath);
  
  switch(item.type) {
    case 'image':
      // Vista previa para imágenes con manejo robusto de errores
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTimeout(() => {
        const img = document.getElementById(imageId);
        if (img) {
          img.onload = () => console.log('Imagen cargada exitosamente:', filePath);
          img.onerror = () => {
            console.error('Error cargando imagen:', filePath);
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RXJyb3I8L3RleHQ+PC9zdmc+';
          };
        }
      }, 100);
      return `<img id="${imageId}" src="${filePath}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
      break;
    
    case 'video':
      // Vista previa para videos con múltiples formatos
      return `
        <video controls style="width: 100%; height: 100%; object-fit: cover;">
          <source src="${filePath}" type="video/mp4">
          <source src="${filePath}" type="video/webm">
          <source src="${filePath}" type="video/ogg">
          Tu navegador no soporta el elemento video.
        </video>
      `;
      break;
    
    default:
      // Vista previa genérica con icono para otros tipos de archivo
      return `<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 3rem;">${getTypeIcon(item.type)}</div>`;
      break;
  }
}

/**
 * Obtener emoji de icono según el tipo de archivo
 * @param {string} type - Tipo de archivo (image, video, file, etc.)
 * @returns {string} Emoji correspondiente al tipo
 */
function getTypeIcon(type) {
  switch(type) {
    case 'image': return '🖼️';  // Icono para imágenes
    case 'video': return '🎥';   // Icono para videos
    case 'file': return '📄';    // Icono para documentos
    default: return '📎';        // Icono genérico para otros archivos
  }
}

/**
 * Descargar archivo desde el servidor
 * @param {string} path - Ruta del archivo en el servidor
 * @param {string} filename - Nombre sugerido para el archivo
 */
function downloadFile(path, filename) {
  // Crear enlace temporal para descargar el archivo
  const link = document.createElement('a');
  link.href = `${API}${path}`;
  link.download = filename;
  
  // Simular click para iniciar descarga
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Eliminar archivo del servidor
 * @param {number} fileId - ID del archivo a eliminar
 */
async function deleteFile(fileId) {
  // Confirmar acción con el usuario
  if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
    return;
  }
  
  try {
    // Realizar petición DELETE al servidor
    const res = await fetch(`${API}/content/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: "Bearer " + token }
    });
    
    if (res.ok) {
      // Mostrar mensaje de éxito y actualizar la lista
      showMessage('Archivo eliminado correctamente', 'success');
      await fetchMyContent();  // Recargar lista de archivos
      updatePanelStats();      // Actualizar estadísticas
    } else {
      showMessage('Error al eliminar el archivo', 'error');
    }
  } catch (error) {
    showMessage('Error de conexión', 'error');
  }
}

/**
 * Cargar todo el contenido de todos los usuarios (solo para administradores)
 * Permite a los admins ver y gestionar todos los archivos subidos
 */
async function fetchAllContent() {
  const allList = document.getElementById("all-content");
  allList.innerHTML = "";  // Limpiar contenido anterior
  
  // Solo ejecutar si el usuario es administrador
  if (currentUser.role === "admin") {
    const allRes = await fetch(API + "/content/all", { 
      headers: { Authorization: "Bearer " + token } 
    });
    
    if (allRes.ok) {
      const items = await allRes.json();
      
      // Mostrar mensaje si no hay contenido
      if (items.length === 0) {
        allList.innerHTML = '<p class="no-content">No hay contenido subido por los colaboradores aún.</p>';
        return;
      }
      
      // Crear y mostrar cada elemento (con vista de administrador)
      items.forEach(i => {
        const contentItem = createContentItem(i, true);
        allList.appendChild(contentItem);
      });
    }
  }
}

/**
 * Configurar previsualización de archivos seleccionados
 * Muestra información del archivo antes de subirlo
 */
function handleFilePreview() {
  const fileInput = document.getElementById('file');
  const previewDiv = document.getElementById('file-preview');
  
  // Verificar que los elementos existen
  if (fileInput && previewDiv) {
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      
      if (file) {
        // Mostrar información del archivo seleccionado
        previewDiv.innerHTML = `
          <strong>Archivo seleccionado:</strong><br>
          <span>📄 ${file.name}</span><br>
          <small>Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB</small>
        `;
        previewDiv.style.display = 'block';
      } else {
        // Ocultar preview si no hay archivo
        previewDiv.style.display = 'none';
      }
    });
  }
}

// ============================================
// FORMULARIO DE SUBIDA DE ARCHIVOS
// ============================================

/**
 * Manejar envío del formulario de subida de archivos
 * Procesa la subida de archivos al servidor con validación y feedback
 */
document.getElementById("form-upload").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Obtener botón y guardar texto original
  const submitBtn = e.target.querySelector('.upload-button');
  const originalText = submitBtn.textContent;
  
  // Mostrar estado de carga en el botón
  submitBtn.textContent = 'Subiendo...';
  submitBtn.disabled = true;
  
  try {
    // Preparar datos del formulario para envío
    const formData = new FormData(e.target);
    
    // Debug: verificar que todos los campos requeridos estén presentes
    console.log('Datos del formulario:');
    for (let [key, value] of formData.entries()) {
      console.log(key + ':', value);
    }
    
    // Realizar petición de subida al servidor
    const res = await fetch(API + "/content/upload", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData
    });
    
    if (res.ok) {
      // Mostrar mensaje de éxito y limpiar formulario
      showMessage('upload-message', '¡Archivo subido correctamente!', 'success');
      e.target.reset();  // Limpiar todos los campos
      document.getElementById('file-preview').style.display = 'none';  // Ocultar preview
      
      // Actualizar contenido y estadísticas del panel
      await fetchMyContent();  // Recargar contenido del usuario
      if (currentUser.role === 'admin') {
        await fetchAllContent();  // Si es admin, también recargar contenido general
      }
      updatePanelStats();  // Actualizar estadísticas
      
    } else {
      // Manejar errores del servidor
      const error = await res.text();
      console.log('Error del servidor:', res.status, error);
      showMessage('upload-message', 'Error al subir el archivo: ' + error, 'error');
    }
  } catch (error) {
    // Manejar errores de conexión
    showMessage('upload-message', 'Error de conexión. Inténtalo de nuevo.', 'error');
  } finally {
    // Restaurar estado original del botón
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

/**
 * Actualizar estadísticas del panel de usuario
 * Calcula y muestra el número total de archivos por tipo
 */
async function updatePanelStats() {
  try {
    // Obtener contenido del usuario actual
    const myRes = await fetch(API + "/content/me", { 
      headers: { Authorization: "Bearer " + token } 
    });
    
    if (myRes.ok) {
      const myContent = await myRes.json();
      
      // Calcular estadísticas por tipo de archivo
      const totalFiles = myContent.length;
      const images = myContent.filter(item => item.type === 'image').length;
      const videos = myContent.filter(item => item.type === 'video').length;
      const documents = myContent.filter(item => item.type === 'file').length;
      
      // Actualizar elementos de estadísticas en el DOM si existen
      const totalStat = document.querySelector('.stat-item .stat-number');
      if (totalStat) totalStat.textContent = totalFiles;
      
      // Actualizar estadísticas detalladas si hay múltiples elementos
      const statItems = document.querySelectorAll('.stat-item');
      if (statItems.length >= 4) {
        statItems[0].querySelector('.stat-number').textContent = totalFiles;   // Total de archivos
        statItems[1].querySelector('.stat-number').textContent = images;      // Imágenes
        statItems[2].querySelector('.stat-number').textContent = videos;      // Videos
        statItems[3].querySelector('.stat-number').textContent = documents;   // Documentos
      }
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// ============================================
// INICIALIZACIÓN Y CONFIGURACIÓN FINAL
// ============================================

/**
 * Configurar navegación por enlaces con data-view
 * Permite navegación entre vistas usando enlaces del DOM
 */
document.querySelectorAll('a[data-view]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();  // Prevenir comportamiento por defecto del enlace
    const v = a.dataset.view;  // Obtener vista del atributo data-view
    showView(v);  // Mostrar la vista correspondiente
  });
});

// ============================================
// FUNCIONES DE NAVEGACIÓN DEL EQUIPO
// ============================================

/**
 * Navega a la página de perfil de un miembro del equipo
 * @param {string} memberName - Nombre del miembro del equipo (formato: nombre-apellido)
 */
function navigateToTeamMember(memberName) {
  // Crear la URL de la página del miembro del equipo en la carpeta perfil-colaboradores
  const memberUrl = `perfil-colaboradores/${memberName}.html`;
  
  // Redirigir a la página del miembro
  window.location.href = memberUrl;
}

/**
 * Función para manejar el scroll suave a la sección del equipo
 * @param {string} sectionId - ID de la sección a la que hacer scroll
 */
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Agregar event listeners para navegación suave en enlaces del equipo
document.addEventListener('DOMContentLoaded', function() {
  // Manejar clicks en enlaces que van a secciones específicas
  const sectionLinks = document.querySelectorAll('a[href^="#"]');
  sectionLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        const sectionId = href.substring(1);
        scrollToSection(sectionId);
      }
    });
  });
});

// Mostrar vista inicial (página pública)
showView("public");

// ============================================
// FIN DEL ARCHIVO: app.js
// Sistema de gestión de contenido In-House
// ============================================