import React, { useState } from 'react';
import { ChevronLeftOutline, LoaderOutline } from '@styled-icons/evaicons-outline';
import { trpc } from '~/utils/trpc';
import useViews from '~/utils/useViews';
import FieldLabel from './UI/FieldLabel';
import DashboardCardInput from './dashboard/DashboardPanel/DashboardCardInput';
import Button from './UI/Button';
import * as Progress from '@radix-ui/react-progress';

const numberFormat = new Intl.NumberFormat("en-US");

const VotesCard = () => {
	const views = useViews("overview");
	const utils = trpc.useContext();
	const { data: totalVoteCount } = trpc.votes.getTotalVoteCount.useQuery(undefined, {
		enabled: views.current === "overview",
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchInterval: 1000 * 60 * 5, // 5 minutes
		onSuccess: (data) => setGoalProgress(100 / (settings?.voteGoal ?? 0) * (data))
	});
	const [goalProgress, setGoalProgress] = useState(0);
	const { data: settings } = trpc.awards.getSettings.useQuery(undefined, {
		onSuccess(data) {
			setGoalProgress(100 / (data?.voteGoal ?? 0) * (totalVoteCount ?? 0));
			setNewVoteGoal(data?.voteGoal?.toString() ?? '');
		},
	});
	const { mutate: setVoteGoal, isLoading: isSettingGoal } = trpc.awards.setVoteGoal.useMutation({
		onMutate: async ({ voteGoal }) => {
			await utils.awards.getSettings.cancel();
			const prevSettings = utils.awards.getSettings.getData();
			utils.awards.getSettings.setData(undefined, (prev => ({ ...prev, voteGoal })));
			views.goBack();
			return { prevSettings };
		},
		onError: (err, vars, ctx) => {
			ctx && utils.awards.getSettings.setData(undefined, ctx.prevSettings);
		},
		onSuccess: ({ voteGoal }) => setNewVoteGoal(voteGoal?.toString() ?? '')
	});
	const { data: categoryPredictions, isLoading: isCategoryPredictionsLoading } = trpc.categories.getCategoryPredictions.useQuery(undefined, {
		enabled: views.current === "preview",
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchInterval: 1000 * 60 * 5, // 5 minutes
	});
	const [newVoteGoal, setNewVoteGoal] = React.useState(settings?.voteGoal?.toString() ?? '');

	const getRandomPastelColor = () => {
		const colors = ["pink", "green", "blue", "purple", "red", "yellow"];
		const color = colors[Math.floor(Math.random() * colors.length)];
		return `rgb(var(--pastel-${color}))`;
	};

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
								<div className="flex items-center space-x-2.5">
									<p className="text-6xl text-ink mb-6">{totalVoteCount ? numberFormat.format(totalVoteCount) : '0'}</p>
									{settings && settings.voteGoal && <p className="text-ink-tertiary">/ {numberFormat.format(settings.voteGoal)}</p>}
								</div>
								<Progress.Root value={goalProgress} className="border border-linear-tertiary w-full h-6 overflow-hidden" style={{ transition: 'translateZ(0)' }}>
									<Progress.Indicator
										className="bg-ink w-full h-full transition-all duration-500"
										style={{ transform: `translateX(-${100 - goalProgress}%)` }}
									/>
								</Progress.Root>
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
							{isCategoryPredictionsLoading && (
								<li className="flex flex-col space-y-2.5 items-center text-sm mt-6 mb-6 text-ink-tertiary">
									<LoaderOutline size={20} className="animate-spin" />
									<p>Getting Predictions</p>
								</li>
							)}
							{categoryPredictions && categoryPredictions.map((categoryPrediction) => (
								<li className="flex items-center space-x-2" key={categoryPrediction.category.id}>
									<p className="text-ink-secondary uppercase">{categoryPrediction.prediction.name}</p>
									<div className="p-px text-black text-xs" style={{ backgroundColor: getRandomPastelColor() }}>{categoryPrediction.category.name}</div>
								</li>
							))}
						</ul>
					)}

					{settings && views.current === "edit_goal" && (
						<form className="px-8 py-4" onSubmit={(e) => {
							e.preventDefault();
							setVoteGoal({ voteGoal: Number.parseInt(newVoteGoal) });
						}}>
							<FieldLabel htmlFor="expected_votes">Total Expected Votes</FieldLabel>
							<DashboardCardInput
								id="expected_votes"
								placeholder="Eg: 5000"
								className="mt-4 mb-5"
								disabled={isSettingGoal}
								value={newVoteGoal}
								onChange={e => setNewVoteGoal(e.target.value)}
							/>
							<Button disabled={isSettingGoal} variant="primary" type="submit">Save</Button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
};

export default VotesCard;
