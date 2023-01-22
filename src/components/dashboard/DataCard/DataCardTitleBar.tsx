import React from 'react';
import { ArrowBackOutline } from '@styled-icons/evaicons-outline';

interface DataCardTitleBarProps extends React.HTMLAttributes<HTMLDivElement> {
	/** The title of the data card */
	title: string;
	/** Callback function for a back button */
	onBack?: () => void;
}

const DataCardTitleBar: React.FC<DataCardTitleBarProps> = ({ title, onBack, children, ...props }) => {
	return (
		<div className="top-0 sticky flex justify-between items-center px-8">
			<div className="flex items-center space-x-5">
				{onBack && (
					<div
						role="button"
						className="border border-white/50 rounded-lg w-6 h-6 flex items-center justify-center hover:border-white"
						onClick={onBack}
					>
						<ArrowBackOutline size={18} />
					</div>
				)}
				<h1 className="font-medium text-2xl">{title}</h1>
			</div>
			<div className="flex space-x-2">
				{children}
			</div>
		</div>
	);
};

export default DataCardTitleBar;
