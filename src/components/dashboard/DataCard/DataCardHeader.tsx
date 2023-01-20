import React from 'react';
import { ArrowBackOutline } from '@styled-icons/evaicons-outline';
import cn from 'classnames';

interface DataCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** The title of the data card */
	title: string;
	/** Callback function for a back button */
	onBack?: () => void;
}

const DataCardHeader: React.FC<DataCardHeaderProps> = ({
	title,
	onBack,
	children,
}) => {
	return (
		<div className="top-0 sticky flex justify-between items-center mb-4 px-8">
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
			{children}
		</div>
	);
};

export default DataCardHeader;
