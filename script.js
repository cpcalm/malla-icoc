fetch('malla_interactiva.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('malla-container');
    data.forEach(ramo => {
      const div = document.createElement('div');
      div.className = 'ramo';
      div.setAttribute('data-area', ramo.area || 'formacion-profesional');
      div.innerHTML = `
        <div class="header">
          <span>${ramo.sigla}</span>
          <span>${ramo.numero}</span>
        </div>
        <div class="nombre">${ramo.nombre}</div>
        <div class="creditos">${ramo.creditos || "?"} SCT</div>
        <div class="prereqs">
          ${ramo.prerrequisitos.map(n => `<div class="circle">${n}</div>`).join('')}
        </div>
      `;
      div.onclick = () => showModal(ramo, data);
      container.appendChild(div);
    });
  });

function showModal(ramo, data) {
  document.getElementById('modal-title').textContent = ramo.nombre;
  document.getElementById('modal-sigla').textContent = ramo.sigla;
  document.getElementById('modal-creditos').textContent = ramo.creditos || "N/A";
  document.getElementById('modal-prerequisitos').textContent = ramo.prerrequisitos
    .map(n => {
      const r = data.find(x => x.numero === n);
      return r ? r.sigla : `#${n}`;
    }).join(', ') || "Ninguno";
  document.getElementById('modal').style.display = 'block';
}

document.getElementById('close-modal').onclick = () => {
  document.getElementById('modal').style.display = 'none';
};
