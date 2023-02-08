import React from 'react';
import withAlreadyVoted from '~/hoc/withAlreadyVoted';
import cn from 'classnames';
import { HomeOutline, ChevronLeftOutline } from '@styled-icons/evaicons-outline';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';

const Voted = () => {
	const router = useRouter();
	const [isShowingVotes, setIsShowingVotes] = React.useState(false);
	const { data: votes, isLoading: votesIsLoading } = trpc.votes.getMyVotes.useQuery();

	return (
		<>
			{isShowingVotes && votes ? (
				<div className="w-full h-screen flex flex-col space-y-12 p-6 bg-bone text-black">
					<div>
						<button
							className="text-black border border-black font-display font-bold uppercase inline-flex items-center p-3 transition-opacity duration-300 cursor-pointer hover:opacity-90"
							onClick={() => setIsShowingVotes(false)}
						>
							<ChevronLeftOutline size={24} className="mr-2" />
							Back
						</button>
					</div>
					<ul className="flex flex-col self-center space-y-2 w-1/3">
						{votes.map((vote) => (
							<li key={vote.id} className="flex items-center justify-between tracking-wider uppercase text-sm">
								<div className="flex space-x-2 items-center">
									<span>You voted for</span>
									<img src={vote.participant.thumbnail} alt={`${vote.participant.name} (Thumbnail)`} className="rounded-full w-4 h-4 object-cover" />
									<b>{vote.participant.name}</b>
								</div>
								<span>{vote.category.name}</span>
							</li>
						))}
					</ul>
				</div>
			) : (
				<div className="w-full h-screen bg-bone text-black">
					<div className="grid grid-rows-2 w-full h-full bg-[url('/voted_figure.png')] bg-cover bg-bottom bg-no-repeat">
						<div className="h-full flex items-end space-x-4 justify-center pb-16">
							<button className="bg-black text-bone font-display font-bold uppercase inline-flex items-center p-3 transition-opacity duration-300 cursor-pointer hover:opacity-90">
								<HomeOutline size={24} className="mr-2" />
								Go Home
							</button>
							<button
								className={cn("bg-white font-display font-bold uppercase inline-flex items-center p-3 transition-opacity duration-300 cursor-pointer hover:opacity-90", {
									"opacity-30 cursor-not-allowed": votesIsLoading
								})}
								onClick={() => setIsShowingVotes(true)}
							>
								Check My Votes
							</button>
						</div>
						<div className="h-full w-full flex items-end font-display p-16">
							<div>
								<h1 className="font-medium text-5xl mb-10">Thank You.</h1>
								<p>We've sent your votes, now it's time to wait for the final results.</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default withAlreadyVoted(Voted);