import React from 'react';
import cn from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning';
	disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
	variant = 'tertiary',
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
			className={cn('py-1.5 px-4 text-sm font-bold rounded-md uppercase tracking-wider', {
				'bg-blue-muted hover:bg-blue-muted/70 text-blue': variant === 'secondary',
				'bg-white/30 hover:bg-white/40 text-gray-500': variant === 'tertiary',
				'bg-green-muted hover:bg-green-muted/70 text-green': variant === 'success',
				'bg-red-muted hover:bg-red-muted/70 text-red': variant === 'danger',
				'bg-yellow-muted hover:bg-yellow-muted/70 text-yellow': variant === 'warning',
			})}
			{...props}
		/>
	);
};

export default Button;
