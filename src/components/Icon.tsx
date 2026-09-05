// Nudges ópticos: centrar el glifo por su tinta, no por su caja em.
// Sin esto, varios íconos de Material Symbols Rounded se ven corridos
// dentro de su disco cuando el centrado es por flex/grid puro.
const NUDGE: Record<string, string> = {
  local_cafe: 'translateX(-.5px)',
  menu_book: 'translateY(.5px)',
  emoji_events: 'translateY(.5px)',
  map: 'translateY(.5px)',
  bookmark: 'translateY(-.5px)',
  auto_stories: 'translateY(.5px)',
  account_tree: 'translateY(0)',
  download: 'translateY(.5px)',
  drag_indicator: 'translateY(0)',
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color, className }) => (
  <span
    className={`material-symbols-rounded${className ? ` ${className}` : ''}`}
    style={{ fontSize: size, color, transform: NUDGE[name] || 'none' }}
  >
    {name}
  </span>
);
