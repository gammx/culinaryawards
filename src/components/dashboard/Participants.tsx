import { ChangeEventHandler, useState } from 'react';
import Dialog from '../UI/Dialog';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import { trpc } from '~/utils/trpc';
import { participantCreateSchema } from '~/utils/schemas/participants';
import useUploadImage from '~/utils/useUploadImage';

interface Option {
	label: string;
	value: string;
}

const Participants = () => {
	const [categoriesAsOptions, setCategoriesAsOptions] = useState<Option[]>([]);
	const { data: categories, isLoading: isCategoriesLoading } = trpc.categories.getAllCategories.useQuery(undefined, {
		onSuccess: (data) => {
			if (!data) return;
			setCategoriesAsOptions(data.map((category) => ({
				label: category.name,
				value: category.id,
			})));
		}
	});
	const allParticipants = trpc.participants.getAllParticipants.useQuery();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [participantForm, setParticipantForm] = useState({
		name: '',
		direction: '',
		thumbnail: '',
		categories: [] as string[],
		website: '',
		mapsAnchor: '',
	});
	const { validate, errors, setErrors } = useZod(participantCreateSchema);
	const { fileInputRef, uploadImage } = useUploadImage({
		onUpload: (url) => setParticipantForm(prev => ({ ...prev, thumbnail: url as string }))
	});
	const utils = trpc.useContext();
	const participantCreate = trpc.participants.addNewParticipant.useMutation({
		async onMutate(vars) {
			await utils.participants.getAllParticipants.cancel();
			const prevData = utils.participants.getAllParticipants.getData();
			utils.participants.getAllParticipants.setData(undefined,
				(old) => old && [...old, { ...vars, id: '-1', categoryIds: [] }]
			);
			setErrors({});
			setIsCreateModalOpen(false);
			clearParticipantForm();
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
		},
		onSuccess() {
			utils.participants.getAllParticipants.invalidate();
		}
	});
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

	const participantHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
		setParticipantForm((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	const createParticipant = async () => {
		const isAllowed = validate(participantForm);
		isAllowed && participantCreate.mutate(participantForm);
	};

	const deleteParticipant = async (participantId: string) => {
		participantDelete.mutate({ participantId });
	};

	const clearParticipantForm = () => {
		setParticipantForm({ name: '', direction: '', thumbnail: '', categories: [], website: '', mapsAnchor: '' });
	};

	return (
		<>
			<div>
				<h1 className="text-2xl font-semibold">Participants</h1>
				<Dialog.Root open={isCreateModalOpen} onOpenChange={isOpen => setIsCreateModalOpen(isOpen)}>
					<Dialog.Trigger className="bg-green-500 px-2 cursor-pointer uppercase">
						+ Add New
					</Dialog.Trigger>
					<Dialog.Content
						title="Add New Participant"
						description="Add a new participant"
					>
						<div className="flex flex-col space-y-4">
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="name">Name</label>
								<input
									autoFocus
									id="name"
									type="text"
									placeholder="Something crazy"
									value={participantForm.name}
									onChange={participantHandler}
								/>
								<p className="text-xs text-red-500">{errors.name}</p>
							</fieldset>
							<fieldset>
								<label htmlFor="thumbnail">Thumbnail</label>
								<input ref={fileInputRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={uploadImage} className="hidden" />
								{participantForm.thumbnail && <img src={participantForm.thumbnail} alt="thumbnail" />}
								<button
									className="bg-gray-300 px-2 py-2 rounded ml-2 text-xs uppercase"
									onClick={() => fileInputRef.current?.click()}
								>
									Upload
								</button>
								<p className="text-xs text-red-500">{errors.thumbnail}</p>
							</fieldset>
							<fieldset>
								<label htmlFor="direction">Direction</label>
								<input type="text" id="direction" placeholder="Cabo San Lucas" value={participantForm.direction} onChange={participantHandler} />
								<p className="text-xs text-red-500">{errors.direction}</p>
							</fieldset>
							<fieldset>
								<label htmlFor="website">Website URL</label>
								<input
									type="text"
									id="website"
									placeholder="https://..."
									value={participantForm.website}
									onChange={participantHandler}
								/>
							</fieldset>
							<fieldset>
								<label htmlFor="mapsAnchor">Google Maps URL</label>
								<input
									type="text"
									id="mapsAnchor"
									placeholder="https://goo.gl/maps/..."
									value={participantForm.mapsAnchor}
									onChange={participantHandler}
								/>
							</fieldset>
							<fieldset>
								<label htmlFor="categories">Categories</label>
								<Select
									id="categories"
									isLoading={isCategoriesLoading}
									options={categoriesAsOptions}
									onChange={(values) => setParticipantForm(prev => ({ ...prev, categories: values.map(e => e.value) }))}
									isMulti
									isSearchable
								/>
								<p className="text-xs text-red-500">{errors.categories}</p>
							</fieldset>
						</div>
						<Dialog.Actions>
							<button
								className="bg-green-500 px-2 py-2 rounded mr-2 text-xs uppercase"
								onClick={createParticipant}
							>
								Add
							</button>
						</Dialog.Actions>
					</Dialog.Content>
				</Dialog.Root>
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
