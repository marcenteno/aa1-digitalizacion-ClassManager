const API_URL = '/api';

async function realizarPeticion(url, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${url}`, {
        ...opciones,
        headers: {
            'Content-Type': 'application/json',
            ...opciones.headers
        }
    });

    const texto = await respuesta.text();
    let resultado = {};

    try {
        resultado = texto ? JSON.parse(texto) : {};
    } catch {
        throw new Error('El servidor ha devuelto una respuesta no válida.');
    }

    if (!respuesta.ok) {
        throw new Error(
            resultado.error ||
            resultado.mensaje ||
            `Error del servidor (${respuesta.status})`
        );
    }

    return resultado;
}

// ALUMNOS
const APIAlumnos = {
    obtenerTodos: () => realizarPeticion('/alumnos'),

    obtenerPorId: id => realizarPeticion(`/alumnos/${id}`),

    crear: alumno => realizarPeticion('/alumnos', {
        method: 'POST',
        body: JSON.stringify(alumno)
    }),

    actualizar: (id, alumno) => realizarPeticion(`/alumnos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(alumno)
    }),

    eliminar: id => realizarPeticion(`/alumnos/${id}`, {
        method: 'DELETE'
    })
};

// CURSOS
const APICursos = {
    obtenerTodos: () => realizarPeticion('/cursos'),

    obtenerPorId: id => realizarPeticion(`/cursos/${id}`),

    obtenerAlumnos: id => realizarPeticion(`/cursos/${id}/alumnos`),

    crear: curso => realizarPeticion('/cursos', {
        method: 'POST',
        body: JSON.stringify(curso)
    }),

    actualizar: (id, curso) => realizarPeticion(`/cursos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(curso)
    }),

    eliminar: id => realizarPeticion(`/cursos/${id}`, {
        method: 'DELETE'
    })
};

// MATRÍCULAS
const APIMatriculas = {
    obtenerTodas: () => realizarPeticion('/matriculas'),

    crear: matricula => realizarPeticion('/matriculas', {
        method: 'POST',
        body: JSON.stringify(matricula)
    }),

    actualizarEstado: (id, estado, calificacion = null) =>
        realizarPeticion(`/matriculas/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado, calificacion })
        }),

    eliminar: id => realizarPeticion(`/matriculas/${id}`, {
        method: 'DELETE'
    })
};
