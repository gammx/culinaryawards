import React from 'react';
import { trpc } from '~/utils/trpc';

const Participants = () => {
	const allParticipants = trpc.participants.getAllParticipants.useQuery();
	return (
		<>
			<div>
				<h1 className="text-2xl font-semibold">Participants</h1>
			</div>
			<ul>
				{allParticipants.data && allParticipants.data.length > 0
					? allParticipants.data?.map((participant) => (
						<li key={participant.id}>{participant.name}</li>
					))
					: allParticipants.isLoading ? <p>Loading...</p>
					: <p>No participants found</p>
				}
			</ul>
		</>
	);
};

export default Participants;
