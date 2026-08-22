/**
 * PROCESOS INDUSTRIALES - SISTEMA DE PROGRESO
 * Plataforma educativa elite - 2026-2
 * 
 * Sistema de seguimiento del progreso del estudiante usando localStorage
 * - Guardado automático de quizzes completados
 * - Dashboard de avance por paso
 * - Sistema de logros/medallas
 * - Estadísticas de estudio
 * - Sincronización visual en cada página
 */

// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

const PROGRESO_CONFIG = {
    STORAGE_KEY: 'procesos_industriales_progreso',
    VERSION: '1.0.0',
    LOGROS: {
        primer_quiz: {
            id: 'primer_quiz',
            nombre: 'Primer Paso',
            descripcion: 'Completa tu primer quiz',
            icono: 'fa-shoe-prints',
            color: '#28A745'
        },
        quiz_perfecto: {
            id: 'quiz_perfecto',
            nombre: 'Perfeccionista',
            descripcion: 'Obtén 100% en un quiz',
            icono: 'fa-trophy',
            color: '#FFD700'
        },
        tres_quizzes: {
            id: 'tres_quizzes',
            nombre: 'Constante',
            descripcion: 'Completa 3 quizzes',
            icono: 'fa-fire',
            color: '#FF6B00'
        },
        cinco_quizzes: {
            id: 'cinco_quizzes',
            nombre: 'Dedicado',
            descripcion: 'Completa 5 quizzes',
            icono: 'fa-star',
            color: '#17A2B8'
        },
        todos_los_pasos: {
            id: 'todos_los_pasos',
            nombre: 'Maestro de Procesos',
            descripcion: 'Completa todos los pasos (0-4)',
            icono: 'fa-crown',
            color: '#6C757D'
        },
        promedio_excelente: {
            id: 'promedio_excelente',
            nombre: 'Excelencia Académica',
            descripcion: 'Mantén un promedio > 80%',
            icono: 'fa-medal',
            color: '#FF6B00'
        }
    },
    PASOS: ['paso0', 'paso1', 'paso2', 'paso3', 'paso4']
};

// ============================================
// CLASE PRINCIPAL: SistemaProgreso
// ============================================

class SistemaProgreso {
    constructor() {
        this.datos = this.cargarDatos();
        this.inicializar();
    }

    /**
     * Cargar datos del localStorage
     */
    cargarDatos() {
        try {
            const datosGuardados = localStorage.getItem(PROGRESO_CONFIG.STORAGE_KEY);
            if (datosGuardados) {
                return JSON.parse(datosGuardados);
            }
        } catch (error) {
            console.warn('Error al cargar datos de progreso:', error);
        }
        
        // Datos iniciales
        return {
            version: PROGRESO_CONFIG.VERSION,
            fechaInicio: new Date().toISOString(),
            ultimaActividad: new Date().toISOString(),
            quizzes: {},
            paginasVisitadas: [],
            tiempoEstudio: 0,
            logrosDesbloqueados: [],
            estadisticas: {
                totalQuizzes: 0,
                totalPreguntas: 0,
                preguntasCorrectas: 0,
                promedioGeneral: 0
            }
        };
    }

    /**
     * Guardar datos en localStorage
     */
    guardarDatos() {
        try {
            this.datos.ultimaActividad = new Date().toISOString();
            localStorage.setItem(PROGRESO_CONFIG.STORAGE_KEY, JSON.stringify(this.datos));
        } catch (error) {
            console.warn('Error al guardar datos de progreso:', error);
        }
    }

    /**
     * Inicializar el sistema
     */
    inicializar() {
        // Registrar visita a página actual
        this.registrarVisitaPagina();
        
        // Iniciar tracking de tiempo
        this.iniciarTrackingTiempo();
        
        // Mostrar badge de progreso si existe el contenedor
        this.mostrarBadgeProgreso();
        
        // Verificar logros
        this.verificarLogros();
        
        console.log('%c ✓ Sistema de progreso inicializado', 'color: #28A745; font-weight: bold;');
    }

    // ============================================
    // REGISTRO DE QUIZZES
    // ============================================

