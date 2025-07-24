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
  const container = document.getElementById('malla-container');
  container.innerHTML = '';
  ramos.forEach(ramo => {
    const div = document.createElement('div');
    div.classList.add('ramo');
    if (cursados.has(ramo.numero)) {
      div.classList.add('tachado');
    } else if (ramo.prerrequisitos.length > 0 && !puedeActivarse(ramo)) {
      div.classList.add('atenuado');
    }

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

    container.appendChild(div);
  });
}
