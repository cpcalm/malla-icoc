let ramos = [];
const cursados = new Set();

fetch('ramos.json')
  .then(res => res.json())
  .then(data => {
    ramos = data;
    renderMalla();
  });

function puedeActivarse(ramo) {
  return ramo.prerrequisitos.every(n => cursados.has(Number(n)));
}

function renderMalla() {
  const container = document.getElementById('malla');
  const progreso = document.getElementById('barra-progreso');
  container.innerHTML = '';

  const agrupado = {};

  // Agrupar los ramos por año y semestre
  ramos.forEach(ramo => {
    const anio = ramo.anio;
    const semestre = ramo.semestre;
    if (!agrupado[anio]) agrupado[anio] = {};
    if (!agrupado[anio][semestre]) agrupado[anio][semestre] = [];
    agrupado[anio][semestre].push(ramo);
  });

  const total = ramos.length;
  const completados = ramos.filter(r => cursados.has(r.numero)).length;
  const porcentaje = Math.round((completados / total) * 100);
  progreso.innerHTML = `
    <div class="progreso-texto">${completados} / ${total} ramos completados (${porcentaje}%)</div>
    <div class="progreso-barra">
      <div class="progreso-fill" style="width: ${porcentaje}%;"></div>
    </div>
  `;

  const anios = Object.keys(agrupado).sort((a, b) => a - b);
  
  // Mostrar los años en fila y semestres debajo
  anios.forEach(anio => {
    const fila = document.createElement('div');
    fila.classList.add('fila-anio');
    const ramosPorAnio = agrupado[anio];

    const anioTitulo = document.createElement('h2');
    anioTitulo.textContent = `Año ${anio}`;
    fila.appendChild(anioTitulo);

    // Recorrer cada semestre de cada año
    Object.keys(ramosPorAnio).forEach(sem => {
      const columna = document.createElement('div');
      columna.classList.add('semestre');

      const semTitle = document.createElement('div');
      semTitle.className = 'semestre-titulo';
      semTitle.textContent = `Semestre ${sem}`;
      columna.appendChild(semTitle);

      // Agregar los ramos del semestre
      ramosPorAnio[sem].forEach(ramo => {
        const div = document.createElement('div');
        div.classList.add('ramo');

        if (cursados.has(ramo.numero)) {
          div.classList.add('tachado');
        } else if (ramo.prerrequisitos.length > 0 && !puedeActivarse(ramo)) {
          div.classList.add('atenuado');
        }

        div.innerHTML = `
          <div class="header-ramo">
            <div class="codigo">${ramo.codigo}</div>
            <div class="numero">${ramo.numero}</div>
          </div>
          <div class="nombre">${ramo.nombre}</div>
          <div class="prerreqs">
            ${ramo.prerrequisitos.map(p => `<span class="prerreq">${p}</span>`).join('')}
          </div>
          <div class="creditos">${ramo.creditos}</div>
        `;

        div.addEventListener('click', () => {
          if (cursados.has(ramo.numero)) {
            cursados.delete(ramo.numero);
          } else if (puedeActivarse(ramo) || ramo.prerrequisitos.length === 0) {
            cursados.add(ramo.numero);
          } else {
            alert("No puedes cursar este ramo aún.");
            return;
          }

          // Guardar en localStorage el estado
          localStorage.setItem('ramosCursados', JSON.stringify([...cursados]));
          renderMalla();
        });

        columna.appendChild(div);
      });

      fila.appendChild(columna);
    });

    container.appendChild(fila);
  });
}
