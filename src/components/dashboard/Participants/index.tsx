import { useState } from 'react';
import { trpc } from '~/utils/trpc';
import ParticipantForm, { ParticipantFormMode } from './ParticipantForm';

const Participants = () => {
	const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
	const [participantFormMode, setParticipantFormMode] = useState<ParticipantFormMode>('create');
	const allParticipants = trpc.participants.getAllParticipants.useQuery();
	const utils = trpc.useContext();
	const participantDelete = trpc.participants.deleteParticipant.useMutation({
		async onMutate(dto) {
			await utils.participants.getAllParticipants.cancel();
			const prevData = utils.participants.getAllParticipants.getData();
			utils.participants.getAllParticipants.setData(undefined,
				(old) => old && old.filter((participant) => participant.id !== dto.participantId)
			);
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.participants.getAllParticipants.invalidate();
		}
	});

	const deleteParticipant = async (participantId: string) => {
		participantDelete.mutate({ participantId });
	};

	return (
		<>
			<div>
				<h1 className="text-2xl font-semibold">Participants</h1>
				<button className="bg-green-500 px-2 cursor-pointer uppercase" onClick={() => {
					setParticipantFormMode('create');
					setIsParticipantModalOpen(true);
				}}>+ Add New</button>
				<ParticipantForm mode={participantFormMode} state={[isParticipantModalOpen, setIsParticipantModalOpen]} />
			</div>
			<ul>
				{allParticipants.data && allParticipants.data.length > 0
					? allParticipants.data?.map((participant) => (
						<li key={participant.id}>
							<img src={participant.thumbnail} width={16} className="inline" />
							<span>{participant.name}</span>
							<button
								className="bg-red-500 px-2 cursor-pointer"
								onClick={() => deleteParticipant(participant.id)}
							>x</button>
						</li>
					))
					: allParticipants.isLoading ? <p>Loading...</p>
					: <p>No participants found</p>
				}
			</ul>
		</>
	);
};

export default Participants;
