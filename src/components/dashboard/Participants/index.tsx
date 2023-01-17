import { ChangeEventHandler, useState } from 'react';
import { participantCreateSchema } from '~/utils/schemas/participants';
import { Participant } from '@prisma/client';
import { trpc } from '~/utils/trpc';
import Dialog from '~/components/UI/Dialog';
import Modal from '~/components/UI/Modal';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import useUploadImage from '~/utils/useUploadImage';

interface Option {
	label: string;
	value: string;
}

const Participants = () => {
	const utils = trpc.useContext();
	const allParticipants = trpc.participants.getAllParticipants.useQuery();
	const { validate, errors, setErrors } = useZod(participantCreateSchema);
	// These are the award categories displayed as options in the participant forms
	const [categoriesAsOptions, setCategoriesAsOptions] = useState<Option[]>([]);
	const [defaultOptions, setDefaultOptions] = useState<Option[]>([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [participantCreatable, setParticipantCreatable] = useState({
		name: '',
		direction: '',
		thumbnail: '',
		categories: [] as string[],
		website: '',
		mapsAnchor: '',
	});
	const { fileInputRef: creatableFileRef, uploadImage: creatableFileUpload } = useUploadImage({
		onUpload: (url) => setParticipantCreatable(prev => ({ ...prev, thumbnail: url as string }))
	});
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [participantEditable, setParticipantEditable] = useState({} as Participant);
	const { fileInputRef: editableFileRef, uploadImage: editableFileUpload } = useUploadImage({
		onUpload: (url) => setParticipantEditable(prev => ({ ...prev, thumbnail: url as string })),
	});
	const { data: categories, isLoading: isCategoriesLoading } = trpc.categories.getAllCategories.useQuery(undefined, {
		onSuccess: (data) => {
			if (!data) return;
			setCategoriesAsOptions(data.map((category) => ({
				label: category.name,
				value: category.id,
			})));
		}
	});
	const participantCreate = trpc.participants.addNewParticipant.useMutation({
		async onMutate(vars) {
			// Prepare for optimistic update
			await utils.participants.getAllParticipants.cancel();
			const prevData = utils.participants.getAllParticipants.getData();
			utils.participants.getAllParticipants.setData(undefined,
				(old) => old && [...old, { ...vars, id: '-1', categoryIds: [] }]
			);
			setErrors({});
			setIsCreateModalOpen(false);
			participantCreateClear();
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
		},
		onSuccess() {
			utils.participants.getAllParticipants.invalidate();
		}
	});
	const participantEdit = trpc.participants.editParticipant.useMutation({
		async onMutate(vars) {
			// Prepare for optimistic update
			await utils.participants.getAllParticipants.invalidate();
			const prevData = utils.participants.getAllParticipants.getData();
			utils.participants.getAllParticipants.setData(undefined,
				(old) => old && old.map((participant) => participant.id === vars.id ? { ...participant, ...vars } : participant)
			);
			setErrors({});
			setIsEditModalOpen(false);
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.participants.getAllParticipants.invalidate();
		}
	});
	const participantDelete = trpc.participants.deleteParticipant.useMutation({
		async onMutate(dto) {
			// Prepare for optimistic update
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

	/** It executes the delete mutation */
	const participantDeleteAction = async (participantId: string) => {
		participantDelete.mutate({ participantId });
	};

	/** It clears the create participant form */
	const participantCreateClear = () => {
		setParticipantCreatable({ name: '', direction: '', thumbnail: '', categories: [], website: '', mapsAnchor: '' });
	};

	/** It handles the create form updates */
	const participantCreateHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
		setParticipantCreatable((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	/** It executes the create mutation if the introduced values are valid */
	const participantCreateAction = () => {
		const isAllowed = validate(participantCreatable);
		isAllowed && participantCreate.mutate(participantCreatable);
	};

	/** It handles the edit form updates */
	const participantEditHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
		setParticipantEditable((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	/** It opens the edit participant modal */
	const participantEditLink = (editable: Participant) => {
		setParticipantEditable(editable);
		if (categories) {
			setDefaultOptions(editable.categoryIds.map((id) => {
				const category = categories.find((category) => category.id === id);
				return {
					label: category!.name,
					value: category!.id,
				};
			}));
		}
		setIsEditModalOpen(true);
	};

	/** It executes the edit mutation if the introduced values are valid */
	const participantEditAction = () => {
		const { categoryIds, ...editable } = participantEditable;
		const isAllowed = validate({ ...editable, categories: categoryIds });
		isAllowed && participantEdit.mutate({ ...editable, categories: categoryIds });
	};

	return (
		<>
			<div>
				<h1 className="text-2xl font-semibold">Participants</h1>

				{/* ------------- CREATE PARTICIPANT MODAL ------------- */}
				<Dialog.Root open={isCreateModalOpen} onOpenChange={isOpen => setIsCreateModalOpen(isOpen)}>
					<Dialog.Trigger className="bg-green-500 px-2 cursor-pointer uppercase">
						+ Add New
					</Dialog.Trigger>
					<Dialog.Content
						title="Add Participant"
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
									value={participantCreatable.name}
									onChange={participantCreateHandler}
								/>
								<p className="text-xs text-red-500">{errors.name}</p>
							</fieldset>
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="thumbnail">Thumbnail</label>
								<input ref={creatableFileRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={creatableFileUpload} className="hidden" />
								{participantCreatable.thumbnail && <img src={participantCreatable.thumbnail} alt="thumbnail" />}
								<button
									className="bg-gray-300 px-2 py-2 rounded ml-2 text-xs uppercase"
									onClick={() => creatableFileRef.current?.click()}
								>
									Upload
								</button>
								<p className="text-xs text-red-500">{errors.thumbnail}</p>
							</fieldset>
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="direction">Direction</label>
								<input type="text" id="direction" placeholder="Cabo San Lucas" value={participantCreatable.direction} onChange={participantCreateHandler} />
								<p className="text-xs text-red-500">{errors.direction}</p>
							</fieldset>
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="website">Website URL</label>
								<input
									type="text"
									id="website"
									placeholder="https://..."
									value={participantCreatable.website}
									onChange={participantCreateHandler}
								/>
							</fieldset>
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="mapsAnchor">Google Maps URL</label>
								<input
									type="text"
									id="mapsAnchor"
									placeholder="https://goo.gl/maps/..."
									value={participantCreatable.mapsAnchor}
									onChange={participantCreateHandler}
								/>
							</fieldset>
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="categories">Categories</label>
								<Select
									id="categories"
									isLoading={isCategoriesLoading}
									options={categoriesAsOptions}
									onChange={(values) => setParticipantCreatable(prev => ({ ...prev, categories: values.map(e => e.value) }))}
									isMulti
									isSearchable
								/>
								<p className="text-xs text-red-500">{errors.categories}</p>
							</fieldset>
						</div>
						<Dialog.Actions>
							<button className="bg-green-500 px-2 uppercase" onClick={participantCreateAction}>Add</button>
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
								onClick={() => participantDeleteAction(participant.id)}
							>x</button>
							<button
								className="bg-yellow-500 px-2 cursor-pointer"
								onClick={() => participantEditLink(participant)}
							>~</button>
						</li>
					))
					: allParticipants.isLoading ? <p>Loading...</p>
						: <p>No participants found</p>
				}
			</ul>

			{/* ------------- EDIT PARTICIPANT MODAL ------------- */}
			<Modal state={[isEditModalOpen, setIsEditModalOpen]}>
				<h1>Edit Participant</h1>
				<div className="flex flex-col flex-y-4">
					<fieldset className="flex flex-col space-y-2">
						<label htmlFor="name">Name</label>
						<input
							autoFocus
							id="name"
							type="text"
							placeholder="Something crazy"
							value={participantEditable.name}
							onChange={participantEditHandler}
						/>
						<p className="text-xs text-red-500">{errors.name}</p>
					</fieldset>
					<fieldset className="flex flex-col space-y-2">
						<label htmlFor="thumbnail">Thumbnail</label>
						<input ref={editableFileRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={editableFileUpload} className="hidden" />
						{participantEditable.thumbnail && <img src={participantEditable.thumbnail} alt="thumbnail" />}
						<button
							className="bg-gray-300 px-2 py-2 rounded ml-2 text-xs uppercase"
							onClick={() => editableFileRef.current?.click()}
						>
							Upload
						</button>
						<p className="text-xs text-red-500">{errors.thumbnail}</p>
					</fieldset>
					<fieldset className="flex flex-col space-y-2">
						<label htmlFor="direction">Direction</label>
						<input type="text" id="direction" placeholder="Cabo San Lucas" value={participantEditable.direction} onChange={participantEditHandler} />
						<p className="text-xs text-red-500">{errors.direction}</p>
					</fieldset>
					<fieldset className="flex flex-col space-y-2">
						<label htmlFor="website">Website URL</label>
						<input
							type="text"
							id="website"
							placeholder="https://..."
							value={participantEditable.website ?? ''}
							onChange={participantEditHandler}
						/>
					</fieldset>
					<fieldset className="flex flex-col space-y-2">
						<label htmlFor="mapsAnchor">Google Maps URL</label>
						<input
							type="text"
							id="mapsAnchor"
							placeholder="https://goo.gl/maps/..."
							value={participantEditable.mapsAnchor ?? ''}
							onChange={participantEditHandler}
						/>
					</fieldset>
					<fieldset className="flex flex-col space-y-2">
						<label htmlFor="categories">Categories</label>
						<Select
							id="categories"
							isLoading={isCategoriesLoading}
							options={categoriesAsOptions}
							onChange={(values) => setParticipantEditable(prev => ({ ...prev, categoryIds: values.map(e => e.value) }))}
							isMulti
							isSearchable
							defaultValue={defaultOptions}
						/>
						<p className="text-xs text-red-500">{errors.categories}</p>
					</fieldset>
				</div>
				<button className="px-2 bg-yellow-500 uppercase" onClick={participantEditAction}>Edit</button>
			</Modal>
		</>
	);
};

export default Participants;