    /**
     * Registrar resultado de quiz
     */
    registrarQuiz(paso, resultado) {
        const quizId = `quiz_${paso}_${Date.now()}`;
        
        const registroQuiz = {
            id: quizId,
            paso: paso,
            fecha: new Date().toISOString(),
            puntaje: resultado.score,
            total: resultado.total,
            porcentaje: resultado.percentage,
            respuestas: resultado.answers,
            tiempoCompletado: resultado.tiempo || 0
        };

        // Guardar en el array de quizzes
        if (!this.datos.quizzes[paso]) {
            this.datos.quizzes[paso] = [];
        }
        this.datos.quizzes[paso].push(registroQuiz);

        // Actualizar estadísticas
        this.datos.estadisticas.totalQuizzes++;
        this.datos.estadisticas.totalPreguntas += resultado.total;
        this.datos.estadisticas.preguntasCorrectas += resultado.score;
        
        // Recalcular promedio
        if (this.datos.estadisticas.totalPreguntas > 0) {
            this.datos.estadisticas.promedioGeneral = 
                (this.datos.estadisticas.preguntasCorrectas / this.datos.estadisticas.totalPreguntas) * 100;
        }

        this.guardarDatos();
        
        // Verificar logros
        this.verificarLogros();
        
        // Actualizar badge
        this.mostrarBadgeProgreso();
        
        // Notificar al usuario
        this.mostrarNotificacionLogro(registroQuiz);
        
        return registroQuiz;
    }

    /**
     * Obtener mejor puntaje de un paso
     */
    obtenerMejorPuntaje(paso) {
        if (!this.datos.quizzes[paso] || this.datos.quizzes[paso].length === 0) {
            return null;
        }
        
        return this.datos.quizzes[paso].reduce((mejor, actual) => 
            actual.porcentaje > mejor.porcentaje ? actual : mejor
        );
    }

    /**
     * Obtener historial de quizzes de un paso
     */
    obtenerHistorialQuizzes(paso) {
        return this.datos.quizzes[paso] || [];
    }

    /**
     * Verificar si un paso está completado (al menos 1 quiz con > 60%)
     */
    estaPasoCompletado(paso) {
        if (!this.datos.quizzes[paso] || this.datos.quizzes[paso].length === 0) {
            return false;
        }
        
        return this.datos.quizzes[paso].some(quiz => quiz.porcentaje >= 60);
    }

    // ============================================
    // REGISTRO DE PÁGINAS
    // ============================================

    /**
     * Registrar visita a página
     */
    registrarVisitaPagina() {
        const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
        
        if (!this.datos.paginasVisitadas.includes(paginaActual)) {
            this.datos.paginasVisitadas.push(paginaActual);
            this.guardarDatos();
        }
    }

    // ============================================
    // TRACKING DE TIEMPO
    // ============================================

    /**
     * Iniciar tracking de tiempo de estudio
     */
    iniciarTrackingTiempo() {
        let tiempoSesion = 0;
        
        // Actualizar cada segundo
        const intervalo = setInterval(() => {
            tiempoSesion++;
            this.datos.tiempoEstudio++;
            
            // Guardar cada minuto
            if (tiempoSesion % 60 === 0) {
                this.guardarDatos();
            }
        }, 1000);
        
        // Guardar al cerrar la página
        window.addEventListener('beforeunload', () => {
            this.guardarDatos();
            clearInterval(intervalo);
        });
    }

    /**
     * Formatear tiempo de estudio
     */
    formatearTiempo(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segundosRestantes = segundos % 60;
        
        if (horas > 0) {
            return `${horas}h ${minutos}m`;
        } else if (minutos > 0) {
            return `${minutos}m ${segundosRestantes}s`;
        } else {
            return `${segundosRestantes}s`;
        }
    }

    // ============================================
    // LOGROS
    // ============================================

