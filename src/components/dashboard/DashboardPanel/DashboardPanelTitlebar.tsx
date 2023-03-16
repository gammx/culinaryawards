import React from 'react';
import cn from 'classnames';
import { ArrowBackOutline } from '@styled-icons/evaicons-outline';

interface DashboardPanelTitlebarProps extends React.HTMLAttributes<HTMLDivElement> {
	/** The heading title of the dashboard card */
	title: string;
	/** Callback function for a back button */
	onBack?: () => void;
}

const DashboardPanelTitlebar: React.FC<DashboardPanelTitlebarProps> = ({
	className,
	children,
	onBack,
	title,
	...props
}) => {
	return (
		<div className={cn("flex justify-between mb-4", className)} {...props}>
			<div className="flex space-x-6 items-center">
				{onBack && (
					<div
						role="button"
						className="border border-linear-secondary text-ink-secondary rounded-lg w-6 h-6 flex items-center justify-center hover:border-linear hover:text-ink transition-all duration-100"
						onClick={onBack}
					>
						<ArrowBackOutline size={18} />
					</div>
				)}
				<h1 className="font-display text-2xl text-ink">{title}</h1>
			</div>
			<div className="flex space-x-2">
				{children}
			</div>
		</div>
	);
};

export default DashboardPanelTitlebar;
