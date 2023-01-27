import { StyledIcon } from '@styled-icons/styled-icon';
import React from 'react';
import cn from 'classnames';

interface HighlightedIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The icon to be highlighted */
  icon: StyledIcon;
  variant?: 'blue' | 'neutral' | 'yellow' | 'pink' | 'red' | 'green';
}

const HighlightedIcon: React.FC<HighlightedIconProps> = ({
  icon: Icon,
  variant = 'neutral',
  className,
  ...props
}) => {
  return (
    <div
      className={cn("rounded-lg flex items-center justify-center w-6 h-6 mr-8", className, {
        'bg-blue-muted': variant === 'blue',
        'bg-white/50': variant === 'neutral',
        'bg-yellow-muted': variant === 'yellow',
        'bg-pink-muted': variant === 'pink',
        'bg-red-muted': variant === 'red',
        'bg-green-muted': variant === 'green',
      })}
      {...props}
    >
      <Icon
        size={18}
        className={cn({
          'text-blue': variant === 'blue',
          'text-black': variant === 'neutral',
          'text-yellow': variant === 'yellow',
          'text-pink': variant === 'pink',
          'text-red': variant === 'red',
          'text-green': variant === 'green',
        })}
      />
    </div>
  );
};

export default HighlightedIcon;
