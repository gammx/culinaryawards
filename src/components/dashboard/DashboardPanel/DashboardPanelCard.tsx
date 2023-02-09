import React from 'react';
import cn from 'classnames';

const DashboardPanelCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	...props
}) => {
	return (
		<div className={cn("w-full h-full pt-11 px-9 pb-9 rounded-[30px] border border-linear/30 flex flex-col", className)} {...props} />
	);
};

export default DashboardPanelCard;
