document.addEventListener('DOMContentLoaded', () => {

    // =====================================
    // ELEMENTOS Y VARIABLES
    // =====================================

    const secciones = {
        alumnos: document.getElementById('seccion-alumnos'),
        cursos: document.getElementById('seccion-cursos'),
        matriculas: document.getElementById('seccion-matriculas')
    };

    const botonesNavegacion = document.querySelectorAll('.navigation__button');

    const modal = document.getElementById('modal-formulario');
    const formulario = document.getElementById('formulario-registro');
    const camposModal = document.getElementById('modal-campos');
    const tituloModal = document.getElementById('modal-titulo');
    const descripcionModal = document.getElementById('modal-descripcion');
    const errorModal = document.getElementById('modal-error');
    const botonGuardar = document.getElementById('modal-guardar');

    let alumnos = [];
    let cursos = [];
    let matriculas = [];

    let tipoFormulario = '';
    let registroId = null;

    // =====================================
    // UTILIDADES
    // =====================================

    function escaparHTML(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[caracter]);
    }

    function mostrarMensaje(mensaje, tipo = 'success') {
        const elemento = document.getElementById('mensaje-global');

        elemento.textContent = mensaje;
        elemento.className = `notification notification--${tipo}`;

        window.scrollTo({ top: 0, behavior: 'smooth' });

        clearTimeout(mostrarMensaje.temporizador);

        mostrarMensaje.temporizador = setTimeout(() => {
            elemento.className = 'notification';
            elemento.textContent = '';
        }, 4500);
    }

    function mostrarError(error) {
        mostrarMensaje(error.message || 'Ha ocurrido un error.', 'error');
    }

    function actualizarResumen() {
        document.getElementById('total-alumnos').textContent = alumnos.length;
        document.getElementById('total-cursos').textContent = cursos.length;
        document.getElementById('total-matriculas').textContent = matriculas.length;
    }

    // =====================================
    // NAVEGACIÓN
    // =====================================

    botonesNavegacion.forEach(boton => {
        boton.addEventListener('click', () => {
            const nombre = boton.dataset.section;

            Object.entries(secciones).forEach(([clave, seccion]) => {
                seccion.hidden = clave !== nombre;
            });

            botonesNavegacion.forEach(item => {
                item.classList.toggle(
                    'navigation__button--active',
                    item === boton
                );
            });
        });
    });

    // =====================================
    // CARGAR DATOS
    // =====================================

    async function cargarAlumnos() {
        const respuesta = await APIAlumnos.obtenerTodos();
        alumnos = respuesta.data || [];
        mostrarAlumnos();
    }

    async function cargarCursos() {
        const respuesta = await APICursos.obtenerTodos();
        cursos = respuesta.data || [];
        mostrarCursos();
    }

    async function cargarMatriculas() {
        const respuesta = await APIMatriculas.obtenerTodas();
        matriculas = respuesta.data || [];
        mostrarMatriculas();
    }

    async function cargarTodo() {
        try {
            await Promise.all([
                cargarAlumnos(),
                cargarCursos(),
                cargarMatriculas()
            ]);

            actualizarResumen();
        } catch (error) {
            mostrarError(error);
        }
    }

    // =====================================
    // FORMULARIOS DINÁMICOS
    // =====================================

    function crearCampo(campo) {
        const contenedor = document.createElement('div');
        contenedor.className = 'modal__field';

        const etiqueta = document.createElement('label');
        etiqueta.htmlFor = campo.id;
        etiqueta.textContent = campo.label;

        let input;

        if (campo.type === 'select') {
            input = document.createElement('select');

            campo.options.forEach(opcion => {
                const option = document.createElement('option');
                option.value = opcion.value;
                option.textContent = opcion.label;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = campo.type || 'text';
            input.placeholder = campo.placeholder || '';
        }

        input.id = campo.id;
        input.name = campo.id;
        input.required = campo.required !== false;

        if (campo.value !== undefined) {
            input.value = campo.value ?? '';
        }

        if (campo.min !== undefined) input.min = campo.min;
        if (campo.max !== undefined) input.max = campo.max;
        if (campo.step !== undefined) input.step = campo.step;
        if (campo.pattern) input.pattern = campo.pattern;
        if (campo.maxLength) input.maxLength = campo.maxLength;

        if (campo.type === 'email') {
            input.autocomplete = 'email';
        }

        contenedor.append(etiqueta, input);
        return contenedor;
    }

    function abrirFormulario(tipo, datos = null) {
        tipoFormulario = tipo;
        registroId = datos?.id ?? null;

        formulario.reset();
        camposModal.innerHTML = '';
        errorModal.textContent = '';

        const editar = Boolean(datos);

        const configuraciones = {
            alumno: {
                titulo: editar ? 'Editar alumno' : 'Nuevo alumno',
                descripcion: 'Introduce los datos personales del alumno.',
                campos: [
                    { id: 'dni', label: 'DNI', value: datos?.dni, maxLength: 20 },
                    { id: 'nombre', label: 'Nombre', value: datos?.nombre, maxLength: 100 },
                    { id: 'apellidos', label: 'Apellidos', value: datos?.apellidos, maxLength: 150 },
                    { id: 'email', label: 'Correo electrónico', type: 'email', value: datos?.email, maxLength: 150 },
                    { id: 'telefono', label: 'Teléfono', value: datos?.telefono, required: false, maxLength: 30 }
                ]
            },

            curso: {
                titulo: editar ? 'Editar curso' : 'Nuevo curso',
                descripcion: 'Introduce la información del curso.',
                campos: [
                    { id: 'codigo', label: 'Código del curso', value: datos?.codigo, maxLength: 50 },
                    { id: 'nombre', label: 'Nombre del curso', value: datos?.nombre, maxLength: 150 },
                    { id: 'descripcion', label: 'Descripción', value: datos?.descripcion, required: false, maxLength: 500 },
                    { id: 'horas', label: 'Número de horas', type: 'number', value: datos?.horas, min: 1 },
                    { id: 'plazas_maximas', label: 'Plazas máximas', type: 'number', value: datos?.plazas_maximas, min: 1 }
                ]
            },

            matricula: {
                titulo: 'Nueva matrícula',
                descripcion: 'Selecciona el alumno y el curso.',
                campos: [
                    {
                        id: 'alumno_id',
                        label: 'Alumno',
                        type: 'select',
                        options: alumnos.map(alumno => ({
                            value: alumno.id,
                            label: `${alumno.nombre} ${alumno.apellidos} (${alumno.dni})`
                        }))
                    },
                    {
                        id: 'curso_id',
                        label: 'Curso',
                        type: 'select',
                        options: cursos.map(curso => ({
                            value: curso.id,
                            label: `${curso.nombre} (${curso.codigo})`
                        }))
                    }
                ]
            }
        };

        const configuracion = configuraciones[tipo];

        if (!configuracion) return;

        tituloModal.textContent = configuracion.titulo;
        descripcionModal.textContent = configuracion.descripcion;
        botonGuardar.textContent = editar ? 'Guardar cambios' : 'Guardar';

        configuracion.campos.forEach(campo => {
            camposModal.appendChild(crearCampo(campo));
        });

        modal.showModal();

        camposModal.querySelector('input, select')?.focus();
    }

    function cerrarFormulario() {
        modal.close();
        formulario.reset();
        camposModal.innerHTML = '';
        errorModal.textContent = '';
        registroId = null;
        tipoFormulario = '';
    }

    document.getElementById('modal-cerrar')
        .addEventListener('click', cerrarFormulario);

    document.getElementById('modal-cancelar')
        .addEventListener('click', cerrarFormulario);

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            cerrarFormulario();
        }
    });

    // =====================================
    // GUARDAR FORMULARIOS
    // =====================================

    formulario.addEventListener('submit', async event => {
        event.preventDefault();
        errorModal.textContent = '';

        if (!formulario.reportValidity()) return;

        const datos = Object.fromEntries(new FormData(formulario).entries());

        botonGuardar.disabled = true;
        botonGuardar.textContent = 'Guardando...';

        try {
            if (tipoFormulario === 'alumno') {
                await guardarAlumno(datos);
            }

            if (tipoFormulario === 'curso') {
                await guardarCurso(datos);
            }

            if (tipoFormulario === 'matricula') {
                await APIMatriculas.crear({
                    alumno_id: Number(datos.alumno_id),
                    curso_id: Number(datos.curso_id)
                });

                await cargarTodo();
                mostrarMensaje('Matrícula creada correctamente.');
            }

            cerrarFormulario();

        } catch (error) {
            errorModal.textContent = error.message || 'No se ha podido guardar el registro.';
        } finally {
            botonGuardar.disabled = false;
            botonGuardar.textContent = registroId ? 'Guardar cambios' : 'Guardar';
        }
    });

    async function guardarAlumno(datos) {
        if (registroId) {
            await APIAlumnos.actualizar(registroId, datos);
            await cargarAlumnos();
            mostrarMensaje('Alumno actualizado correctamente.');
        } else {
            await APIAlumnos.crear(datos);
            await cargarAlumnos();
            mostrarMensaje('Alumno creado correctamente.');
        }
    }

    async function guardarCurso(datos) {
        datos.horas = Number(datos.horas);
        datos.plazas_maximas = Number(datos.plazas_maximas);

        if (registroId) {
            await APICursos.actualizar(registroId, datos);
            await cargarCursos();
            mostrarMensaje('Curso actualizado correctamente.');
        } else {
            await APICursos.crear(datos);
            await cargarCursos();
            mostrarMensaje('Curso creado correctamente.');
        }
    }

    // =====================================
    // MOSTRAR ALUMNOS
    // =====================================

    function mostrarAlumnos() {
        const contenedor = document.getElementById('lista-alumnos');

        if (!alumnos.length) {
            contenedor.innerHTML = '<p>No hay alumnos registrados.</p>';
            return;
        }

        contenedor.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>DNI</th>
                        <th>Nombre</th>
                        <th>Apellidos</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${alumnos.map(alumno => `
                        <tr>
                            <td>${escaparHTML(alumno.dni)}</td>
                            <td>${escaparHTML(alumno.nombre)}</td>
                            <td>${escaparHTML(alumno.apellidos)}</td>
                            <td>${escaparHTML(alumno.email)}</td>
                            <td>${escaparHTML(alumno.telefono || '-')}</td>
                            <td>
                                <button class="button button--edit" data-action="editar-alumno" data-id="${escaparHTML(alumno.id)}">Editar</button>
                                <button class="button button--delete" data-action="eliminar-alumno" data-id="${escaparHTML(alumno.id)}">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // =====================================
    // MOSTRAR CURSOS
    // =====================================

    function mostrarCursos() {
        const contenedor = document.getElementById('lista-cursos');

        if (!cursos.length) {
            contenedor.innerHTML = '<p>No hay cursos registrados.</p>';
            return;
        }

        contenedor.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Horas</th>
                        <th>Plazas</th>
                        <th>Disponibles</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${cursos.map(curso => `
                        <tr>
                            <td>${escaparHTML(curso.codigo)}</td>
                            <td>${escaparHTML(curso.nombre)}</td>
                            <td>${escaparHTML(curso.horas)}</td>
                            <td>${escaparHTML(curso.plazas_maximas)}</td>
                            <td>${escaparHTML(curso.plazas_disponibles)}</td>
                            <td>
                                <button class="button button--edit" data-action="editar-curso" data-id="${escaparHTML(curso.id)}">Editar</button>
                                <button class="button button--delete" data-action="eliminar-curso" data-id="${escaparHTML(curso.id)}">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // =====================================
    // MOSTRAR MATRÍCULAS
    // =====================================

    function mostrarMatriculas() {
        const contenedor = document.getElementById('lista-matriculas');

        if (!matriculas.length) {
            contenedor.innerHTML = '<p>No hay matrículas registradas.</p>';
            return;
        }

        contenedor.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Alumno</th>
                        <th>Curso</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Calificación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${matriculas.map(matricula => `
                        <tr>
                            <td>${escaparHTML(matricula.nombre_alumno)} ${escaparHTML(matricula.apellidos_alumno)}</td>
                            <td>${escaparHTML(matricula.nombre_curso)}</td>
                            <td>${escaparHTML(matricula.fecha_matricula)}</td>
                            <td>${escaparHTML(matricula.estado)}</td>
                            <td>${escaparHTML(matricula.calificacion ?? '-')}</td>
                            <td>
                                ${matricula.estado === 'active' ? `
                                    <button class="button button--edit" data-action="cancelar-matricula" data-id="${escaparHTML(matricula.id)}">Cancelar</button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // =====================================
    // ACCIONES DE LOS REGISTROS
    // =====================================

    document.getElementById('btn-nuevo-alumno')
        .addEventListener('click', () => abrirFormulario('alumno'));

    document.getElementById('btn-nuevo-curso')
        .addEventListener('click', () => abrirFormulario('curso'));

    document.getElementById('btn-nueva-matricula')
        .addEventListener('click', () => {
            if (!alumnos.length || !cursos.length) {
                mostrarMensaje('Primero debes registrar al menos un alumno y un curso.', 'error');
                return;
            }

            abrirFormulario('matricula');
        });

    document.addEventListener('click', async event => {
        const boton = event.target.closest('[data-action]');
        if (!boton) return;

        const id = boton.dataset.id;
        const accion = boton.dataset.action;

        try {
            if (accion === 'editar-alumno') {
                const alumno = alumnos.find(item => String(item.id) === id);
                if (alumno) abrirFormulario('alumno', alumno);
            }

            if (accion === 'editar-curso') {
                const curso = cursos.find(item => String(item.id) === id);
                if (curso) abrirFormulario('curso', curso);
            }

            if (accion === 'eliminar-alumno') {
                if (!confirm('¿Seguro que quieres eliminar este alumno?')) return;

                await APIAlumnos.eliminar(id);
                await cargarAlumnos();
                mostrarMensaje('Alumno eliminado correctamente.');
            }

            if (accion === 'eliminar-curso') {
                if (!confirm('¿Seguro que quieres eliminar este curso?')) return;

                await APICursos.eliminar(id);
                await cargarCursos();
                mostrarMensaje('Curso eliminado correctamente.');
            }

            if (accion === 'cancelar-matricula') {
                if (!confirm('¿Quieres cancelar esta matrícula?')) return;

                await APIMatriculas.actualizarEstado(id, 'canceled');
                await cargarTodo();
                mostrarMensaje('Matrícula cancelada correctamente.');
            }

        } catch (error) {
            mostrarError(error);
        }
    });

    // =====================================
    // INICIAR APLICACIÓN
    // =====================================

    cargarTodo();
});
