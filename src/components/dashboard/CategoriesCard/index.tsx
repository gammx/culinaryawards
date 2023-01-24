import { ChangeEventHandler, useState, useEffect } from 'react';
import { trpc } from '~/utils/trpc';
import { categoryCreateSchema, categoryEditSchema } from '~/utils/schemas/categories';
import { PlusOutline, FunnelOutline, PinOutline, SmilingFaceOutline } from '@styled-icons/evaicons-outline';
import Dialog from '~/components/UI/Dialog';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import type { Category } from '@prisma/client';
import type { Option } from '~/utils/select';
import cs from './CategoriesCard.module.css';
import cn from 'classnames';
import useViews from '~/utils/useViews';
import DataCard from '../DataCard';
import Button from '~/components/UI/Button';
import IconButton from '~/components/UI/IconButton';
import HighlightedIcon from '~/components/UI/HighlightedIcon';

const Categories = () => {
	const views = useViews('list');
	const [participantsAsOptions, setParticipantsAsOptions] = useState<Option[]>([]);
	const [defaultParticipantOptions, setDefaultParticipantOptions] = useState<Option[]>([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	/** The currently focused category profile */
	const [categoryProfile, setCategoryProfile] = useState<Category | null>(null);
	const [categoryProfileTab, setCategoryProfileTab] = useState('info');
	const [categoryCreatable, setCategoryCreatable] = useState({
		name: '',
		location: '',
		participantIds: [] as string[],
	});
	const [categoryEditable, setCategoryEditable] = useState({
		id: '',
		name: '',
		location: '',
		participantIds: []
	} as Category);
	const [categoryDeletable, setCategoryDeletable] = useState('');
	const { validate, errors, setErrors } = useZod(categoryCreateSchema);
	const categoryEditZod = useZod(categoryEditSchema);
	const utils = trpc.useContext();
	const { data: categories, isLoading: isCategoriesLoading } = trpc.categories.getAllCategories.useQuery(undefined, {
		onSuccess(data) {
			if (data && categoryProfile) {
				const target = data.find((participant) => participant.id === categoryProfile.id);
				target && setCategoryProfile(target);
			}
		},
	});
	const { data: participants, isFetching: isParticipantFetching } = trpc.participants.getAllParticipants.useQuery(undefined, {
		onSuccess(data) {
			setParticipantsAsOptions(data.map((participant) => ({
				value: participant.id,
				label: participant.name
			})));
		},
	});
	const categoryCreate = trpc.categories.addNewCategory.useMutation({
		async onMutate(vars) {
			await utils.categories.getAllCategories.cancel();
			const prevData = utils.categories.getAllCategories.getData();
			utils.categories.getAllCategories.setData(undefined,
				(old) => old && [...old, { ...vars, id: '-1' }]
			);
			setErrors({});
			setIsCreateModalOpen(false);
			clearCategoryForms();
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.categories.getAllCategories.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.categories.getAllCategories.invalidate();
			// We're probably assigning this new category to some participants, so we need to invalidate the participants query
			utils.participants.getAllParticipants.invalidate();
		}
	});
	const categoryEdit = trpc.categories.editCategory.useMutation({
		async onMutate(dto) {
			await utils.categories.getAllCategories.cancel();
			const prevData = utils.categories.getAllCategories.getData();
			setCategoryProfile(dto);
			let prevCategory = {} as Category;
			utils.categories.getAllCategories.setData(undefined,
				(old) => old && old.map((category) => {
					if (category.id === dto.id) {
						prevCategory = category;
						return dto;
					}
					return category;
				})
			);
			categoryEditZod.setErrors({});
			setCategoryProfileTab('info');
			clearCategoryForms();
			return { prevData, prevCategory };
		},
		onError(err, vars, ctx) {
			if (ctx) {
				utils.categories.getAllCategories.setData(undefined, ctx.prevData);
				setCategoryProfile(ctx.prevCategory);
			}
		},
		onSettled() {
			utils.categories.getAllCategories.invalidate();
			// We're probably assigning this category to some participants, so we need to invalidate the participants query
			utils.participants.getAllParticipants.invalidate();
		}
	});
	const categoryDelete = trpc.categories.deleteCategory.useMutation({
		async onMutate({ categoryId }) {
			// Optimistically update to the new value
			await utils.categories.getAllCategories.cancel();
			const prevData = utils.categories.getAllCategories.getData();
			utils.categories.getAllCategories.setData(undefined,
				(old) => old && old.filter((category) => category.id !== categoryId)
			);
			views.go('list');
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.categories.getAllCategories.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.categories.getAllCategories.invalidate();
			utils.participants.getAllParticipants.invalidate();
		}
	});

	/** Sync editable DTO with the current category profile changes */
	useEffect(() => {
		if (!categoryProfile || !participants) return;

		setCategoryEditable(categoryProfile);
		setDefaultParticipantOptions(categoryProfile.participantIds.map((id) => {
			const participant = participants.find((participant) => participant.id === id);
			return {
				label: participant!.name,
				value: participant!.id,
			};
		}));
	}, [categoryProfile, participants]);

	/** It clears both category forms */
	const clearCategoryForms = () => {
		setCategoryCreatable({ name: '', location: '', participantIds: [] });
		setCategoryEditable({ id: '', name: '', location: '', participantIds: [] });
	};

	/** It handles the category create form updates */
	const categoryCreateHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		setCategoryCreatable({ ...categoryCreatable, [event.target.id]: event.target.value });
	};

	/** It executes the category create mutation, validating the values first */
	const categoryCreateAction = () => {
		const isAllowed = validate(categoryCreatable);
		isAllowed && categoryCreate.mutate(categoryCreatable);
	};

	/** It opens the category edit modal */
	const categoryEditLink = (editable: Category) => {
		setCategoryEditable(editable);
		if (participants) {
			setDefaultParticipantOptions(editable.participantIds.map((participantId) => {
				const participant = participants.find((p) => p.id === participantId);
				return { value: participant!.id, label: participant!.name };
			}));
		}
		setIsEditModalOpen(true);
	};

	/** It handles the category edit form updates */
	const editableHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		setCategoryEditable({ ...categoryEditable, [event.target.id]: event.target.value });
	};

	/** It executes the category edit mutation, if the validation gets passed */
	const editCategory: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		if (!categoryEditable) return;

		const isAllowed = categoryEditZod.validate(categoryEditable);
		isAllowed && categoryEdit.mutate(categoryEditable);
	};

	/** It executes the category delete mutation */
	const deleteCategory: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		categoryDelete.mutate({ categoryId: categoryProfile!.id });
	};

	const goToProfile = (editable: Category) => {
		setCategoryProfile(editable);
		setCategoryProfileTab('info');
		views.go('profile');
	};

	const goBackToList = () => {
		setCategoryProfile(null);
		views.goBack();
	};

	return (
		<>
			{views.current === 'list' && (
				<DataCard.Root className="border-l border-l-white/20">
					<DataCard.Header>
						<DataCard.TitleBar title="Categories">
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
						<ul className="flex flex-col space-y-1">
							{categories && categories.length > 0 && categories.map((category) => (
								<li
									key={category.id}
									className="flex space-x-4 items-center cursor-pointer hover:bg-white/20 rounded-lg p-2"
									onClick={() => goToProfile(category)}
								>
									{category.name}
								</li>
							))}
						</ul>
					</DataCard.Content>
				</DataCard.Root>
			)}

			{views.current === 'profile' && categoryProfile &&  (
				<DataCard.Root className="border-l border-l-white/20">
					<DataCard.Header>
						<DataCard.TitleBar title={categoryProfile.name} onBack={goBackToList}></DataCard.TitleBar>
					</DataCard.Header>
					<DataCard.Content>
						<DataCard.Tabs state={[categoryProfileTab, setCategoryProfileTab]}>
							{/** CATEGORY INFO ----------------------------------------- */}
							<DataCard.Tab value="info" className="px-8 flex flex-col space-y-2">
								{categoryProfile.location && (
									<div className="flex mb-8">
										<HighlightedIcon icon={PinOutline} variant="green" />
										<span>{categoryProfile.location}</span>
									</div>
								)}

								<div className="flex">
									<HighlightedIcon icon={SmilingFaceOutline} variant="pink" />
									<div className="flex flex-col space-y-2">
										<p className="font-medium">Participants</p>
										<ul className="text-sm">
											{isParticipantFetching
												? <p>Loading...</p>
												: (participants && categoryProfile.participantIds.length > 0)
												? participants.filter((participant) => categoryProfile.participantIds.includes(participant.id)).map(participant => (
													<li key={participant.id}>{participant.name}</li>
												))
												: <li>No participants yet</li>
											}
										</ul>
									</div>
								</div>
							</DataCard.Tab>
							{/** CATEGORY EDIT ----------------------------------------- */}
							<DataCard.Tab value="edit" className="px-8">
								<form onSubmit={editCategory}>
									<fieldset>
										<label htmlFor="name">Name *</label>
										<input
											type="text"
											id="name"
											value={categoryEditable.name}
											onChange={editableHandler}
										/>
										{categoryEditZod.errors.name && <p className="text-xs text-red mt-2">{categoryEditZod.errors.name}</p>}
									</fieldset>
									<fieldset>
										<label htmlFor="location">Location</label>
										<input
											type="text"
											id="location"
											value={categoryEditable.location || ''}
											onChange={editableHandler}
										/>
									</fieldset>
									<fieldset>
										<label htmlFor="participantIds">Categories</label>
										<Select
											id="participantIds"
											isLoading={isCategoriesLoading}
											options={participantsAsOptions}
											defaultValue={defaultParticipantOptions}
											onChange={(values) => setCategoryEditable(prev => ({ ...prev, participantIds: values.map(e => e.value) }))}
											isMulti
											isSearchable
											menuPlacement={'auto'}
											className="react-select-container"
											classNamePrefix="react-select"
										/>
									</fieldset>
									<Button type="submit" variant="secondary">Save</Button>
								</form>
							</DataCard.Tab>
							{/** CATEGORY DELETE ----------------------------------------- */}
							<DataCard.Tab value="delete" className="px-8">
								<form onSubmit={deleteCategory}>
									<fieldset>
										<label>Delete Category</label>
										<p>Are you sure you want to delete this category?</p>
										<br />
										<Button type="submit" variant="danger">Delete</Button>
									</fieldset>
								</form>
							</DataCard.Tab>
						</DataCard.Tabs>
					</DataCard.Content>
				</DataCard.Root>
			)}
		</>
	);
};

export default Categories;
