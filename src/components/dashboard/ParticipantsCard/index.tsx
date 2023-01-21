import { ChangeEventHandler, useState, useEffect } from 'react';
import { participantCreateSchema } from '~/utils/schemas/participants';
import { Participant } from '@prisma/client';
import { trpc } from '~/utils/trpc';
import { PlusOutline, FunnelOutline, ArrowUpwardOutline, ArrowBackOutline, HashOutline } from '@styled-icons/evaicons-outline';
import Dialog from '~/components/UI/Dialog';
import DataCardTabs from '../DataCard/DataCardTabs';
import DataCardAnchor from '../DataCard/DataCardAnchor';
import Modal from '~/components/UI/Modal';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import useUploadImage from '~/utils/useUploadImage';
import cs from './ParticipantsCard.module.css';
import cn from 'classnames';
import Participants from '../Participants';
import DataCard from '../DataCard';
import useViews from '~/utils/useViews';

interface Option {
	label: string;
	value: string;
}

const ParticipantsCard = () => {
	const views = useViews('list');
	const utils = trpc.useContext();
	const { data: participants, refetch: refetchParticipants } = trpc.participants.getAllParticipants.useQuery(undefined, {
		onSuccess(data) {
			if (data && participantTarget) {
				const target = data.find((participant) => participant.id === participantTarget.id);
				target && setParticipantTarget(target);
			}
		},
	});
	const { validate, errors, setErrors } = useZod(participantCreateSchema);
	// These are the award categories displayed as options in the participant forms
	const [categoriesAsOptions, setCategoriesAsOptions] = useState<Option[]>([]);
	const [defaultOptions, setDefaultOptions] = useState<Option[]>([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
	const [isEditingParticipant, setIsEditingParticipant] = useState(false);
	const [cardTab, setCardTab] = useState('info');
	const [participantTarget, setParticipantTarget] = useState<Participant | null>(null);
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
			views.goBack();
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
			await utils.participants.getAllParticipants.cancel();
			const prevData = utils.participants.getAllParticipants.getData();
			let prevParticipant = {} as Participant;
			setParticipantTarget({ ...vars, categoryIds: vars.categories });
			utils.participants.getAllParticipants.setData(undefined,
				(old) => old && old.map((participant) => {
					if (participant.id === vars.id) {
						prevParticipant = participant;
						return { ...participant, ...vars };
					}
					return participant;
				})
			);
			setErrors({});
			setCardTab('info');
			return { prevData, prevParticipant };
		},
		onError(err, vars, ctx) {
			if (ctx) {
				utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
				setParticipantTarget(ctx.prevParticipant);
			}
		},
		onSettled() {
			refetchParticipants();
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
			views.goBack();
			setCardTab('info');
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.participants.getAllParticipants.invalidate();
		}
	});

	useEffect(() => {
		if (!participantTarget || !categories) return;

		setParticipantEditable(participantTarget);
		setDefaultOptions(participantTarget.categoryIds.map((id) => {
			const category = categories.find((category) => category.id === id);
			return {
				label: category!.name,
				value: category!.id,
			};
		}));
	}, [participantTarget]);

	/** It executes the delete mutation */
	const participantDeleteAction = () => {
		participantTarget && participantDelete.mutate({ participantId: participantTarget.id });
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

	/** It opens a participant profile */
	const goToProfile = (editable: Participant) => {
		setParticipantTarget(editable);
		views.go('profile');
	};

	/** It executes the edit mutation if the introduced values are valid */
	const participantEditAction = () => {
		const { categoryIds, ...editable } = participantEditable;
		const isAllowed = validate({ ...editable, categories: categoryIds });
		isAllowed && participantEdit.mutate({ ...editable, categories: categoryIds });
	};

	/** Callback to execute when user moves between tabs */
	const onTabChange = (tab: string) => {
		participantTarget && setParticipantEditable(participantTarget);
		setErrors({});
		setCardTab(tab);
	};

	/** It cancels the add participant action */
	const cancelParticipantAdd = () => {
		views.go('list');
		setErrors({});
		participantCreateClear();
	};

	return (
		<>
			{views.current === 'list' && (
				<DataCard.Root className="border-r border-r-white/20">
					<DataCard.Header>
						<DataCard.TitleBar
							title="Participants"
						>
							<div
								role="button"
								className="border border-white/50 rounded-lg w-6 h-6 flex items-center justify-center hover:border-white"
								onClick={() => views.go('add')}
							>
								<PlusOutline size={18} />
							</div>
							<div role="button" className="border border-white/50 rounded-lg w-6 h-6 flex items-center justify-center hover:border-white">
								<FunnelOutline size={18} />
							</div>
						</DataCard.TitleBar>
						<div className="px-8">
							<input
								type="text"
								placeholder="Search"
								className="outline-none h-9 w-full bg-white opacity-30 backdrop-blur-sm rounded-full focus:outline-white py-2-5 px-5 mb-4 text-sm"
							/>
						</div>
					</DataCard.Header>
					<DataCard.Content className="px-8">
						<ul
							className="flex flex-col space-y-1"
						>
							{participants && participants.length > 0 &&
								participants.map((participant) => (
									<li
										key={participant.id}
										className="flex space-x-4 items-center cursor-pointer hover:bg-white/20 rounded-lg p-2"
										onClick={() => goToProfile(participant)}
									>
										<img src={participant.thumbnail} alt={`${participant.name} (Thumbnail)`} className="rounded-circle w-6 h-6 object-cover" />
										<span>{participant.name}</span>
									</li>
								))
							}
						</ul>
					</DataCard.Content>
				</DataCard.Root>
			)}

			{views.current === 'add' && (
				<DataCard.Root className="border-r border-r-white/20">
					<DataCard.Header>
						<DataCard.TitleBar
							title="Add Participant"
							onBack={cancelParticipantAdd}
						></DataCard.TitleBar>
					</DataCard.Header>
					<DataCard.Content className="px-8 h-full w-full overflow-y-auto">
						<div className="w-full">
							<fieldset >
								<label htmlFor="thumbnail">Picture *</label>
								<input ref={creatableFileRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={creatableFileUpload} className="hidden" />
								<div className="pb-4 flex justify-center">
									<img src={participantCreatable.thumbnail || '/default_pfp.png'} alt={`${participantCreatable.name} (Thumbnail)`} className="w-20 h-20 rounded-circle object-cover" />
								</div>
								<button
									className="bg-white/30 hover:bg-white/40 text-gray-500 py-1.5 px-4 text-sm font-bold rounded-md uppercase tracking-wider"
									onClick={() => creatableFileRef.current?.click()}
								>
									Upload
								</button>
								{errors.thumbnail && <span className="text-red-500 text-sm">{errors.thumbnail}</span>}
							</fieldset>
							<fieldset>
								<label htmlFor="name">Name *</label>
								<input
									id="name"
									type="text"
									value={participantCreatable.name}
									onChange={participantCreateHandler}
								/>
								{errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
							</fieldset>
							<fieldset>
								<label htmlFor="direction">Direction *</label>
								<input
									id="direction"
									type="text"
									value={participantCreatable.direction}
									onChange={participantCreateHandler}
								/>
								{errors.direction && <span className="text-red-500 text-sm">{errors.direction}</span>}
							</fieldset>
							<fieldset>
								<label htmlFor="website">Website</label>
								<input
									id="website"
									type="text"
									value={participantCreatable.website}
									onChange={participantCreateHandler}
									placeholder="https://..."
								/>
							</fieldset>
							<fieldset>
								<label htmlFor="mapsAnchor">Google Maps URL</label>
								<input
									id="mapsAnchor"
									type="text"
									value={participantCreatable.mapsAnchor}
									onChange={participantCreateHandler}
									placeholder="https://www.google.com/maps/place/..."
								/>
							</fieldset>
							<fieldset>
								<label htmlFor="categories">Categories</label>
								<Select
									id="categories"
									isLoading={isCategoriesLoading}
									options={categoriesAsOptions}
									onChange={(values) => setParticipantCreatable(prev => ({ ...prev, categories: values.map(e => e.value) }))}
									isMulti
									isSearchable
									menuPlacement={'auto'}
									className="react-select-container"
									classNamePrefix="react-select"
								/>
							</fieldset>
							<button
								className="bg-green-muted hover:bg-green-muted/70 text-green py-1.5 px-4 text-sm font-bold rounded-md uppercase tracking-wider"
								onClick={participantCreateAction}
							>
								Add
							</button>
						</div>
					</DataCard.Content>
				</DataCard.Root>
			)}

			{views.current === 'profile' && participantTarget && (
				<DataCard.Root className="border-r border-r-white/20">
					<DataCard.Header>
						<DataCard.TitleBar
							title={participantTarget.name}
							onBack={() => {
								setParticipantTarget(null);
								views.goBack();
							}}
						></DataCard.TitleBar>
					</DataCard.Header>
					<DataCard.Content>
						<DataCard.Tabs state={[cardTab, onTabChange]}>
							{/** PARTICIPANT INFO ----------------------------------------- */}
							<DataCard.Tab value="info">
								{participantTarget.website && <DataCard.Anchor href={participantTarget.website} />}
								{participantTarget.mapsAnchor && <DataCard.Anchor icon="maps" href={participantTarget.mapsAnchor} />}
								<div className="ml-8 mt-8 flex">
									<div className="rounded-lg flex items-center justify-center w-6 h-6 mr-8 bg-pink-muted">
										<HashOutline className="text-pink" size={18} />
									</div>
									<div className="flex flex-col space-y-2">
										<p className="font-medium">Categories</p>
										<ul className="text-sm">
											{categories && categories.filter((category) => participantTarget.categoryIds.includes(category.id)).map((category) => (
												<li key={category.id}>{category.name}</li>
											))}
										</ul>
									</div>
								</div>
							</DataCard.Tab>
							{/** PARTICIPANT EDIT ----------------------------------------- */}
							<DataCard.Tab value="edit" className="px-8">
								<fieldset>
									<label htmlFor="thumbnail">Picture</label>
									<input ref={editableFileRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={editableFileUpload} className="hidden" />
									<div className="pb-6 relative">
										<img src={participantEditable.thumbnail} alt={`${participantEditable.name} (Thumbnail)`} className="w-20 h-20 rounded-circle object-cover" />
									</div>
									<button
										className="bg-white/30 hover:bg-white/40 text-gray-500 py-1.5 px-4 text-sm font-bold rounded-md uppercase tracking-wider"
										onClick={() => editableFileRef.current?.click()}
									>
										Upload
									</button>
									{errors.thumbnail && <p className="text-xs text-red-500 mt-2">{errors.thumbnail}</p>}
								</fieldset>
								<fieldset>
									<label htmlFor="name">Name</label>
									<input
										id="name"
										type="text"
										value={participantEditable.name}
										onChange={participantEditHandler}
									/>
									{errors.name && <p className="text-xs text-red-500 mt-2">{errors.name}</p>}
								</fieldset>
								<fieldset>
									<label htmlFor="direction">Direction</label>
									<input
										id="direction"
										type="text"
										value={participantEditable.direction || ''}
										onChange={participantEditHandler}
									/>
									{errors.direction && <p className="text-xs text-red-500 mt-2">{errors.direction}</p>}
								</fieldset>
								<fieldset>
									<label htmlFor="website">Website</label>
									<input
										id="website"
										type="text"
										value={participantEditable.website || ''}
										onChange={participantEditHandler}
									/>
								</fieldset>
								<fieldset>
									<label htmlFor="mapsAnchor">Google Maps URL</label>
									<input
										id="mapsAnchor"
										type="text"
										value={participantEditable.mapsAnchor || ''}
										onChange={participantEditHandler}
									/>
								</fieldset>
								<fieldset>
									<label htmlFor="categories">Categories</label>
									<Select
										id="categories"
										isLoading={isCategoriesLoading}
										options={categoriesAsOptions}
										defaultValue={defaultOptions}
										onChange={(values) => setParticipantEditable(prev => ({ ...prev, categoryIds: values.map(e => e.value) }))}
										isMulti
										isSearchable
										menuPlacement={'auto'}
										className="react-select-container"
										classNamePrefix="react-select"
									/>
									{errors.categories && <p className="text-xs text-red-500 mt-2">{errors.categories}</p>}
								</fieldset>
								<div className="flex space-x-2">
									<button
										className="bg-blue-muted hover:bg-blue-muted/70 text-blue py-1.5 px-4 text-sm font-bold rounded-md uppercase tracking-wider"
										onClick={participantEditAction}
									>
										Save
									</button>
									<button
										className="bg-white/30 hover:bg-white/40 text-neutral-500 py-1.5 px-4 text-sm font-bold rounded-md uppercase tracking-wider"
										onClick={() => onTabChange('info')}
									>
										Cancel
									</button>
								</div>
							</DataCard.Tab>
							{/** PARTICIPANT DELETE ----------------------------------------- */}
							<DataCard.Tab value="delete" className="px-8">
								<fieldset className="h-full">
									<label>Delete Participant</label>
									<p className="text-sm">Are you sure you want to delete this participant? Remember this cannot be undone!</p>
									<br />
									<button
										className="bg-red-muted hover:bg-red-muted/70 text-red py-1.5 px-4 text-sm font-bold rounded-md uppercase tracking-wider"
										onClick={participantDeleteAction}
									>
										Delete
									</button>
								</fieldset>
							</DataCard.Tab>
						</DataCard.Tabs>
					</DataCard.Content>
				</DataCard.Root>
			)}
		</>
	);
};

export default ParticipantsCard;
