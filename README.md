# ClassManager

Aplicación web para la gestión de alumnos, cursos y matrículas, desarrollada como proyecto académico del ciclo de Desarrollo de Aplicaciones Web (DAW).

ClassManager permite administrar los registros de alumnos y cursos, gestionar las matrículas y consultar la información almacenada en una base de datos relacional mediante una API REST.

## 1. Tecnologías utilizadas

- **Backend:** Node.js y Express.
- **Base de datos:** MariaDB.
- **Conexión a base de datos:** mysql2.
- **Frontend:** HTML5, CSS3 y JavaScript.
- **Comunicación:** API REST mediante Fetch API y JSON.
- **Pruebas automatizadas:** Jest y Supertest.
- **Gestión de configuración:** dotenv.
- **Desarrollo asistido por IA:** Google Antigravity y Skills personalizadas.

## 2. Funcionalidades

La aplicación incluye las siguientes funcionalidades:

### Gestión de alumnos
- Consultar el listado de alumnos.
- Registrar nuevos alumnos.
- Editar los datos de un alumno.
- Eliminar alumnos, respetando las restricciones de integridad de la base de datos.

### Gestión de cursos
- Consultar los cursos disponibles.
- Crear nuevos cursos.
- Modificar la información de los cursos.
- Eliminar cursos.

### Gestión de matrículas
- Consultar las matrículas registradas.
- Matricular alumnos en cursos.
- Cambiar el estado de las matrículas.
- Controlar las plazas disponibles.
- Evitar matrículas duplicadas no permitidas.

## 3. Requisitos previos

Para ejecutar el proyecto es necesario disponer de:

- Node.js y npm.
- MariaDB.
- Un editor de código, como Visual Studio Code.
- Git (opcional, para clonar el repositorio).

## 4. Instalación

### 4.1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd ClassManager
```

### 4.2. Instalar las dependencias

Desde la carpeta raíz del proyecto, ejecutar:

```bash
npm install
```

### 4.3. Configurar la base de datos

1. Iniciar el servicio de MariaDB.
2. Crear la base de datos que utiliza la aplicación.
3. Ejecutar el script `database/schema.sql` para crear las tablas.
4. Ejecutar `database/seeds.sql` para insertar los datos iniciales, si se desea disponer de registros de prueba.

### 4.4. Configurar las variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Completar los datos de conexión a MariaDB según la configuración local.

**Importante:** El archivo `.env` contiene información de configuración y credenciales. No debe subirse al repositorio de GitHub.

## 5. Ejecución de la aplicación

Una vez instaladas las dependencias y configurada la base de datos, iniciar el servidor desde la carpeta raíz:

```bash
npm start
```

url de la aplicación:
```
http://localhost:3000
```

La aplicación estará disponible en la dirección local que indique el servidor al iniciarse.

## 6. API REST

La aplicación dispone de endpoints para gestionar los tres recursos principales:

| Recurso | Ruta base |
|---|---|
| Alumnos | `/api/alumnos` |
| Cursos | `/api/cursos` |
| Matrículas | `/api/matriculas` |

La API permite realizar operaciones de consulta, creación, modificación y eliminación, además de consultas relacionadas con las matrículas y los alumnos de cada curso.

## 7. Pruebas automatizadas

El proyecto incorpora pruebas automatizadas para comprobar el funcionamiento de la API, las operaciones CRUD y las principales reglas de validación y negocio.

Para ejecutar las pruebas:

```bash
npm test
```

La ejecución permite comprobar el comportamiento de los endpoints y detectar posibles errores.

## 8. Estructura del proyecto

```text
ClassManager/
├── .gemini/
│   └── skills/
│       └── rest-endpoint-generator/
│           └── SKILL.md
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── app.js
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── api.js
│   │   └── main.js
│   └── index.html
├── database/
│   ├── schema.sql
│   └── seeds.sql
├── tests/
│   └── api.test.js
├── .env.example
├── .gitignore
├── package.json
├── PLAN.md
└── README.md
```

## 9. Documentación adicional

El proyecto incluye documentación complementaria:

- `PLAN.md`: planificación, requisitos, arquitectura y fases de desarrollo.
- `.gemini/skills/`: Skill personalizada utilizada como guía reutilizable durante el desarrollo asistido por IA.
- `database/`: scripts SQL para la creación y carga inicial de la base de datos.
- `tests/`: pruebas automatizadas de la API.

## 10. Autoría

Proyecto académico desarrollado para el ciclo formativo de **Desarrollo de Aplicaciones Web (DAW)**.