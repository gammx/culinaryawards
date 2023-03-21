import React from 'react';

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const VotesCard: React.FC<DashboardCardProps> = () => {
	return (
		<div className="w-full h-full">
			<div className="h-full max-w-md rounded-xl relative overflow-hidden p-px">
				<div className="absolute top-0 left-0 w-full h-full votes-card-iridescent opacity-100"></div>
				<div className="w-full h-full flex flex-col bg-void/90 backdrop-blur-2xl rounded-xl">
					<div className="p-8 pb-6 border-b border-linear">
						<div className="flex items-center space-x-4">
							<div className="w-3 h-3 bg-ink"></div>
							<h1 className="font-display text-lg text-ink">Votes</h1>
						</div>
					</div>

					<div className="p-8 pt-5 border-b border-linear">
						<p className="text-6xl text-ink mb-6">12,200</p>
						<div className="border border-linear-tertiary w-full h-6"></div>
					</div>

					<div className="flex-1 grid grid-cols-2">
						<div className="flex items-center justify-center text-ink-secondary uppercase border-r border-linear hover:underline select-none cursor-pointer">
							<p>Edit Goal</p>
						</div>
						<div className="flex items-center justify-center text-ink-secondary uppercase hover:underline select-none cursor-pointer">
							<p>Preview</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VotesCard;
