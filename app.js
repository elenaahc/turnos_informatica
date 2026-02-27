// ==========================================================
// --- 1. DATOS Y DEFINICIONES GLOBALES ---
// ==========================================================

// Nueva fecha de inicio del ciclo de rotación
const fechaInicioCiclo = new Date('2026-03-02T00:00:00');

// Ordenados según el turno que toman en la primera semana (Semana 1)
const personasRotativas = [
    { nombre: 'Harold', inicial: 'H' },    // Tomará el primer turno del arreglo (T1)
    { nombre: 'Elena', inicial: 'E' },     // Tomará el segundo turno del arreglo (T3)
    { nombre: 'Francisca', inicial: 'F' }  // Tomará el tercer turno del arreglo (T4)
];

// Nicolás es el único turno fijo
const personasFijas = [
    { nombre: 'Nicolas', inicial: 'N', turno: 'TurnoNico' }
];

// Rango de Verano (mantenido por si es necesario a futuro)
const veranoInicio = new Date('2026-01-05T00:00:00');
const veranoFin = new Date('2026-03-01T23:59:59');

const detallesTurnos = {
    'T1': { 'Lun': '08:00-16:00', 'Mar': '08:00-16:00', 'Mié': '08:00-16:00', 'Jue': '08:00-16:00', 'Vie': '08:00-13:30', 'Sáb': '08:00-13:00', 'Dom': 'Libre', colacion: '12:00-12:30' },
    'T2': { 'Lun': 'Suspendido', 'Mar': 'Suspendido', 'Mié': 'Suspendido', 'Jue': 'Suspendido', 'Vie': 'Suspendido', 'Sáb': 'Libre', 'Dom': 'Libre', colacion: '' },
    'T3': { 'Lun': '08:00-17:30', 'Mar': '08:00-17:30', 'Mié': '08:00-17:30', 'Jue': '08:00-17:30', 'Vie': '08:00-17:30', 'Sáb': 'Libre', 'Dom': 'Libre', colacion: '13:00-14:00' },
    'T4': { 'Lun': '13:00-22:00', 'Mar': '13:00-22:00', 'Mié': '13:00-22:00', 'Jue': '13:00-22:00', 'Vie': '15:30-22:00', 'Sáb': 'Libre', 'Dom': 'Libre', colacion: '17:00-17:30' },
    'TurnoNico': { 'Lun': '17:30-22:00', 'Mar': '17:30-22:00', 'Mié': '17:30-22:00', 'Jue': '17:30-22:00', 'Vie': '17:30-22:00', 'Sáb': 'Libre', 'Dom': 'Libre', colacion: '' }, // Turno fijo
    'Verano': { 'Lun': 'Suspendido', 'Mar': 'Suspendido', 'Mié': 'Suspendido', 'Jue': 'Suspendido', 'Vie': 'Suspendido', 'Sáb': 'Libre', 'Dom': 'Libre', colacion: '' },
    'SinTurno': { 'Lun': '0h', 'Mar': '0h', 'Mié': '0h', 'Jue': '0h', 'Vie': '0h', 'Sáb': '0h', 'Dom': '0h', colacion: '' }
};

// Excepciones y horarios especiales (puedes limpiar o actualizar esto según necesites)
const especiales = {
    // Ejemplo: '2026-03-10': { 'Elena': '09:00-13:30' }
};

// Nuevo ciclo de rotación (solo 3 semanas porque no hay T2)
const cicloRotacion = [
    ['T1', 'T3', 'T4'], // Semana 1: Harold (T1), Elena (T3), Francisca (T4)
    ['T3', 'T4', 'T1'], // Semana 2: Harold (T3), Elena (T4), Francisca (T1)
    ['T4', 'T1', 'T3']  // Semana 3: Harold (T4), Elena (T1), Francisca (T3)
];

const diasSemanaLookup = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const diasSemanaCorta = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

