import React from 'react';
import cn from 'classnames';

interface FieldLabelProps extends React.HTMLAttributes<HTMLLabelElement> {}

const FieldLabel: React.FC<FieldLabelProps> = ({
	className,
	...props
}) => {
	return (
		<label className={cn("font-display text-ink-tertiary text-bold tracking-widest text-[11px] uppercase", className)} {...props} />
	);
};

export default FieldLabel;
