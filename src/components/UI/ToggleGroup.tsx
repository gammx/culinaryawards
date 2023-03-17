import React from 'react';
import cn from 'classnames';
import ToggleGroupItem from './ToggleGroupItem';
import ToggleGroupField from './ToggleGroupField';

interface TooggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	label?: string;
}

const ToggleGroupRoot: React.FC<TooggleGroupProps> = ({
	label,
	children,
	className,
	...props
}) => {
	return (
		<div className={cn("border border-linear-secondary flex rounded-md text-ink-secondary", className)}>
			<div className="px-2.5 py-1">{label}</div>
			{children}
		</div>
	);
};

export default {
	Root: ToggleGroupRoot,
	Item: ToggleGroupItem,
	Field: ToggleGroupField,
};
