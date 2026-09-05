interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color, className }) => (
  <span
    className={`material-symbols-rounded${className ? ` ${className}` : ''}`}
    style={{ fontSize: size, color }}
  >
    {name}
  </span>
);
