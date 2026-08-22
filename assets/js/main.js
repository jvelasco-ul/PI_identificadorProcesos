/**
 * PROCESOS INDUSTRIALES - LÓGICA INTERACTIVA
 * Plataforma educativa elite - 2026-2
 */

// ============================================
// UTILIDADES GENERALES
// ============================================

/**
 * Animación de números contadores
 */
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

/**
 * Inicializar contadores cuando sean visibles
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.textContent);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// NAVEGACIÓN Y MENÚ
// ============================================

/**
 * Menú sticky con cambio de estilo al hacer scroll
 */
function initStickyNav() {
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(26, 26, 26, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'linear-gradient(135deg, var(--negro) 0%, #2C2C2C 100%)';
            header.style.backdropFilter = 'none';
        }
    });
}

/**
 * Smooth scroll para enlaces internos
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ============================================
// QUIZ SYSTEM - SISTEMA DE EVALUACIÓN
// ============================================

/**
 * Clase para manejar quizzes interactivos
 */
class QuizSystem {
    constructor(questions) {
        this.allQuestions = questions;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
    }
    
    /**
     * Seleccionar 3 preguntas aleatorias del banco
     */
    loadRandomQuestions() {
        // Mezclar array y tomar primeras 3
        const shuffled = [...this.allQuestions].sort(() => 0.5 - Math.random());
        this.currentQuestions = shuffled.slice(0, 3);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        
        return this.currentQuestions;
    }
    
    /**
     * Verificar respuesta
     */
    checkAnswer(selectedIndex, correctIndex) {
        const isCorrect = selectedIndex === correctIndex;
        
        this.userAnswers.push({
            questionIndex: this.currentQuestionIndex,
            selected: selectedIndex,
            correct: correctIndex,
            isCorrect: isCorrect
        });
        
        if (isCorrect) {
            this.score++;
        }
        
        return isCorrect;
    }
    
    /**
     * Avanzar a siguiente pregunta
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        return this.currentQuestionIndex < this.currentQuestions.length;
    }
    
    /**
     * Obtener resultados finales
     */
    getResults() {
        return {
            score: this.score,
            total: this.currentQuestions.length,
            percentage: (this.score / this.currentQuestions.length) * 100,
            answers: this.userAnswers
        };
    }
    
    /**
     * Reiniciar quiz
     */
    reset() {
        this.loadRandomQuestions();
    }
}

// ============================================
// DIAGRAMAS INTERACTIVOS - CHART.JS
// ============================================

/**
 * Crear diagrama de flujo de proceso
 */
function createProcessFlowDiagram(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Flujo (kg/h)',
                data: data.values,
                backgroundColor: [
                    'rgba(255, 107, 0, 0.8)',
                    'rgba(26, 26, 26, 0.8)',
                    'rgba(192, 192, 192, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 107, 0, 1)',
                    'rgba(26, 26, 26, 1)',
                    'rgba(192, 192, 192, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Caudal (kg/h)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            return `Impacto: ${data.impact[context.dataIndex]}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Crear diagrama psicrométrico simplificado
 */
function createPsychrometricChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Datos de ejemplo para proceso de humidificación
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['0°C', '5°C', '10°C', '15°C', '20°C', '25°C', '30°C'],
            datasets: [
                {
                    label: 'HR 100%',
                    data: [0.004, 0.005, 0.008, 0.011, 0.015, 0.020, 0.027],
                    borderColor: 'rgba(255, 107, 0, 1)',
                    backgroundColor: 'rgba(255, 107, 0, 0.1)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'HR 50%',
                    data: [0.002, 0.0025, 0.004, 0.0055, 0.0075, 0.010, 0.0135],
                    borderColor: 'rgba(26, 26, 26, 1)',
                    backgroundColor: 'rgba(26, 26, 26, 0.1)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Humedad Absoluta (kg H₂O/kg AS)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            }
        }
    });
}

// ============================================
// SIMULADOR DE BALANCES
// ============================================

/**
 * Calculadora de balance de materia interactivo
 */
class MaterialBalanceCalculator {
    constructor() {
        this.inputs = {};
        this.results = {};
    }
    
    /**
     * Calcular balance para evaporador
     */
    calculateEvaporator(feedRate, feedConcentration, productConcentration) {
        // Balance de soluto (no volátil)
        const soluteIn = feedRate * feedConcentration;
        
        // Balance global: F = V + P
        // Balance de soluto: F*xF = P*xP
        const productRate = soluteIn / productConcentration;
        const vaporRate = feedRate - productRate;
        
        // Economía de vapor
        const vaporEconomy = vaporRate / (feedRate * 0.1); // Aproximado
        
        return {
            feedRate: feedRate,
            vaporRate: vaporRate.toFixed(2),
            productRate: productRate.toFixed(2),
            vaporEconomy: vaporEconomy.toFixed(2)
        };
    }
    
    /**
     * Calcular balance para secador
     */
    calculateDryer(solidFeedRate, initialMoisture, finalMoisture, basis = 'wet') {
        let X1, X2;
        
        if (basis === 'wet') {
            // Convertir a base seca
            X1 = initialMoisture / (1 - initialMoisture);
            X2 = finalMoisture / (1 - finalMoisture);
        } else {
            X1 = initialMoisture;
            X2 = finalMoisture;
        }
        
        const drySolidRate = solidFeedRate * (1 - initialMoisture);
        const waterRemoved = drySolidRate * (X1 - X2);
        
        return {
            drySolidRate: drySolidRate.toFixed(2),
            waterRemoved: waterRemoved.toFixed(2),
            productRate: (drySolidRate * (1 + X2)).toFixed(2)
        };
    }
}

// ============================================
// MAPA MENTAL INTERACTIVO
// ============================================

/**
 * Crear árbol de decisiones expandible
 */
function initMindMap() {
    const toggles = document.querySelectorAll('.mindmap-node-toggle');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const children = this.nextElementSibling;
            const icon = this.querySelector('.toggle-icon');
            
            if (children && children.classList.contains('mindmap-children')) {
                children.classList.toggle('collapsed');
                icon.textContent = children.classList.contains('collapsed') ? '+' : '−';
            }
        });
    });
}

// ============================================
// ACCESIBILIDAD
// ============================================

/**
 * Navegación por teclado mejorada
 */
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Escape para cerrar modales
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) modalInstance.hide();
            });
        }
        
        // Atajos de teclado
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    document.querySelector('a[href="index.html"]')?.click();
                    break;
                case '2':
                    e.preventDefault();
                    document.querySelector('a[href="protocol/guia-identificacion.html"]')?.click();
                    break;
            }
        }
    });
}

/**
 * Anunciar cambios a screen readers
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializar toda la plataforma
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes
    initCounters();
    initStickyNav();
    initSmoothScroll();
    initKeyboardNavigation();
    initMindMap();
    
    // Agregar clase 'loaded' al body para animaciones
    document.body.classList.add('loaded');
    
    // Verificar modo alto contraste del sistema
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
    
    // Verificar preferencia de movimiento reducido
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
    }
    
    console.log('%c PROCESOS INDUSTRIALES', 'font-size: 20px; font-weight: bold; color: #FF6B00;');
    console.log('%cPlataforma educativa elite - 2026-2', 'font-size: 12px; color: #C0C0C0;');
    console.log('%cDomina la Energía, Transforma el Futuro', 'font-size: 14px; color: #FF6B00; font-style: italic;');
});

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================

window.ProcesosIndustriales = {
    QuizSystem,
    MaterialBalanceCalculator,
    createProcessFlowDiagram,
    createPsychrometricChart,
    animateCounter,
    announceToScreenReader
};
