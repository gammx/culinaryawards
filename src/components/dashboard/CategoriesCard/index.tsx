import { ChangeEventHandler, useState } from 'react';
import { trpc } from '~/utils/trpc';
import { categoryCreateSchema, categoryEditSchema } from '~/utils/schemas/categories';
import { PlusOutline, FunnelOutline, ArrowUpwardOutline } from '@styled-icons/evaicons-outline';
import Dialog from '~/components/UI/Dialog';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import type { Category } from '@prisma/client';
import type { Option } from '~/utils/select';
import cs from './CategoriesCard.module.css';
import cn from 'classnames';

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
	const [categoryDeletable, setCategoryDeletable] = useState('');
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

	/** It clears both category forms */
	const categoryFormClear = () => {
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
	const categoryEditHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
		setCategoryEditable({ ...categoryEditable, [event.target.id]: event.target.value });
	};

	/** It executes the category edit mutation, if the validation gets passed */
	const categoryEditAction = () => {
		if (!categoryEditable) return;
		const isAllowed = categoryEditZod.validate(categoryEditable);
		isAllowed && categoryEdit.mutate(categoryEditable);
	};

	/** It executes the category delete mutation */
	const categoryDeleteAction = () => {
		categoryDelete.mutate({ categoryId: categoryDeletable });
	};

	return (
		<div className={cn(cs.Wrapper, 'h-full py-9 px-8 border-l border-l-white/20')}>
			<div className="flex justify-between items-center mb-4">
				<h1 className="font-medium text-2xl">Categories</h1>
				<div className="flex space-x-5">
					<div role="button" className="border border-white/40 rounded-lg w-6 h-6 flex items-center justify-center hover:border-white">
						<PlusOutline size={18} />
					</div>
					<div role="button" className="border border-white/40 rounded-lg w-6 h-6 flex items-center justify-center hover:border-white">
						<FunnelOutline size={18} />
					</div>
				</div>
			</div>
			<input
				type="text"
				placeholder="Search"
				className="outline-none h-9 w-full bg-white opacity-30 backdrop-blur-sm rounded-full focus:outline-white py-2-5 px-5 text-black text-sm"
			/>
		</div>
	);
};

export default Categories;
