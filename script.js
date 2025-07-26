
let ramos = [];
let cursados = new Set();

// Recuperar avance desde localStorage
const saved = localStorage.getItem('ramosCursados');
if (saved) {
  try {
    cursados = new Set(JSON.parse(saved));
  } catch {}
}

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
  const container = document.getElementById('malla-container');
  const progreso = document.getElementById('barra-progreso');
  container.innerHTML = '';

  const agrupado = {};

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
  anios.forEach(anio => {
    const fila = document.createElement('div');
    fila.classList.add('fila-anio');

    const titulo = document.createElement('h2');
    titulo.textContent = `Año ${anio}`;
    fila.appendChild(titulo);

    ['I', 'II'].forEach(sem => {
      const columna = document.createElement('div');
      const semRamos = agrupado[anio][sem] || [];

      const semTitle = document.createElement('div');
      semTitle.className = 'semestre-titulo';
      semTitle.textContent = `Semestre ${sem}`;
      columna.appendChild(semTitle);

      const cont = document.createElement('div');
      cont.className = 'semestre';

      semRamos.forEach(ramo => {
        const div = document.createElement('div');
        div.classList.add('ramo');

        if (cursados.has(ramo.numero)) {
          div.classList.add('tachado');
        } else if (ramo.prerrequisitos.length > 0 && !puedeActivarse(ramo)) {
          div.classList.add('atenuado');
        }

        const tooltip = `Créditos: ${ramo.creditos}\nPrerrequisitos: ${
          ramo.prerrequisitos.length > 0 ? ramo.prerrequisitos.join(', ') : 'Ninguno'
        }`;

        div.setAttribute('title', tooltip);

        div.innerHTML = `
          <div class="codigo">${ramo.codigo}</div>
          <div class="nombre">${ramo.nombre}</div>
          <div class="prerreqs">
            ${ramo.prerrequisitos.map(p => `<span class="prerreq">${p}</span>`).join('')}
          </div>
          <div class="numero">${ramo.numero}</div>
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
          // Guardar en localStorage
          localStorage.setItem('ramosCursados', JSON.stringify([...cursados]));
          renderMalla();
        });

        cont.appendChild(div);
      });

      columna.appendChild(cont);
      fila.appendChild(columna);
    });

    container.appendChild(fila);
  });
}
