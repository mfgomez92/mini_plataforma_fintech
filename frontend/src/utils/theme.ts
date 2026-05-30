/**
 * Diseño Visual y Movimientos Estilo Fintech - Belo Design System
 * 
 * DESIGN_VARIANCE: Define los límites de variación en la apariencia (radios de bordes amplios,
 * fondos con glassmorfismo, bordes translúcidos y brillos sutiles).
 * 
 * MOTION_INTENSITY: Define la intensidad, duraciones y curvas para micro-animaciones
 * (efectos hover, escalado activo en botones y aceleración de cargadores).
 */

export const DESIGN_VARIANCE = {
  // Bordes amplios y redondeados característicos de interfaces fintech modernas
  borderRadius: {
    card: 'rounded-2xl md:rounded-[24px]',
    button: 'rounded-full',
    input: 'rounded-xl md:rounded-2xl',
  },
  
  // Glassmorphism premium con soporte de blur de fondo y colores translúcidos
  glassmorphism: {
    card: 'bg-belo-dark-surface/70 backdrop-blur-xl border border-white/[0.06] shadow-xl shadow-black/20',
    header: 'bg-belo-dark-base/80 backdrop-blur-md border-b border-belo-dark-border/50',
    sidebar: 'bg-belo-dark-surface/40 backdrop-blur-md border-r border-belo-dark-border/30',
  },

  // Degradados de acento vibrantes
  gradients: {
    primary: 'bg-gradient-to-r from-belo-green to-[#00d696] hover:from-[#00ffd0] hover:to-[#00b37e]',
  },

  // Variaciones de sombras y brillos fintech
  glow: {
    pendiente: 'shadow-[0_0_15px_rgba(255,178,0,0.15)] border-belo-semantic-warning/30',
    rechazada: 'shadow-[0_0_15px_rgba(255,59,48,0.12)] border-belo-semantic-error/30',
  }
};

export const MOTION_INTENSITY = {
  // Transiciones y timigs globales fluidos
  transition: 'transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)',
  
  // Micro-animación de hover (escala ligera y traslación) para elementos interactivos
  hover: 'hover:scale-[1.015] hover:-translate-y-[2px]',
  hoverSecondary: 'hover:bg-belo-dark-surface/80 hover:text-white',

  // Escalado de click instantáneo para retroalimentación táctil de alta fidelidad
  active: 'active:scale-[0.97] active:duration-75',

  // Spinner rápido e interactivo
  spinner: 'animate-[spin_0.8s_linear_infinite]',

  // Animaciones de entrada de pantalla
  animateIn: 'animate-in fade-in zoom-in-95 duration-200 ease-out'
};
