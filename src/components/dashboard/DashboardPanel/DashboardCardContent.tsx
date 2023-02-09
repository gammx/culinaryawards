import React from 'react';
import cn from 'classnames';

interface DashboardCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DashboardCardContent: React.FC<DashboardCardContentProps> = ({
	className,
	...props
}) => {
	return (
		<div className={cn("mt-6 flex-1 overflow-y-auto dashboard-card-scrollbar", className)} {...props} />
	);
};

export default DashboardCardContent;
