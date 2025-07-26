async function cargarMalla() {
  const response = await fetch("ramos.json");
  const ramos = await response.json();
  renderMalla(ramos);
}

function renderMalla(ramos) {
  const container = document.getElementById("contenedor");
  container.innerHTML = "";
  const completados = new Set(JSON.parse(localStorage.getItem("completados") || "[]"));

  const agrupado = {};
  ramos.forEach((r) => {
    if (!agrupado[r.anio]) agrupado[r.anio] = {};
    if (!agrupado[r.anio][r.semestre]) agrupado[r.anio][r.semestre] = [];
    agrupado[r.anio][r.semestre].push(r);
  });

  const anios = Object.keys(agrupado).sort((a, b) => a - b);
  anios.forEach((anio) => {
    const columna = document.createElement("div");
    columna.className = `fila-anio anio-${anio}`;

    const titulo = document.createElement("h2");
    titulo.textContent = `Año ${anio}`;
    columna.appendChild(titulo);

    const filaSemestres = document.createElement("div");
    filaSemestres.className = "fila-semestres";

    ["I", "II"].forEach((sem) => {
      const contenedorSem = document.createElement("div");
      contenedorSem.className = "semestre-col";

      const semTitulo = document.createElement("div");
      semTitulo.className = "semestre-titulo";
      semTitulo.textContent = `Semestre ${sem}`;
      contenedorSem.appendChild(semTitulo);

      const semContainer = document.createElement("div");
      semContainer.className = "semestre";

      (agrupado[anio][sem] || []).forEach((ramo) => {
        const div = document.createElement("div");
        div.className = "ramo";
        div.dataset.numero = ramo.numero;

        const completado = completados.has(ramo.numero);
        const habilitado =
          !ramo.prerrequisitos.length ||
          ramo.prerrequisitos.every((p) => completados.has(p));

        if (!habilitado) div.classList.add("atenuado");
        if (completado) div.classList.add("tachado");

        div.innerHTML = `
          <div class="header-ramo">
            <div class="codigo">${ramo.codigo}</div>
            <div class="numero">${ramo.numero}</div>
          </div>
          <div class="nombre">${ramo.nombre}</div>
          <div class="prerreqs">
            ${ramo.prerrequisitos.map((p) => `<span class="prerreq">${p}</span>`).join("")}
          </div>
          <div class="creditos">${ramo.creditos}</div>
        `;

        div.addEventListener("click", () => {
          if (completados.has(ramo.numero)) {
            completados.delete(ramo.numero);
          } else {
            completados.add(ramo.numero);
          }
          localStorage.setItem("completados", JSON.stringify([...completados]));
          renderMalla(ramos);
        });

        semContainer.appendChild(div);
      });

      contenedorSem.appendChild(semContainer);
      filaSemestres.appendChild(contenedorSem);
    });

    columna.appendChild(filaSemestres);
    container.appendChild(columna);
  });

  const total = ramos.length;
  const realizados = [...completados].filter((n) =>
    ramos.some((r) => r.numero === parseInt(n))
  ).length;

  document.querySelector(".progreso-texto").textContent = `${realizados} / ${total} ramos completados (${Math.round((realizados / total) * 100)}%)`;
  document.querySelector(".progreso-fill").style.width = `${(realizados / total) * 100}%`;
}

cargarMalla();

