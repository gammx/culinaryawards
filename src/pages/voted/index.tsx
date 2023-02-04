import React from 'react';
import { HomeOutline } from '@styled-icons/evaicons-outline';

const Voted = () => {
	return (
		<div className="w-full h-screen bg-bone text-black">
			<div className="grid grid-rows-2 w-full h-full bg-[url('/voted_figure.png')] bg-cover bg-bottom bg-no-repeat">
				<div className="h-full flex items-end space-x-4 justify-center pb-16">
					<div className="bg-black text-bone font-display font-bold uppercase inline-flex items-center p-3 transition-opacity duration-300 cursor-pointer hover:opacity-90">
						<HomeOutline size={18} className="mr-2" />
						Go Home
					</div>
					<div className="bg-white font-display font-bold uppercase inline-flex items-center p-3 transition-opacity duration-300 cursor-pointer hover:opacity-90">
						Check My Votes
					</div>
				</div>
				<div className="h-full w-full flex items-end font-display p-16">
					<div>
						<h1 className="font-medium text-5xl mb-10">Thank You.</h1>
						<p>We've sent your votes, now it's time to wait for the final results.</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Voted;
