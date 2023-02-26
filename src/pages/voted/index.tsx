import React from 'react';
import withAlreadyVoted from '~/hoc/withAlreadyVoted';
import Button from '~/components/UI/Button';
import { Particles } from '~/hooks/useParticles';
import { HomeOutline, ChevronLeftOutline } from '@styled-icons/evaicons-outline';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';

const Voted = () => {
	const router = useRouter();
	const [isShowingVotes, setIsShowingVotes] = React.useState(false);
	const { data: votes, isLoading: votesIsLoading } = trpc.votes.getMyVotes.useQuery();

	return (
		<div className="bg-void text-white h-screen w-full relative">
			<div className="w-full h-full flex items-center justify-center">
				<div className="flex w-[80%]">
					<div className="flex-1 z-20">
						{isShowingVotes && votes ? (
							<div className="">
								<Button
									outlined
									variant="primary"
									onClick={() => setIsShowingVotes(false)}
								>
									<ChevronLeftOutline size={18} className="mr-2" />
									Back
								</Button>
								<ul className="flex flex-col self-center space-y-2 mt-8 w-2/3">
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
							<div>
								<h1 className="font-display text-white uppercase text-9xl">Thanks For Voting</h1>
								<p className="font-light leading-tight mt-3">We've sent your votes, now it's time to <br /> wait for the final results.</p>
								<div className="flex space-x-2 mt-20">
									<Button variant="primary">
										<HomeOutline size={18} className="mr-2" />
										Go Home
									</Button>
									<Button
										outlined
										variant="primary"
										onClick={() => setIsShowingVotes(true)}
										disabled={votesIsLoading}
									>
										Check My Votes
									</Button>
								</div>
							</div>
						)}
					</div>
					<div>
						<img src="/award_circle_backwards.png" alt="" width={500} height={500} />
					</div>
				</div>
			</div>

			<Particles />
			<div className="absolute w-full h-full top-0 left-0 bg-[url('/space_spotlight.png')] bg-cover bg-center bg-no-repeat !z-0"></div>
		</div>
	);
};

export default withAlreadyVoted(Voted);