    /**
     * Verificar y desbloquear logros
     */
    verificarLogros() {
        const logrosNuevos = [];
        
        // Logro: Primer quiz
        if (this.datos.estadisticas.totalQuizzes >= 1 && 
            !this.datos.logrosDesbloqueados.includes('primer_quiz')) {
            this.datos.logrosDesbloqueados.push('primer_quiz');
            logrosNuevos.push(PROGRESO_CONFIG.LOGROS.primer_quiz);
        }
        
        // Logro: Quiz perfecto
        const tieneQuizPerfecto = Object.values(this.datos.quizzes).some(pasoQuizzes => 
            pasoQuizzes.some(quiz => quiz.porcentaje === 100)
        );
        if (tieneQuizPerfecto && 
            !this.datos.logrosDesbloqueados.includes('quiz_perfecto')) {
            this.datos.logrosDesbloqueados.push('quiz_perfecto');
            logrosNuevos.push(PROGRESO_CONFIG.LOGROS.quiz_perfecto);
        }
        
        // Logro: 3 quizzes
        if (this.datos.estadisticas.totalQuizzes >= 3 && 
            !this.datos.logrosDesbloqueados.includes('tres_quizzes')) {
            this.datos.logrosDesbloqueados.push('tres_quizzes');
            logrosNuevos.push(PROGRESO_CONFIG.LOGROS.tres_quizzes);
        }
        
        // Logro: 5 quizzes
        if (this.datos.estadisticas.totalQuizzes >= 5 && 
            !this.datos.logrosDesbloqueados.includes('cinco_quizzes')) {
            this.datos.logrosDesbloqueados.push('cinco_quizzes');
            logrosNuevos.push(PROGRESO_CONFIG.LOGROS.cinco_quizzes);
        }
        
        // Logro: Todos los pasos
        const todosCompletados = PROGRESO_CONFIG.PASOS.every(paso => 
            this.estaPasoCompletado(paso)
        );
        if (todosCompletados && 
            !this.datos.logrosDesbloqueados.includes('todos_los_pasos')) {
            this.datos.logrosDesbloqueados.push('todos_los_pasos');
            logrosNuevos.push(PROGRESO_CONFIG.LOGROS.todos_los_pasos);
        }
        
        // Logro: Promedio excelente
        if (this.datos.estadisticas.promedioGeneral >= 80 && 
            this.datos.estadisticas.totalQuizzes >= 3 &&
            !this.datos.logrosDesbloqueados.includes('promedio_excelente')) {
            this.datos.logrosDesbloqueados.push('promedio_excelente');
            logrosNuevos.push(PROGRESO_CONFIG.LOGROS.promedio_excelente);
        }
        
        if (logrosNuevos.length > 0) {
            this.guardarDatos();
        }
        
        return logrosNuevos;
    }

    /**
     * Mostrar notificación de logro
     */
    mostrarNotificacionLogro(quiz) {
        const logrosNuevos = this.verificarLogros();
        
        if (logrosNuevos.length > 0) {
            logrosNuevos.forEach(logro => {
                this.crearNotificacionLogro(logro);
            });
        }
    }

    /**
     * Crear notificación visual de logro
     */
    crearNotificacionLogro(logro) {
        const notificacion = document.createElement('div');
        notificacion.className = 'logro-notificacion';
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, ${logro.color} 0%, #1A1A1A 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 350px;
            animation: slideInRight 0.5s ease;
            border-left: 5px solid ${logro.color};
        `;
        
        notificacion.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas ${logro.icono}" style="font-size: 2.5rem; color: ${logro.color};"></i>
                <div>
                    <div style="font-size: 0.8rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">¡Logro Desbloqueado!</div>
                    <div style="font-size: 1.2rem; font-weight: bold; margin: 5px 0;">${logro.nombre}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">${logro.descripcion}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notificacion);
        
        // Agregar animación CSS
        if (!document.getElementById('logro-animaciones')) {
            const style = document.createElement('style');
            style.id = 'logro-animaciones';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => notificacion.remove(), 500);
        }, 5000);
        
        // Cerrar al hacer click
        notificacion.addEventListener('click', () => {
            notificacion.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => notificacion.remove(), 500);
        });
    }

    // ============================================
    // BADGE DE PROGRESO
    // ============================================

    /**
     * Mostrar badge de progreso en la página
     */
    mostrarBadgeProgreso() {
        const contenedorBadge = document.getElementById('badge-progreso');
        if (!contenedorBadge) return;
        
        const progresoTotal = this.calcularProgresoTotal();
        const quizzesCompletados = this.datos.estadisticas.totalQuizzes;
        const promedio = this.datos.estadisticas.promedioGeneral;
        
        contenedorBadge.innerHTML = `
            <div class="badge-progreso-content">
                <div class="badge-progreso-header">
                    <i class="fas fa-chart-line"></i>
                    <span>Tu Progreso</span>
                </div>
                <div class="badge-progreso-stats">
                    <div class="stat-item">
                        <div class="stat-value">${progresoTotal}%</div>
                        <div class="stat-label">Completado</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${quizzesCompletados}</div>
                        <div class="stat-label">Quizzes</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Math.round(promedio)}%</div>
                        <div class="stat-label">Promedio</div>
                    </div>
                </div>
                <div class="badge-progreso-bar">
                    <div class="progress-fill" style="width: ${progresoTotal}%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Calcular progreso total (0-100%)
     */
    calcularProgresoTotal() {
        const pasosCompletados = PROGRESO_CONFIG.PASOS.filter(paso => 
            this.estaPasoCompletado(paso)
        ).length;
        
        return Math.round((pasosCompletados / PROGRESO_CONFIG.PASOS.length) * 100);
    }

