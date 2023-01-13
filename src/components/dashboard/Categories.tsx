import { ChangeEventHandler, useState } from 'react';
import { trpc } from '~/utils/trpc';
import { categoryCreateSchema, categoryEditSchema } from '~/utils/schemas/categories';
import Dialog from '../UI/Dialog';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import type { Category } from '@prisma/client';
import type { Option } from '~/utils/select';

const Categories = () => {
	const [participantsAsOptions, setParticipantsAsOptions] = useState<Option[]>([]);
	const [defaultParticipantOptions, setDefaultParticipantOptions] = useState<Option[]>([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
	const [categoryIdToDelete, setCategoryIdToDelete] = useState('');
	const { validate, errors, setErrors } = useZod(categoryCreateSchema);
	const categoryEditZod = useZod(categoryEditSchema);
	const utils = trpc.useContext();
	const allCategories = trpc.categories.getAllCategories.useQuery();
	const { data: participants, isLoading: participantsIsLoading } = trpc.participants.getAllParticipants.useQuery(undefined, {
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
			categoryFormClear();
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
			utils.categories.getAllCategories.setData(undefined,
				(old) => old && old.map((category) => category.id === dto.id ? dto : category)
			);
			categoryEditZod.setErrors({});
			setIsEditModalOpen(false);
			categoryFormClear();
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.categories.getAllCategories.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.categories.getAllCategories.invalidate();
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
			setIsDeleteModalOpen(false);
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.categories.getAllCategories.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.categories.getAllCategories.invalidate();
		}
	});

	const categoryFormClear = () => {
		setCategoryCreatable({ name: '', location: '', participantIds: [] });
		setCategoryEditable({ id: '', name: '', location: '', participantIds: [] });
	};

	const categoryCreateHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		setCategoryCreatable({ ...categoryCreatable, [event.target.id]: event.target.value });
	};

	const categoryCreateAction = () => {
		const isAllowed = validate(categoryCreatable);
		isAllowed && categoryCreate.mutate(categoryCreatable);
	};

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

	const categoryEditHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		setCategoryEditable({ ...categoryEditable, [event.target.id]: event.target.value });
	};

	const categoryEditAction = () => {
		if (!categoryEditable) return;
		const isAllowed = categoryEditZod.validate(categoryEditable);
		isAllowed && categoryEdit.mutate(categoryEditable);
	};

	const categoryDeleteAction = () => {
		categoryDelete.mutate({ categoryId: categoryIdToDelete });
	};

	return (
		<div>
			<div className="flex">
				<h1 className="text-2xl font-semibold">Categories</h1>
				<Dialog.Root open={isCreateModalOpen} onOpenChange={isOpen => setIsCreateModalOpen(isOpen)}>
					<Dialog.Trigger className="bg-green-500 px-2 cursor-pointer uppercase">
						+ Add New
					</Dialog.Trigger>
					<Dialog.Content
						title="Add New Category"
						description="Add a new category"
					>
						<div className="flex flex-col space-y-4">
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="name">Name</label>
								<input
									autoFocus
									id="name"
									type="text"
									placeholder="Something crazy"
									value={categoryCreatable.name}
									onChange={categoryCreateHandler}
								/>
								<p className="text-xs text-red-500">{errors.name}</p>
							</fieldset>
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="location">Location</label>
								<input
									id="location"
									type="text"
									placeholder="Where?"
									value={categoryCreatable.location}
									onChange={categoryCreateHandler}
								/>
							</fieldset>
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="participants">Participants</label>
								<Select
									id="participants"
									isLoading={participantsIsLoading}
									options={participantsAsOptions}
									onChange={(opts) => setCategoryCreatable({ ...categoryCreatable, participantIds: opts.map(option => option.value) })}
									isSearchable
									isMulti
								></Select>
							</fieldset>
						</div>
						<Dialog.Actions>
							<button
								className="bg-green-500 px-2 py-2 rounded mr-2 text-xs uppercase"
								onClick={categoryCreateAction}
							>
								Add
							</button>
						</Dialog.Actions>
					</Dialog.Content>
				</Dialog.Root>
			</div>
			<ul>
				{allCategories.data && allCategories.data.length > 0
					? allCategories.data.map((category) => (
						<li key={category.id} className="flex">
							<span>{category.name}</span>
							<Dialog.Root open={isDeleteModalOpen} onOpenChange={isOpen => setIsDeleteModalOpen(isOpen)}>
								<Dialog.Trigger
									className="bg-red-500 px-2 cursor-pointer"
									onClick={() => setCategoryIdToDelete(category.id)}
								>
									x
								</Dialog.Trigger>
								<Dialog.Content
									title="Delete Category"
									description="Are you sure you want to delete this category?"
								>
									<Dialog.Actions>
										<button
											className="bg-red-500 px-2 py-2 rounded mr-2 text-xs uppercase"
											onClick={categoryDeleteAction}
										>
											Delete
										</button>
									</Dialog.Actions>
								</Dialog.Content>
							</Dialog.Root>
							<button
								className="bg-yellow-500 px-2 cursor-pointer"
								onClick={() => categoryEditLink(category)}
							>
								~
							</button>
						</li>
					))
					: allCategories.isLoading ? <p>Loading...</p>
						: <p>No categories man... </p>
				}
			</ul>
			<Dialog.Root open={isEditModalOpen} onOpenChange={isOpen => setIsEditModalOpen(isOpen)}>
				<Dialog.Content
					title="Edit Category"
					description="Edit this category"
				>
					<fieldset className="flex flex-col space-y-2">
						<label htmlFor="name">Name</label>
						<input
							autoFocus
							id="name"
							type="text"
							placeholder="Something crazy"
							value={categoryEditable.name}
							onChange={categoryEditHandler}
						/>
						<p className="text-xs text-red-500">{errors.name}</p>
					</fieldset>
					<fieldset className="flex flex-col space-y-2">
						<label htmlFor="location">Location</label>
						<input
							id="location"
							type="text"
							placeholder="Where?"
							value={categoryEditable.location || ''}
							onChange={categoryEditHandler}
						/>
					</fieldset>
					<fieldset className="flex flex-col space-y-2">
						<label htmlFor="participants">Participants</label>
						<Select
							id="participants"
							isLoading={participantsIsLoading}
							options={participantsAsOptions}
							defaultValue={defaultParticipantOptions}
							isSearchable
							isMulti
						/>
					</fieldset>
					<Dialog.Actions>
						<button
							className="bg-yellow-500 px-2 py-2 rounded mr-2 text-xs uppercase"
							onClick={categoryEditAction}
						>
							Edit
						</button>
					</Dialog.Actions>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	);
};

export default Categories;
