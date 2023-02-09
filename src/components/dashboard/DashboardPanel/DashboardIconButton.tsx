import { StyledIcon } from '@styled-icons/styled-icon';
import React from 'react';
import cn from 'classnames';

interface DashboardIconButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	icon: StyledIcon;
}

const DashboardIconButton: React.FC<DashboardIconButtonProps> = ({
	icon: Icon,
	className,
	...props
}) => {
	return (
		<button
			className={cn("flex items-center justify-center w-6 h-6 border border-linear rounded-md shadow-xl shadow-linear cursor-pointer hover:opacity-80", className)}
			{...props}
		>
			<Icon className="text-bone" size={16} />
		</button>
	);
};

export default DashboardIconButton;
