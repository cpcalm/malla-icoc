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
    const anio = parseInt(r.anio);
    const semestre = r.semestre;

    if (!agrupado[anio]) agrupado[anio] = {};
    if (!agrupado[anio][semestre]) agrupado[anio][semestre] = [];
    agrupado[anio][semestre].push(r);
  });

  const anios = Object.keys(agrupado).map(Number).sort((a, b) => a - b);

  // función para ordenar semestres en orden romano
  const ordenRomano = {
    I: 1, II: 2, III: 3, IV: 4, V: 5,
    VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11
  };

  anios.forEach((anio) => {
    const columna = document.createElement("div");
    columna.className = `fila-anio anio-${anio}`;

    const titulo = document.createElement("h2");
    titulo.textContent = `Año ${anio}`;
    columna.appendChild(titulo);

    const filaSemestres = document.createElement("div");
    filaSemestres.className = "fila-semestres";

    const semestres = Object.keys(agrupado[anio]).sort((a, b) => ordenRomano[a] - ordenRomano[b]);

    semestres.forEach((sem) => {
      const contenedorSem = document.createElement("div");
      contenedorSem.className = "semestre-col";

      const semTitulo = document.createElement("div");
      semTitulo.className = "semestre-titulo";
      semTitulo.textContent = `Semestre ${sem}`;
      contenedorSem.appendChild(semTitulo);

      const semContainer = document.createElement("div");
      semContainer.className = "semestre";

      agrupado[anio][sem].forEach((ramo) => {
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

  document.querySelector(".progreso-texto").textContent =
    `${realizados} / ${total} ramos completados (${Math.round((realizados / total) * 100)}%)`;
  document.querySelector(".progreso-fill").style.width =
    `${(realizados / total) * 100}%`;
// Mostrar mensaje de felicitación y confeti si se completa el 100%
if (realizados === total && !document.getElementById("felicitacion")) {
  const mensaje = document.createElement("div");
  mensaje.id = "felicitacion";
  mensaje.innerHTML = "🎉 Felicidades ingeniero/a, te deseo lo mejor en esta siguiente etapa 🎉";
  mensaje.className = "mensaje-felicitacion";
  document.body.appendChild(mensaje);

  // Confeti con canvas-confetti (CDN debe estar en index.html)
  confetti({
    particleCount: 200,
    spread: 160,
    origin: { y: 0.6 }
  });
}


cargarMalla();