let currentDisplayedMonday = getMonday(new Date());
let currentDisplayedMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function getSemanasDiferencia(fechaInicio, fechaFin) {
    const msPorSemana = 1000 * 60 * 60 * 24 * 7;
    const inicioSemana = getMonday(fechaInicio);
    const finSemana = getMonday(fechaFin);
    const diffMs = finSemana.getTime() - inicioSemana.getTime();
    return Math.floor(diffMs / msPorSemana);
}

function getShiftsForDay(date) {
    const fechaStr = date.toISOString().split('T')[0];
    const diaDeLaSemanaStr = diasSemanaLookup[date.getDay()];
    const esPeriodoVerano = date >= veranoInicio && date <= veranoFin;

    // Cálculo del índice para una rotación de 3 semanas
    const semanasPasadas = getSemanasDiferencia(fechaInicioCiclo, date);
    const semanaCicloIndex = (semanasPasadas % 3 + 3) % 3; // Módulo 3 en lugar de 4
    const turnosDeLaSemana = cicloRotacion[semanaCicloIndex];

    let shifts = [];

    // Asignación de turnos rotativos
    personasRotativas.forEach((persona, pIndex) => {
        let horario, colacion, clase, turnoLabel;

        if (especiales[fechaStr] && especiales[fechaStr][persona.nombre]) {
            horario = especiales[fechaStr][persona.nombre];
            colacion = "";
            clase = "turno-4"; 
            turnoLabel = "Especial";
        } else if (esPeriodoVerano && persona.nombre !== '-----') {
            turnoLabel = 'Verano';
            horario = detallesTurnos['Verano'][diaDeLaSemanaStr];
            colacion = detallesTurnos['Verano'].colacion;
            clase = "turno-2";
        } else {
            const turno = turnosDeLaSemana[pIndex];
            turnoLabel = turno;
            horario = detallesTurnos[turno][diaDeLaSemanaStr];
            colacion = detallesTurnos[turno].colacion;
            clase = `turno-${turno.replace('T', '')}`;
        }

        if (horario === 'Suspendido') {
            clase = 'turno-suspendido';
        }

        shifts.push({
            inicial: persona.inicial, nombre: persona.nombre, turno: turnoLabel,
            horario: horario, colacion: colacion, clase: clase
        });
    });

    // Asignación de turnos fijos (Nicolás)
    personasFijas.forEach(persona => {
        const turno = persona.turno;
        const horario = detallesTurnos[turno][diaDeLaSemanaStr];
        shifts.push({
            inicial: persona.inicial, nombre: persona.nombre, turno: turno,
            horario: horario, colacion: '', clase: 'turno-fijo'
        });
    });
    
    return shifts;
}

