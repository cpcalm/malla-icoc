fetch('ramos.json')
  .then(res => res.json())
  .then(data => {
    ramos = data;
    renderMalla();
  });

let ramos = [];
const cursados = new Set();



function puedeActivarse(ramo) {
  return ramo.prerrequisitos.every(n => cursados.has(Number(n)));
}

function renderMalla() {
  const container = document.getElementById('malla-container');
  const progreso = document.getElementById('barra-progreso');
  container.innerHTML = '';

  const agrupado = {};
  ramos.forEach(ramo => {
    const key = `Año ${ramo.anio} - Semestre ${ramo.semestre}`;
    if (!agrupado[key]) agrupado[key] = [];
    agrupado[key].push(ramo);
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

  const clavesOrdenadas = Object.keys(agrupado).sort((a, b) => {
    const [aAnio, aSem] = a.match(/\d+/g).map(Number);
    const [bAnio, bSem] = b.match(/\d+/g).map(Number);
    return aAnio !== bAnio ? aAnio - bAnio : aSem - bSem;
  });

  clavesOrdenadas.forEach(clave => {
    const grupoDiv = document.createElement('div');
    const anioNum = clave.match(/Año (\d+)/)[1];
    grupoDiv.classList.add('grupo', `grupo-anio-${anioNum}`);

    const titulo = document.createElement('h2');
    titulo.textContent = clave;
    grupoDiv.appendChild(titulo);

    const fila = document.createElement('div');
    fila.classList.add('fila-ramos');

    agrupado[clave].forEach(ramo => {
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
        renderMalla();
      });

      fila.appendChild(div);
    });

    grupoDiv.appendChild(fila);
    container.appendChild(grupoDiv);
  });
}
