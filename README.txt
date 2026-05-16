================================================================================
                    MANUAL DE INSTALACION - BACKEND
                    SISTEMA MAQUINARIA Y SERVICIO AGRICOLA
================================================================================

Este documento explica como instalar y ejecutar la parte del servidor (BACKEND).

================================================================================
PASO 1: INSTALAR NODE.JS
================================================================================

Node.js es necesario para ejecutar el backend.

INSTRUCCIONES:

1. Ve a: https://nodejs.org/

2. Descarga la version LTS (recomendada para la mayoria)

3. Ejecuta el instalador:
   - Acepta los terminos
   - Deja todas las opciones por defecto
   - Haz clic en "Next" hasta terminar

4. VERIFICAR QUE SE INSTALO:
   - Presiona WINDOWS + R
   - Escribe "cmd" y presiona ENTER
   - Escribe: node --version
   - Deberias ver un numero como v18.17.0

================================================================================
PASO 2: INSTALAR DEPENDENCIAS
================================================================================

1. Abre la terminal (CMD)

2. Navega a la carpeta del backend:
   cd ruta/donde/esta/la/carpeta/backend

3. Ejecuta:
   npm install

4. Espera a que termine (puede tomar varios minutos)

================================================================================
PASO 3: CONFIGURAR LAS VARIABLES DE ENTORNO
================================================================================

El archivo .env contiene la configuracion del sistema.

INSTRUCCIONES:

1. Dentro de la carpeta del backend, busca el archivo .env

2. Si NO existe, crealo con el Bloc de Notas y nombralo exactamente: .env

3. Abrelo y asegurate que tenga este contenido:

   MAIL_USER=correo@gmail.com
   MAIL_PASS=contraseña_aplicacion

NOTA: Las credenciales de la base de datos ya estan configuradas en el archivo
      app.module.ts. Si la base de datos esta en un servidor remoto, cambia
      DB_HOST, DB_USER, DB_PASSWORD y DB_NAME segun corresponda.

================================================================================
PASO 4: CONFIGURAR CORREO GMAIL (PARA ENVIAR NOTIFICACIONES)
================================================================================

El sistema envia correos. Necesitas una contraseña especial de Gmail.

OBTENER CONTRASEÑA DE APLICACION:

1. Inicia sesion en Gmail

2. Ve a "Gestionar tu cuenta de Google" -> "Seguridad"

3. Activa "Verificacion en dos pasos" (si no la tienes)

4. Busca "Contraseñas de aplicaciones"

5. Selecciona "Otra" y escribe "Sistema Taller"

6. Haz clic en "GENERAR" y COPIA la contraseña de 16 digitos

7. Pega esa contraseña en el archivo .env donde dice MAIL_PASS

================================================================================
PASO 5: EJECUTAR EL BACKEND
================================================================================

1. Abre la terminal (CMD)

2. Navega a la carpeta del backend

3. Ejecuta:
   npm run start:dev

4. Cuando veas el mensaje "Application is running on port 3000" significa que esta listo

5. NO CIERRES ESTA VENTANA mientras el sistema este en uso

================================================================================
PASO 6: SOLUCION DE PROBLEMAS
================================================================================

PROBLEMA: "Error: Cannot find module"
SOLUCION: Ejecuta "npm install" nuevamente

PROBLEMA: "Error: listen EADDRINUSE :::3000"
SOLUCION: Cambia el puerto en el archivo .env (ej: PORT=3001)

PROBLEMA: Error de conexion a base de datos
SOLUCION: Verifica que las credenciales en .env sean correctas

PROBLEMA: Error de correo "Invalid login"
SOLUCION: La contraseña de aplicacion de Gmail es incorrecta

================================================================================
FIN DEL MANUAL DEL BACKEND
================================================================================