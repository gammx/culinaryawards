import React from 'react';
import cn from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'pink';
  outlined?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'tertiary',
  outlined = false,
  disabled = false,
  onClick,
  className,
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
      className={cn('py-3 px-9 text-sm font-display font-medium uppercase flex items-center justify-center enabled:hover:opacity-80', {
        'bg-ink hover:bg-ink/80 text-void': variant === 'primary' && !outlined,
        'bg-pink text-void': variant === 'pink' && !outlined,
        'bg-transparent border border-ink text-ink': variant === 'primary' && outlined,
        'bg-blue-muted hover:bg-blue-muted/70 text-blue': variant === 'secondary',
        'bg-void-high hover:bg-void-higher/50 text-ink-secondary': variant === 'tertiary' && !outlined,
        'bg-transparent border border-[#798894] text-[#798894]': variant === 'tertiary' && outlined,
        'bg-green-muted hover:bg-green-muted/70 text-green': variant === 'success',
        'bg-[#FF3559] hover:bg-[#FF3559]/80 text-void': variant === 'danger',
        'bg-yellow-muted hover:bg-yellow-muted/70 text-yellow': variant === 'warning',
        'opacity-10 cursor-not-allowed': disabled,
      }, className)}
      {...props}
    />
  );
};

export default Button;
