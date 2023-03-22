import React from 'react';
import cn from 'classnames';

interface DashboardCardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	outlined?: boolean;
	disabled?: boolean;
}

const DashboardCardInput: React.FC<DashboardCardInputProps> = ({
	className,
	outlined,
	disabled,
	...props
}) => {

	return (
		<input
			spellCheck={false}
			disabled={disabled}
			className={cn("bg-transparent rounded-md border border-linear-tertiary outline-linear-tertiary focus:outline focus:outline-offset-2 focus:outline-linear-tertiary/30 w-full h-8 px-5 py-3 text-sm transition-all duration-150 selection:bg-ink selection:text-black placeholder:text-ink-muted text-ink-secondary", className, {
				"bg-void-high/50": !outlined,
				"opacity-30": disabled,
			})}
			{...props}
		/>
	);
};

export default DashboardCardInput;
