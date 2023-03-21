import React from 'react';
import useViews from '~/utils/useViews';
import { ChevronLeftOutline } from '@styled-icons/evaicons-outline';
import FieldLabel from './UI/FieldLabel';
import DashboardCardInput from './dashboard/DashboardPanel/DashboardCardInput';
import Button from './UI/Button';

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> { }

const VotesCard: React.FC<DashboardCardProps> = () => {
	const views = useViews("overview");

	return (
		<div className="w-full h-full">
			<div className="h-full rounded-xl relative overflow-hidden p-px">
				<div className="absolute top-0 left-0 w-full h-full votes-card-iridescent opacity-100"></div>
				<div className="w-full h-full flex flex-col bg-void/90 backdrop-blur-2xl rounded-xl">
					<div className="p-8 pb-6 border-b border-linear">
						<div className="flex items-center space-x-4">
							{views.current === "overview" ? (
								<>
									<div className="w-3 h-3 bg-ink"></div>
									<h1 className="font-display text-lg text-ink">Votes</h1>
								</>
							) : (
								<>
									<ChevronLeftOutline role="button" size={24} className="fill-ink-secondary hover:fill-ink" onClick={views.goBack} />
									<h1 className="font-display text-lg text-ink">{views.current === "preview" ? "The Winners" : "Edit Goal"}</h1>
								</>
							)}
						</div>
					</div>

					{views.current === "overview" && (
						<>
							<div className="p-8 pt-5 border-b border-linear">
								<p className="text-6xl text-ink mb-6">12,200</p>
								<div className="border border-linear-tertiary w-full h-6"></div>
							</div>

							<div className="flex-1 grid grid-cols-2">
								<div 
									className="flex items-center justify-center text-ink-secondary uppercase border-r border-linear hover:underline select-none cursor-pointer"
									onClick={() => views.go("edit_goal")}
								>
									<p>Edit Goal</p>
								</div>
								<div className="flex items-center justify-center text-ink-secondary uppercase hover:underline select-none cursor-pointer" onClick={() => views.go("preview")}>
									<p>Preview</p>
								</div>
							</div>
						</>
					)}

					{views.current === "preview" && (
						<ul className="flex flex-col space-y-2.5 px-5 py-4 overflow-y-auto dashboard-card-scrollbar">
							<li className="flex items-center space-x-2">
								<p className="text-ink-secondary uppercase">Pepe Problemas</p>
								<div className="p-px text-black text-xs bg-pastel-pink">Best Restaurant</div>
							</li>
							<li className="flex items-center space-x-2">
								<p className="text-ink-secondary uppercase">The Ballas</p>
								<div className="p-px text-black text-xs bg-pastel-purple">Best Experience</div>
							</li>
							<li className="flex items-center space-x-2">
								<p className="text-ink-secondary uppercase">Halcones</p>
								<div className="p-px text-black text-xs bg-pastel-blue">Best Game</div>
							</li>
						</ul>
					)}

					{views.current === "edit_goal" && (
						<div className="px-8 py-4">
							<FieldLabel>Total Expected Votes</FieldLabel>
							<DashboardCardInput placeholder="Eg: 12,200" className="mt-4 mb-5" />
							<Button variant="primary">Save</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default VotesCard;
