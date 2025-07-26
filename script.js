
const mallaData = [
    {anio: 1, semestre: 'I', codigo: 'INF101', nombre: 'Introducción a la Ingeniería', numero: '1', creditos: 5, prerrequisitos: []},
    {anio: 1, semestre: 'II', codigo: 'MAT102', nombre: 'Matemáticas I', numero: '2', creditos: 6, prerrequisitos: ['INF101']},
    {anio: 2, semestre: 'I', codigo: 'MAT201', nombre: 'Matemáticas II', numero: '3', creditos: 6, prerrequisitos: ['MAT102']},
    {anio: 2, semestre: 'II', codigo: 'FIS201', nombre: 'Física I', numero: '4', creditos: 6, prerrequisitos: ['MAT201']}
];

function renderMalla() {
    const contenedor = document.getElementById("malla");
    const anios = [...new Set(mallaData.map(ramo => ramo.anio))];

    anios.forEach(anio => {
        const fila = document.createElement('div');
        fila.classList.add('fila-anio');
        const ramosPorAnio = mallaData.filter(ramo => ramo.anio === anio);
        const anioTitulo = document.createElement('h2');
        anioTitulo.textContent = `Año ${anio}`;
        fila.appendChild(anioTitulo);

        ramosPorAnio.forEach(ramo => {
            const div = document.createElement('div');
            div.classList.add('ramo');
            if (ramo.prerrequisitos.length > 0) div.classList.add('atenuado');
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
            fila.appendChild(div);
        });

        contenedor.appendChild(fila);
    });
}

document.addEventListener('DOMContentLoaded', renderMalla);
