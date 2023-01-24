import { ChangeEventHandler, useState, useEffect } from 'react';
import { participantCreateSchema } from '~/utils/schemas/participants';
import { Participant } from '@prisma/client';
import { PlusOutline, FunnelOutline, HashOutline } from '@styled-icons/evaicons-outline';
import { trpc } from '~/utils/trpc';
import Button from '~/components/UI/Button';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import DataCard from '../DataCard';
import IconButton from '~/components/UI/IconButton';
import HighlightedIcon from '~/components/UI/HighlightedIcon';
import useUploadImage from '~/utils/useUploadImage';
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
	const [profileTab, setProfileTab] = useState('info');
	const [participantTarget, setParticipantTarget] = useState<Participant | null>(null);
	const [participantCreatable, setParticipantCreatable] = useState({
		name: '',
		direction: '',
		thumbnail: '',
		categoryIds: [] as string[],
		website: '',
		mapsAnchor: '',
	});
	const [participantEditable, setParticipantEditable] = useState({} as Participant);
	const { fileInputRef: creatableAvatarRef, uploadImage: uploadCreatableAvatar } = useUploadImage({
		onUpload: (url) => setParticipantCreatable(prev => ({ ...prev, thumbnail: url as string }))
	});
	const { fileInputRef: editableAvatarRef, uploadImage: uploadEditableAvatar } = useUploadImage({
		onUpload: (url) => setParticipantEditable(prev => ({ ...prev, thumbnail: url as string })),
	});
	const { data: categories, isLoading: isCategoriesLoading, isFetching: isCategoriesFetching } = trpc.categories.getAllCategories.useQuery(undefined, {
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
			clearCreatable();
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
			setParticipantTarget(vars);
			utils.participants.getAllParticipants.setData(undefined,
				(old) => old && old.map((participant) => {
					if (participant.id === vars.id) {
						prevParticipant = participant;
						return vars;
					}
					return participant;
				})
			);
			setErrors({});
			setProfileTab('info');
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
			utils.categories.getAllCategories.invalidate();
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
			setProfileTab('info');
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.participants.getAllParticipants.invalidate();
		}
	});

	/** Sync editable DTO with the current participant profile changes */
	useEffect(() => {
		if (!participantTarget || !categories) return;

		setParticipantEditable(participantTarget);
		setDefaultOptions(categories.filter((category) => participantTarget.categoryIds.includes(category.id)).map((category) => ({
			label: category.name,
			value: category.id,
		})));
	}, [participantTarget, categories]);

	/** It executes the delete mutation */
	const participantDeleteAction = () => {
		participantTarget && participantDelete.mutate({ participantId: participantTarget.id });
	};

	/** It clears the create participant form */
	const clearCreatable = () => {
		setParticipantCreatable({ name: '', direction: '', thumbnail: '', categoryIds: [], website: '', mapsAnchor: '' });
	};

	/** It handles the create form updates */
	const creatableHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
		setParticipantCreatable((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	/** It executes the create mutation if the introduced values are valid */
	const createParticipant = () => {
		const isAllowed = validate(participantCreatable);
		isAllowed && participantCreate.mutate(participantCreatable);
	};

	/** It handles the edit form updates */
	const editableHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
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
	const editParticipant = () => {
		const isAllowed = validate(participantEditable);
		isAllowed && participantEdit.mutate(participantEditable);
	};

	/** Callback to execute when user moves between tabs */
	const changeProfileTab = (tab: string) => {
		participantTarget && setParticipantEditable(participantTarget);
		setErrors({});
		setProfileTab(tab);
	};

	/** It cancels the add participant action */
	const cancelCreateParticipant = () => {
		views.go('list');
		setErrors({});
		clearCreatable();
	};

	return (
		<>
			{views.current === 'list' && (
				<DataCard.Root className="border-r border-r-white/20">
					<DataCard.Header>
						<DataCard.TitleBar
							title="Participants"
						>
							<IconButton icon={PlusOutline}></IconButton>
							<IconButton icon={FunnelOutline} />
						</DataCard.TitleBar>
						<div className="px-8">
							<input
								type="text"
								placeholder="Search"
								className="w-full rounded-full"
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
							onBack={cancelCreateParticipant}
						></DataCard.TitleBar>
					</DataCard.Header>
					<DataCard.Content className="px-8 h-full w-full overflow-y-auto">
						<div className="w-full">
							<fieldset >
								<label htmlFor="thumbnail">Picture *</label>
								<input ref={creatableAvatarRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={uploadCreatableAvatar} className="hidden" />
								<div className="pb-4 flex justify-center">
									<img src={participantCreatable.thumbnail || '/default_pfp.png'} alt={`${participantCreatable.name} (Thumbnail)`} className="w-20 h-20 rounded-circle object-cover" />
								</div>
								<Button onClick={() => creatableAvatarRef.current?.click()}>Upload</Button>
								{errors.thumbnail && <span className="text-red-500 text-sm">{errors.thumbnail}</span>}
							</fieldset>
							<fieldset>
								<label htmlFor="name">Name *</label>
								<input
									id="name"
									type="text"
									value={participantCreatable.name}
									onChange={creatableHandler}
								/>
								{errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
							</fieldset>
							<fieldset>
								<label htmlFor="direction">Direction *</label>
								<input
									id="direction"
									type="text"
									value={participantCreatable.direction}
									onChange={creatableHandler}
								/>
								{errors.direction && <span className="text-red-500 text-sm">{errors.direction}</span>}
							</fieldset>
							<fieldset>
								<label htmlFor="website">Website</label>
								<input
									id="website"
									type="text"
									value={participantCreatable.website}
									onChange={creatableHandler}
									placeholder="https://..."
								/>
							</fieldset>
							<fieldset>
								<label htmlFor="mapsAnchor">Google Maps URL</label>
								<input
									id="mapsAnchor"
									type="text"
									value={participantCreatable.mapsAnchor}
									onChange={creatableHandler}
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
							<Button variant="success" onClick={createParticipant}>Add</Button>
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
						<DataCard.Tabs state={[profileTab, changeProfileTab]}>
							{/** PARTICIPANT INFO ----------------------------------------- */}
							<DataCard.Tab value="info">
								{participantTarget.website && <DataCard.Anchor href={participantTarget.website} />}
								{participantTarget.mapsAnchor && <DataCard.Anchor icon="maps" href={participantTarget.mapsAnchor} />}
								<div className="ml-8 mt-8 flex">
									<HighlightedIcon icon={HashOutline} variant="pink" />
									<div className="flex flex-col space-y-2">
										<p className="font-medium">Categories</p>
										<ul className="text-sm">
											{isCategoriesFetching
												? <li>Loading...</li>
												: (categories && participantTarget.categoryIds.length > 0)
												? categories.filter((category) => participantTarget.categoryIds.includes(category.id)).map((category) => (
													<li key={category.id}>{category.name}</li>
												))
												: <li>No categories yet</li>
											}
										</ul>
									</div>
								</div>
							</DataCard.Tab>
							{/** PARTICIPANT EDIT ----------------------------------------- */}
							<DataCard.Tab value="edit" className="px-8">
								<fieldset>
									<label htmlFor="thumbnail">Picture</label>
									<input ref={editableAvatarRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={uploadEditableAvatar} className="hidden" />
									<div className="pb-6 relative">
										<img src={participantEditable.thumbnail} alt={`${participantEditable.name} (Thumbnail)`} className="w-20 h-20 rounded-circle object-cover" />
									</div>
									<Button onClick={() => editableAvatarRef.current?.click()}>Upload</Button>
									{errors.thumbnail && <p className="text-xs text-red-500 mt-2">{errors.thumbnail}</p>}
								</fieldset>
								<fieldset>
									<label htmlFor="name">Name</label>
									<input
										id="name"
										type="text"
										value={participantEditable.name}
										onChange={editableHandler}
									/>
									{errors.name && <p className="text-xs text-red-500 mt-2">{errors.name}</p>}
								</fieldset>
								<fieldset>
									<label htmlFor="direction">Direction</label>
									<input
										id="direction"
										type="text"
										value={participantEditable.direction || ''}
										onChange={editableHandler}
									/>
									{errors.direction && <p className="text-xs text-red-500 mt-2">{errors.direction}</p>}
								</fieldset>
								<fieldset>
									<label htmlFor="website">Website</label>
									<input
										id="website"
										type="text"
										value={participantEditable.website || ''}
										onChange={editableHandler}
									/>
								</fieldset>
								<fieldset>
									<label htmlFor="mapsAnchor">Google Maps URL</label>
									<input
										id="mapsAnchor"
										type="text"
										value={participantEditable.mapsAnchor || ''}
										onChange={editableHandler}
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
									{errors.categoryIds && <p className="text-xs text-red-500 mt-2">{errors.categoryIds}</p>}
								</fieldset>
								<div className="flex space-x-2">
									<Button variant="secondary" onClick={editParticipant}>Save</Button>
									<Button onClick={() => changeProfileTab('info')}>Cancel</Button>
								</div>
							</DataCard.Tab>
							{/** PARTICIPANT DELETE ----------------------------------------- */}
							<DataCard.Tab value="delete" className="px-8">
								<fieldset className="h-full">
									<label>Delete Participant</label>
									<p className="text-sm">Are you sure you want to delete this participant? Remember this cannot be undone!</p>
									<br />
									<Button variant="danger" onClick={participantDeleteAction}>Delete</Button>
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
