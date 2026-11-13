const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

// Guardar los identificadores de los registros creados por las pruebas.
const idsPrueba = {
  alumnos: new Set(),
  cursos: new Set(),
  matriculas: new Set()
};

// Registrar un ID y devolverlo.
const guardarId = (tipo, id) => {
  if (id !== undefined && id !== null) {
    idsPrueba[tipo].add(id);
  }
  return id;
};

// Eliminar exclusivamente los registros cuyos IDs hemos guardado.
const eliminarPorIds = async (tabla, ids) => {
  const valores = [...ids];

  if (valores.length === 0) return;

  const placeholders = valores.map(() => '?').join(', ');

  await pool.execute(
    `DELETE FROM ${tabla} WHERE id IN (${placeholders})`,
    valores
  );
};

describe('API REST - ClassManager', () => {

  // ============================================================
  // T-01: CRUD completo de alumnos
  // ============================================================
  test('T-01: CRUD completo de alumnos', async () => {

    const nuevoAlumno = {
      dni: '99990001A',
      nombre: 'Alumno',
      apellidos: 'Prueba Uno',
      email: 'alumno.prueba1@test.com',
      telefono: '600000001'
    };

    // 1. Crear alumno
    const resCreate = await request(app)
      .post('/api/alumnos')
      .send(nuevoAlumno);

    const alumnoId = guardarId('alumnos', resCreate.body.id);

    expect(resCreate.statusCode).toBe(201);
    expect(resCreate.body.success).toBe(true);
    expect(alumnoId).toBeDefined();

    // 2. Consultar listado
    const resList = await request(app).get('/api/alumnos');

    expect(resList.statusCode).toBe(200);
    expect(resList.body.success).toBe(true);
    expect(Array.isArray(resList.body.data)).toBe(true);

    const alumnoEncontrado = resList.body.data.find(
      a => a.id === alumnoId
    );

    expect(alumnoEncontrado).toBeDefined();
    expect(alumnoEncontrado.dni).toBe(nuevoAlumno.dni);

    // 3. Consultar por ID
    const resGet = await request(app)
      .get(`/api/alumnos/${alumnoId}`);

    expect(resGet.statusCode).toBe(200);
    expect(resGet.body.success).toBe(true);
    expect(resGet.body.data.id).toBe(alumnoId);
    expect(resGet.body.data.nombre).toBe(nuevoAlumno.nombre);

    // 4. Modificar alumno
    const datosActualizados = {
      dni: '99990001A',
      nombre: 'Alumno Modificado',
      apellidos: 'Prueba Actualizado',
      email: 'alumno.modificado@test.com',
      telefono: '600000009'
    };

    const resUpdate = await request(app)
      .put(`/api/alumnos/${alumnoId}`)
      .send(datosActualizados);

    expect(resUpdate.statusCode).toBe(200);
    expect(resUpdate.body.success).toBe(true);

    const resVerifyUpdate = await request(app)
      .get(`/api/alumnos/${alumnoId}`);

    expect(resVerifyUpdate.body.data.nombre)
      .toBe('Alumno Modificado');

    expect(resVerifyUpdate.body.data.email)
      .toBe('alumno.modificado@test.com');

    // 5. Eliminar alumno
    const resDelete = await request(app)
      .delete(`/api/alumnos/${alumnoId}`);

    expect(resDelete.statusCode).toBe(200);
    expect(resDelete.body.success).toBe(true);

    // Comprobar que ya no existe
    const resCheckNotFound = await request(app)
      .get(`/api/alumnos/${alumnoId}`);

    expect(resCheckNotFound.statusCode).toBe(404);
    expect(resCheckNotFound.body.success).toBe(false);
  });

  // ============================================================
  // T-02: CRUD completo de cursos y consulta de inscritos
  // ============================================================
  test('T-02: CRUD completo de cursos y consulta de alumnos inscritos', async () => {

    const nuevoCurso = {
      codigo: 'TEST-CUR-01',
      nombre: 'Curso de Testing Automatizado',
      descripcion: 'Curso orientado a pruebas con Jest y Supertest',
      horas: 45,
      plazas_maximas: 15
    };

    // 1. Crear curso
    const resCreate = await request(app)
      .post('/api/cursos')
      .send(nuevoCurso);

    const cursoId = guardarId('cursos', resCreate.body.id);

    expect(resCreate.statusCode).toBe(201);
    expect(resCreate.body.success).toBe(true);
    expect(cursoId).toBeDefined();

    // 2. Consultar listado
    const resList = await request(app).get('/api/cursos');

    expect(resList.statusCode).toBe(200);
    expect(resList.body.success).toBe(true);
    expect(Array.isArray(resList.body.data)).toBe(true);

    const cursoEncontrado = resList.body.data.find(
      c => c.id === cursoId
    );

    expect(cursoEncontrado).toBeDefined();
    expect(cursoEncontrado.codigo).toBe(nuevoCurso.codigo);

    // 3. Consultar por ID
    const resGet = await request(app)
      .get(`/api/cursos/${cursoId}`);

    expect(resGet.statusCode).toBe(200);
    expect(resGet.body.success).toBe(true);
    expect(resGet.body.data.id).toBe(cursoId);
    expect(resGet.body.data.nombre).toBe(nuevoCurso.nombre);
    expect(resGet.body.data.horas).toBe(45);

    // 4. Consultar alumnos inscritos en el curso nuevo
    const resAlumnosCurso = await request(app)
      .get(`/api/cursos/${cursoId}/alumnos`);

    expect(resAlumnosCurso.statusCode).toBe(200);
    expect(resAlumnosCurso.body.success).toBe(true);
    expect(Array.isArray(resAlumnosCurso.body.data)).toBe(true);
    expect(resAlumnosCurso.body.data.length).toBe(0);

    // Consultar también un curso inicial de la base de datos
    const resCursoExistente = await request(app)
      .get('/api/cursos/1/alumnos');

    expect(resCursoExistente.statusCode).toBe(200);
    expect(resCursoExistente.body.success).toBe(true);
    expect(Array.isArray(resCursoExistente.body.data)).toBe(true);
    expect(resCursoExistente.body.data.length).toBeGreaterThanOrEqual(1);

    // 5. Modificar curso
    const cursoActualizado = {
      codigo: 'TEST-CUR-01-MOD',
      nombre: 'Curso de Testing Actualizado',
      descripcion: 'Temario ampliado',
      horas: 55,
      plazas_maximas: 20
    };

    const resUpdate = await request(app)
      .put(`/api/cursos/${cursoId}`)
      .send(cursoActualizado);

    expect(resUpdate.statusCode).toBe(200);
    expect(resUpdate.body.success).toBe(true);

    const resVerifyUpdate = await request(app)
      .get(`/api/cursos/${cursoId}`);

    expect(resVerifyUpdate.body.data.codigo)
      .toBe('TEST-CUR-01-MOD');

    expect(resVerifyUpdate.body.data.horas).toBe(55);

    // 6. Eliminar curso
    const resDelete = await request(app)
      .delete(`/api/cursos/${cursoId}`);

    expect(resDelete.statusCode).toBe(200);
    expect(resDelete.body.success).toBe(true);

    // Comprobar que ya no existe
    const resCheckNotFound = await request(app)
      .get(`/api/cursos/${cursoId}`);

    expect(resCheckNotFound.statusCode).toBe(404);
    expect(resCheckNotFound.body.success).toBe(false);
  });

  // ============================================================
  // T-03: Validaciones y registros duplicados
  // ============================================================
  test('T-03: Validaciones de datos incorrectos y registros duplicados', async () => {

    // 1. Alumno sin datos obligatorios
    const resAlumnoVacio = await request(app)
      .post('/api/alumnos')
      .send({});

    expect(resAlumnoVacio.statusCode).toBe(400);
    expect(resAlumnoVacio.body.success).toBe(false);

    // 2. Email inválido
    const resEmailInvalido = await request(app)
      .post('/api/alumnos')
      .send({
        dni: '99990002B',
        nombre: 'Pedro',
        apellidos: 'Test',
        email: 'email_invalido_sin_arroba'
      });

    expect(resEmailInvalido.statusCode).toBe(400);
    expect(resEmailInvalido.body.success).toBe(false);

    // 3. Horas de curso inválidas
    const resHorasInvalidas = await request(app)
      .post('/api/cursos')
      .send({
        codigo: 'TEST-ERR-01',
        nombre: 'Curso Inválido',
        horas: -5,
        plazas_maximas: 10
      });

    expect(resHorasInvalidas.statusCode).toBe(400);
    expect(resHorasInvalidas.body.success).toBe(false);

    // 4. Plazas máximas inválidas
    const resPlazasInvalidas = await request(app)
      .post('/api/cursos')
      .send({
        codigo: 'TEST-ERR-02',
        nombre: 'Curso Inválido Plazas',
        horas: 40,
        plazas_maximas: 0
      });

    expect(resPlazasInvalidas.statusCode).toBe(400);
    expect(resPlazasInvalidas.body.success).toBe(false);

    // 5. IDs de matrícula inválidos
    const resMatriculaInvalida = await request(app)
      .post('/api/matriculas')
      .send({
        alumno_id: 'texto_no_valido',
        curso_id: -1
      });

    expect(resMatriculaInvalida.statusCode).toBe(400);
    expect(resMatriculaInvalida.body.success).toBe(false);

    // 6. Crear alumno para probar duplicados
    const resAlumnoBase = await request(app)
      .post('/api/alumnos')
      .send({
        dni: '99990003C',
        nombre: 'Original',
        apellidos: 'Duplicado Test',
        email: 'original.dup@test.com'
      });

    const alumnoBaseId = guardarId(
      'alumnos',
      resAlumnoBase.body.id
    );

    expect(resAlumnoBase.statusCode).toBe(201);
    expect(alumnoBaseId).toBeDefined();

    // DNI duplicado
    const resDniDuplicado = await request(app)
      .post('/api/alumnos')
      .send({
        dni: '99990003C',
        nombre: 'Otro',
        apellidos: 'Mismo DNI',
        email: 'otro.email@test.com'
      });

    expect(resDniDuplicado.statusCode).toBe(409);
    expect(resDniDuplicado.body.success).toBe(false);

    // Email duplicado
    const resEmailDuplicado = await request(app)
      .post('/api/alumnos')
      .send({
        dni: '99990004D',
        nombre: 'Otro',
        apellidos: 'Mismo Email',
        email: 'original.dup@test.com'
      });

    expect(resEmailDuplicado.statusCode).toBe(409);
    expect(resEmailDuplicado.body.success).toBe(false);

    // 7. Código de curso duplicado
    const resCursoBase = await request(app)
      .post('/api/cursos')
      .send({
        codigo: 'TEST-DUP-01',
        nombre: 'Curso Original',
        horas: 30,
        plazas_maximas: 10
      });

    const cursoBaseId = guardarId(
      'cursos',
      resCursoBase.body.id
    );

    expect(resCursoBase.statusCode).toBe(201);
    expect(cursoBaseId).toBeDefined();

    const resCursoDuplicado = await request(app)
      .post('/api/cursos')
      .send({
        codigo: 'TEST-DUP-01',
        nombre: 'Curso con mismo código',
        horas: 40,
        plazas_maximas: 15
      });

    expect(resCursoDuplicado.statusCode).toBe(409);
    expect(resCursoDuplicado.body.success).toBe(false);
  });

  // ============================================================
  // T-04: Creación, consulta y cancelación de matrículas
  // ============================================================
  test('T-04: Creación, consulta y cancelación de matrículas', async () => {

    // 1. Crear alumno
    const resAlu = await request(app)
      .post('/api/alumnos')
      .send({
        dni: '99990005E',
        nombre: 'Alumno',
        apellidos: 'Para Matricula',
        email: 'matricula.test@test.com'
      });

    const alumnoId = guardarId('alumnos', resAlu.body.id);

    expect(resAlu.statusCode).toBe(201);
    expect(alumnoId).toBeDefined();

    // 2. Crear curso
    const resCur = await request(app)
      .post('/api/cursos')
      .send({
        codigo: 'TEST-MAT-01',
        nombre: 'Curso de Gestión de Matrículas',
        horas: 40,
        plazas_maximas: 10
      });

    const cursoId = guardarId('cursos', resCur.body.id);

    expect(resCur.statusCode).toBe(201);
    expect(cursoId).toBeDefined();

    // 3. Crear matrícula
    const resCreateMat = await request(app)
      .post('/api/matriculas')
      .send({
        alumno_id: alumnoId,
        curso_id: cursoId
      });

    const matriculaId = guardarId(
      'matriculas',
      resCreateMat.body.id
    );

    expect(resCreateMat.statusCode).toBe(201);
    expect(resCreateMat.body.success).toBe(true);
    expect(matriculaId).toBeDefined();

    // 4. Consultar matrículas
    const resListMat = await request(app).get('/api/matriculas');

    expect(resListMat.statusCode).toBe(200);
    expect(resListMat.body.success).toBe(true);
    expect(Array.isArray(resListMat.body.data)).toBe(true);

    const matriculaEncontrada = resListMat.body.data.find(
      m => m.id === matriculaId
    );

    expect(matriculaEncontrada).toBeDefined();
    expect(matriculaEncontrada.alumno_id).toBe(alumnoId);
    expect(matriculaEncontrada.curso_id).toBe(cursoId);
    expect(matriculaEncontrada.estado).toBe('active');

    // 5. Comprobar que aparece en el curso
    const resAlumnosCurso = await request(app)
      .get(`/api/cursos/${cursoId}/alumnos`);

    expect(resAlumnosCurso.statusCode).toBe(200);

    const alumnoEnCurso = resAlumnosCurso.body.data.find(
      a => a.id === alumnoId
    );

    expect(alumnoEnCurso).toBeDefined();

    // 6. Cancelar matrícula
    const resCancel = await request(app)
      .put(`/api/matriculas/${matriculaId}/estado`)
      .send({ estado: 'canceled' });

    expect(resCancel.statusCode).toBe(200);
    expect(resCancel.body.success).toBe(true);

    // 7. Verificar estado cancelado
    const resVerifyMat = await request(app).get('/api/matriculas');

    const matriculaCancelada = resVerifyMat.body.data.find(
      m => m.id === matriculaId
    );

    expect(matriculaCancelada.estado).toBe('canceled');

    // Comprobar que ya no aparece como alumno activo
    const resAlumnosDespues = await request(app)
      .get(`/api/cursos/${cursoId}/alumnos`);

    const alumnoNoPresente = resAlumnosDespues.body.data.find(
      a => a.id === alumnoId
    );

    expect(alumnoNoPresente).toBeUndefined();
  });

  // ============================================================
  // T-05: Reglas de negocio e integridad referencial
  // ============================================================
  test('T-05: Reglas de negocio: matrículas duplicadas, límite de plazas y restricciones al eliminar alumnos con matrículas', async () => {

    // REGLA 1: Evitar matrículas activas duplicadas

    const resAluA = await request(app)
      .post('/api/alumnos')
      .send({
        dni: '99990006F',
        nombre: 'AlumnoA',
        apellidos: 'Regla Negocio',
        email: 'alumnoA.regla@test.com'
      });

    const alumnoAId = guardarId('alumnos', resAluA.body.id);

    expect(resAluA.statusCode).toBe(201);
    expect(alumnoAId).toBeDefined();

    const resCurA = await request(app)
      .post('/api/cursos')
      .send({
        codigo: 'TEST-BUS-01',
        nombre: 'Curso Reglas de Negocio',
        horas: 30,
        plazas_maximas: 10
      });

    const cursoAId = guardarId('cursos', resCurA.body.id);

    expect(resCurA.statusCode).toBe(201);
    expect(cursoAId).toBeDefined();

    // Primera matrícula
    const resMatA1 = await request(app)
      .post('/api/matriculas')
      .send({
        alumno_id: alumnoAId,
        curso_id: cursoAId
      });

    const matriculaA1Id = guardarId(
      'matriculas',
      resMatA1.body.id
    );

    expect(resMatA1.statusCode).toBe(201);
    expect(matriculaA1Id).toBeDefined();

    // Intentar una segunda matrícula activa
    const resMatDup = await request(app)
      .post('/api/matriculas')
      .send({
        alumno_id: alumnoAId,
        curso_id: cursoAId
      });

    expect(resMatDup.statusCode).toBe(409);
    expect(resMatDup.body.success).toBe(false);
    expect(resMatDup.body.error)
      .toMatch(/ya tiene una matrícula activa/i);

    // Cancelar la primera matrícula
    const resCancelMatA = await request(app)
      .put(`/api/matriculas/${matriculaA1Id}/estado`)
      .send({ estado: 'canceled' });

    expect(resCancelMatA.statusCode).toBe(200);

    // Permitir una nueva matrícula después de cancelar la anterior
    const resRematriculacion = await request(app)
      .post('/api/matriculas')
      .send({
        alumno_id: alumnoAId,
        curso_id: cursoAId
      });

    const matriculaA2Id = guardarId(
      'matriculas',
      resRematriculacion.body.id
    );

    expect(resRematriculacion.statusCode).toBe(201);
    expect(resRematriculacion.body.success).toBe(true);
    expect(matriculaA2Id).toBeDefined();

    // REGLA 2: Control del límite de plazas

    const resCurLleno = await request(app)
      .post('/api/cursos')
      .send({
        codigo: 'TEST-CAP-01',
        nombre: 'Curso con Aforo Uno',
        horas: 20,
        plazas_maximas: 1
      });

    const cursoLlenoId = guardarId(
      'cursos',
      resCurLleno.body.id
    );

    expect(resCurLleno.statusCode).toBe(201);
    expect(cursoLlenoId).toBeDefined();

    const resAluB = await request(app)
      .post('/api/alumnos')
      .send({
        dni: '99990007G',
        nombre: 'AlumnoB',
        apellidos: 'Cupo Uno',
        email: 'alumnoB.cupo@test.com'
      });

    const alumnoBId = guardarId('alumnos', resAluB.body.id);

    expect(resAluB.statusCode).toBe(201);
    expect(alumnoBId).toBeDefined();

    const resAluC = await request(app)
      .post('/api/alumnos')
      .send({
        dni: '99990008H',
        nombre: 'AlumnoC',
        apellidos: 'Cupo Dos',
        email: 'alumnoC.cupo@test.com'
      });

    const alumnoCId = guardarId('alumnos', resAluC.body.id);

    expect(resAluC.statusCode).toBe(201);
    expect(alumnoCId).toBeDefined();

    // El primer alumno ocupa la única plaza
    const resMatB = await request(app)
      .post('/api/matriculas')
      .send({
        alumno_id: alumnoBId,
        curso_id: cursoLlenoId
      });

    const matriculaBId = guardarId(
      'matriculas',
      resMatB.body.id
    );

    expect(resMatB.statusCode).toBe(201);
    expect(matriculaBId).toBeDefined();

    // El segundo alumno debe ser rechazado
    const resMatC = await request(app)
      .post('/api/matriculas')
      .send({
        alumno_id: alumnoCId,
        curso_id: cursoLlenoId
      });

    expect(resMatC.statusCode).toBe(409);
    expect(resMatC.body.success).toBe(false);
    expect(resMatC.body.error).toMatch(/máximo de plazas/i);

    // REGLA 3: Integridad referencial

    const resDeleteAlumnoRestringido = await request(app)
      .delete(`/api/alumnos/${alumnoAId}`);

    expect(resDeleteAlumnoRestringido.statusCode).toBe(409);
    expect(resDeleteAlumnoRestringido.body.success).toBe(false);
    expect(resDeleteAlumnoRestringido.body.error)
      .toMatch(/matrículas asociadas/i);

    const resDeleteCursoRestringido = await request(app)
      .delete(`/api/cursos/${cursoLlenoId}`);

    expect(resDeleteCursoRestringido.statusCode).toBe(409);
    expect(resDeleteCursoRestringido.body.success).toBe(false);
    expect(resDeleteCursoRestringido.body.error)
      .toMatch(/matrículas asociadas/i);
  });
});

// ============================================================
// LIMPIEZA FINAL
// Se eliminan exclusivamente los IDs creados por estas pruebas.
// Primero matrículas, después alumnos y finalmente cursos.
// ============================================================
afterAll(async () => {
  try {
    await eliminarPorIds('matriculas', idsPrueba.matriculas);
    await eliminarPorIds('alumnos', idsPrueba.alumnos);
    await eliminarPorIds('cursos', idsPrueba.cursos);
  } finally {
    // Cerrar las conexiones incluso si la limpieza falla.
    await pool.end();
  }
});