    // ============================================
    // DASHBOARD DE PROGRESO
    // ============================================

    /**
     * Generar HTML del dashboard completo
     */
    generarDashboard() {
        const progresoTotal = this.calcularProgresoTotal();
        const tiempoFormateado = this.formatearTiempo(this.datos.tiempoEstudio);
        
        let html = `
            <div class="dashboard-progreso">
                <div class="dashboard-header">
                    <h2><i class="fas fa-chart-line"></i> Dashboard de Progreso</h2>
                    <p class="text-muted">Seguimiento de tu aprendizaje en Procesos Industriales</p>
                </div>
                
                <!-- Estadísticas Generales -->
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <i class="fas fa-percentage stat-icon" style="color: #FF6B00;"></i>
                        <div class="stat-info">
                            <div class="stat-value">${progresoTotal}%</div>
                            <div class="stat-label">Progreso Total</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-question-circle stat-icon" style="color: #17A2B8;"></i>
                        <div class="stat-info">
                            <div class="stat-value">${this.datos.estadisticas.totalQuizzes}</div>
                            <div class="stat-label">Quizzes Completados</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-check-circle stat-icon" style="color: #28A745;"></i>
                        <div class="stat-info">
                            <div class="stat-value">${this.datos.estadisticas.preguntasCorrectas}</div>
                            <div class="stat-label">Preguntas Correctas</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-clock stat-icon" style="color: #6C757D;"></i>
                        <div class="stat-info">
                            <div class="stat-value">${tiempoFormateado}</div>
                            <div class="stat-label">Tiempo de Estudio</div>
                        </div>
                    </div>
                </div>
                
                <!-- Progreso por Paso -->
                <div class="dashboard-pasos">
                    <h3><i class="fas fa-route"></i> Progreso por Paso</h3>
                    <div class="pasos-grid">
        `;
        
        PROGRESO_CONFIG.PASOS.forEach((paso, index) => {
            const mejorPuntaje = this.obtenerMejorPuntaje(paso);
            const completado = this.estaPasoCompletado(paso);
            const numQuizzes = this.obtenerHistorialQuizzes(paso).length;
            
            const nombresPasos = {
                'paso0': 'Sistema y Frontera',
                'paso1': 'Matriz Entrada-Salida',
                'paso2': 'Clasificación',
                'paso3': 'Régimen Temporal',
                'paso4': 'Guía en 8 Pasos'
            };
            
            html += `
                <div class="paso-card ${completado ? 'completado' : ''}">
                    <div class="paso-header">
                        <span class="paso-numero">${index}</span>
                        <span class="paso-nombre">${nombresPasos[paso]}</span>
                        ${completado ? '<i class="fas fa-check-circle text-success"></i>' : ''}
                    </div>
                    <div class="paso-stats">
                        <div class="paso-stat">
                            <span class="label">Quizzes:</span>
                            <span class="value">${numQuizzes}</span>
                        </div>
                        <div class="paso-stat">
                            <span class="label">Mejor:</span>
                            <span class="value">${mejorPuntaje ? Math.round(mejorPuntaje.porcentaje) + '%' : 'N/A'}</span>
                        </div>
                    </div>
                    ${mejorPuntaje ? `
                        <div class="paso-bar">
                            <div class="progress-fill" style="width: ${mejorPuntaje.porcentaje}%"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                
                <!-- Logros -->
                <div class="dashboard-logros">
                    <h3><i class="fas fa-trophy"></i> Logros Desbloqueados (${this.datos.logrosDesbloqueados.length}/${Object.keys(PROGRESO_CONFIG.LOGROS).length})</h3>
                    <div class="logros-grid">
        `;
        
        Object.values(PROGRESO_CONFIG.LOGROS).forEach(logro => {
            const desbloqueado = this.datos.logrosDesbloqueados.includes(logro.id);
            html += `
                <div class="logro-card ${desbloqueado ? 'desbloqueado' : 'bloqueado'}">
                    <i class="fas ${logro.icono}" style="color: ${desbloqueado ? logro.color : '#C0C0C0'};"></i>
                    <div class="logro-info">
                        <div class="logro-nombre">${logro.nombre}</div>
                        <div class="logro-descripcion">${logro.descripcion}</div>
                    </div>
                    ${desbloqueado ? '<i class="fas fa-check-circle text-success"></i>' : '<i class="fas fa-lock text-muted"></i>'}
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
                
                <!-- Acciones -->
                <div class="dashboard-acciones">
                    <button class="btn btn-warning" onclick="sistemaProgreso.resetearProgreso()">
                        <i class="fas fa-redo"></i> Resetear Progreso
                    </button>
                    <button class="btn btn-info" onclick="sistemaProgreso.exportarProgreso()">
                        <i class="fas fa-download"></i> Exportar Datos
                    </button>
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * Mostrar dashboard en modal
     */
    mostrarDashboard() {
        const modal = document.createElement('div');
        modal.className = 'dashboard-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow-y: auto;
        `;
        
        const contenido = document.createElement('div');
        contenido.className = 'dashboard-modal-content';
        contenido.style.cssText = `
            background: white;
            border-radius: 15px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 30px;
            position: relative;
        `;
        
        contenido.innerHTML = this.generarDashboard();
        
        // Botón cerrar
        const btnCerrar = document.createElement('button');
        btnCerrar.innerHTML = '<i class="fas fa-times"></i>';
        btnCerrar.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: #DC3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 1.2rem;
        `;
        btnCerrar.onclick = () => modal.remove();
        
        contenido.appendChild(btnCerrar);
        modal.appendChild(contenido);
        document.body.appendChild(modal);
        
        // Cerrar al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // ============================================
    // RESET Y EXPORTACIÓN
    // ============================================

    /**
     * Resetear todo el progreso
     */
    resetearProgreso() {
        if (confirm('¿Estás seguro de que deseas resetear todo tu progreso? Esta acción no se puede deshacer.')) {
            localStorage.removeItem(PROGRESO_CONFIG.STORAGE_KEY);
            this.datos = this.cargarDatos();
            this.mostrarBadgeProgreso();
            alert('Progreso reseteado exitosamente.');
            location.reload();
        }
    }

    /**
     * Exportar progreso como JSON
     */
    exportarProgreso() {
        const datosJSON = JSON.stringify(this.datos, null, 2);
        const blob = new Blob([datosJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `progreso_procesos_industriales_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

// Crear instancia global
let sistemaProgreso;

document.addEventListener('DOMContentLoaded', () => {
    sistemaProgreso = new SistemaProgreso();
    
    // Exponer globalmente para uso en quizzes
    window.sistemaProgreso = sistemaProgreso;
    
    // Agregar botón de dashboard al header si existe
    const navbar = document.querySelector('.navbar-nav');
    if (navbar) {
        const liDashboard = document.createElement('li');
        liDashboard.className = 'nav-item';
        liDashboard.innerHTML = `
            <a class="nav-link" href="#" onclick="sistemaProgreso.mostrarDashboard(); return false;" title="Ver Dashboard de Progreso">
                <i class="fas fa-chart-line"></i>
                <span class="d-none d-lg-inline">Progreso</span>
            </a>
        `;
        navbar.appendChild(liDashboard);
    }
});

// ============================================
// INTEGRACIÓN CON QUIZZES EXISTENTES
// ============================================

/**
 * Función helper para integrar con los quizzes existentes
 * Llamar esta función al completar un quiz
 */
window.registrarQuizCompletado = function(paso, resultado) {
    if (window.sistemaProgreso) {
        return window.sistemaProgreso.registrarQuiz(paso, resultado);
    }
    return null;
};

/**
 * Obtener progreso de un paso específico
 */
window.obtenerProgresoPaso = function(paso) {
    if (window.sistemaProgreso) {
        return {
            completado: window.sistemaProgreso.estaPasoCompletado(paso),
            mejorPuntaje: window.sistemaProgreso.obtenerMejorPuntaje(paso),
            numQuizzes: window.sistemaProgreso.obtenerHistorialQuizzes(paso).length
        };
    }
    return null;
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SistemaProgreso, PROGRESO_CONFIG };
}