function renderWeekCalendar() {
    const shiftsGrid = document.getElementById('shiftsGrid');
    const mobileView = document.getElementById('mobile-week-view');
    shiftsGrid.innerHTML = '';
    mobileView.innerHTML = '';

    const mondayOfCurrentWeek = new Date(currentDisplayedMonday);

    let headerHtml = `<div class="grid-cell"></div>`;
    for (let i = 0; i < 7; i++) {
        const dia = new Date(mondayOfCurrentWeek);
        dia.setDate(mondayOfCurrentWeek.getDate() + i);
        headerHtml += `<div class="grid-cell">${diasSemanaCorta[i]} ${dia.getDate()} ${dia.toLocaleDateString('es-CL', { month: 'short' })}</div>`;
    }
    shiftsGrid.innerHTML += `<div class="grid-header">${headerHtml}</div>`;

    const todasLasPersonas = [...personasRotativas.map(p => p.nombre), ...personasFijas.map(p => p.nombre)];

    todasLasPersonas.forEach(nombre => {
        if (nombre === '-----') return;
        
        let rowHtml = `<div class="grid-cell"><strong>${nombre}</strong></div>`;
        let mobileDaysHtml = '';

        for (let i = 0; i < 7; i++) {
            const diaActual = new Date(mondayOfCurrentWeek);
            diaActual.setDate(mondayOfCurrentWeek.getDate() + i);
            const shiftsDelDia = getShiftsForDay(diaActual);
            const s = shiftsDelDia.find(sh => sh.nombre === nombre);

            const colHtml = (s.colacion && s.horario !== 'Libre' && s.horario !== '0h' && s.horario !== 'Suspendido') ? `<span class="colacion-text">Col: ${s.colacion}</span>` : '';

            rowHtml += `<div class="grid-cell">
            <div class="shift-block ${s.clase}">
                <span class="horario-text">${s.horario}</span>
                ${colHtml}
            </div>
        </div>`;

            mobileDaysHtml += `<div class="day-entry">
            <strong>${diasSemanaCorta[i]} ${diaActual.getDate()}</strong>
            <div class="day-entry-shift ${s.clase}">
                <span>${s.horario}</span>
                ${colHtml}
            </div>
        </div>`;
        }
        shiftsGrid.innerHTML += `<div class="grid-row">${rowHtml}</div>`;
        mobileView.innerHTML += `<div class="person-card"><div class="person-header">${nombre}</div><div class="days-list">${mobileDaysHtml}</div></div>`;
    });

    const endOfWeek = new Date(mondayOfCurrentWeek);
    endOfWeek.setDate(mondayOfCurrentWeek.getDate() + 6);
    document.getElementById('currentWeekRange').textContent = `${mondayOfCurrentWeek.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function renderMonthCalendar() {
    const grid = document.getElementById('calendar-days-grid');
    grid.innerHTML = '';
    const year = currentDisplayedMonth.getFullYear();
    const month = currentDisplayedMonth.getMonth();

    document.getElementById('currentMonthName').textContent = currentDisplayedMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase();

    const firstDay = getMonday(new Date(year, month, 1));
    let currentDay = new Date(firstDay);

    for (let i = 0; i < 42; i++) {
        const esOtroMes = currentDay.getMonth() !== month;
        const dayShifts = getShiftsForDay(currentDay);
        let shiftsHtml = '';
        dayShifts.forEach(s => {
            if (s.horario !== 'Libre' && s.horario !== '0h' && s.horario !== 'Suspendido' && s.nombre !== '-----') {
                shiftsHtml += `<div class="mini-shift ${s.clase}">${s.inicial}: ${s.horario}</div>`;
            }
        });

        grid.innerHTML += `<div class="day-cell ${esOtroMes ? 'other-month' : ''}">
        <div class="day-number">${currentDay.getDate()}</div>
        <div class="shifts-in-day">${shiftsHtml}</div>
    </div>`;
        currentDay.setDate(currentDay.getDate() + 1);
    }
}

document.getElementById('toggleWeek').addEventListener('click', () => {
    document.getElementById('toggleWeek').classList.add('active');
    document.getElementById('toggleMonth').classList.remove('active');
    document.getElementById('week-view-container').style.display = 'block';
    document.getElementById('month-view-container').style.display = 'none';
    renderWeekCalendar();
});

document.getElementById('toggleMonth').addEventListener('click', () => {
    document.getElementById('toggleMonth').classList.add('active');
    document.getElementById('toggleWeek').classList.remove('active');
    document.getElementById('month-view-container').style.display = 'block';
    document.getElementById('week-view-container').style.display = 'none';
    renderMonthCalendar();
});

document.getElementById('prevWeekBtn').addEventListener('click', () => { currentDisplayedMonday.setDate(currentDisplayedMonday.getDate() - 7); renderWeekCalendar(); });
document.getElementById('nextWeekBtn').addEventListener('click', () => { currentDisplayedMonday.setDate(currentDisplayedMonday.getDate() + 7); renderWeekCalendar(); });
document.getElementById('prevMonthBtn').addEventListener('click', () => { currentDisplayedMonth.setMonth(currentDisplayedMonth.getMonth() - 1); renderMonthCalendar(); });
document.getElementById('nextMonthBtn').addEventListener('click', () => { currentDisplayedMonth.setMonth(currentDisplayedMonth.getMonth() + 1); renderMonthCalendar(); });

document.addEventListener('DOMContentLoaded', renderWeekCalendar);
