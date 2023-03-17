import React from 'react';
import cn from 'classnames';

interface ToggleGroupFieldProps extends React.HTMLAttributes<HTMLDivElement> {
	label: string;
}

const ToggleGroupField: React.FC<ToggleGroupFieldProps> = ({
	label,
	className,
	children,
	...props
}) => {
	return (
		<div className={cn("mt-2.5 flex space-x-3 items-center text-sm text-ink-tertiary", className)} {...props}>
			<p>{label}</p>
			<div className="flex flex-1 space-x-2">
				{children}
			</div>
		</div>
	);
};

export default ToggleGroupField;
