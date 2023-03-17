import React from 'react';
import cn from 'classnames';
import { StyledIcon } from '@styled-icons/styled-icon';

interface ToggleGroupItemProps extends React.HTMLAttributes<HTMLDivElement> {
	isActive?: boolean;
	tooltip?: string;
	icon: StyledIcon;
}

const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
	isActive,
	icon: Icon,
	tooltip,
	children,
	className,
	...props
}) => {
	return (
		<div
			className={cn("border-l border-linear-tertiary flex items-center justify-center px-1", className, {
				"bg-linear-tertiary text-ink": isActive,
				"hover:bg-linear-secondary/20 hover:text-ink": !isActive,
			})}
			role="button"
			data-tooltip-id="dashboard-ttip"
			data-tooltip-content={tooltip}
			{...props}
		>
			<Icon size={20} />
		</div>
	);
};

export default ToggleGroupItem;
