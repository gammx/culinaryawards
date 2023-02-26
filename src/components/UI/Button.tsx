import React from 'react';
import cn from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning';
  outlined?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'tertiary',
  outlined = false,
  disabled = false,
  onClick,
  ...props
}) => {

  const onClickHandler: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick && onClick(e);
  };

  return (
    <button
      onClick={onClickHandler}
      disabled={disabled}
      className={cn('py-3 px-9 text-sm font-display font-medium uppercase flex items-center', {
        'bg-white hover:bg-white/80 text-void': variant === 'primary' && !outlined,
        'bg-transparent border border-white text-white enabled:hover:opacity-80': variant === 'primary' && outlined,
        'bg-blue-muted hover:bg-blue-muted/70 text-blue': variant === 'secondary',
        'bg-[#060E11] hover:bg-[#060E11]/80 text-[#798894]': variant === 'tertiary',
        'bg-green-muted hover:bg-green-muted/70 text-green': variant === 'success',
        'bg-[#FF001F] hover:bg-[#FF001F]/80 text-bone': variant === 'danger',
        'bg-yellow-muted hover:bg-yellow-muted/70 text-yellow': variant === 'warning',
        'opacity-50 cursor-not-allowed': disabled,
      })}
      {...props}
    />
  );
};

export default Button;
