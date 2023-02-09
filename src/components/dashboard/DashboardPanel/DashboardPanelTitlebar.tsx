import React from 'react';
import cn from 'classnames';

interface DashboardPanelTitlebarProps extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
}

const DashboardPanelTitlebar: React.FC<DashboardPanelTitlebarProps> = ({
	className,
	children,
	title,
	...props
}) => {
	return (
		<div className={cn("flex justify-between", className)} {...props}>
			<h1 className="font-display text-2xl text-bone">{title}</h1>
			<div>
				{children}
			</div>
		</div>
	);
};

export default DashboardPanelTitlebar;
