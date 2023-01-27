import React from 'react';
import cn from 'classnames';
import { StyledIcon } from '@styled-icons/styled-icon';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: StyledIcon;
}

const IconButton: React.FC<IconButtonProps> = ({
  className,
  icon,
  children,
  ...props
}) => {
  const Icon = icon;

  return (
    <button
      className={cn("rounded-lg w-6 h-6 flex items-center justify-center transition-all duration-150 bg-transparent border border-white/50 hover:bg-white/80", className)}
      {...props}
    >
      {<Icon size={18} />}
    </button>
  );
};

export default IconButton;
