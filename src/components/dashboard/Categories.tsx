import { ChangeEventHandler, useState } from 'react';
import { trpc } from '~/utils/trpc';
import { categoryCreateSchema } from '~/utils/schemas/categories';
import Dialog from '../UI/Dialog';
import useZod from '~/hooks/useZod';

const Categories = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [categoryFormData, setCategoryFormData] = useState({
		name: '',
		location: ''
	});
	const [categoryIdToDelete, setCategoryIdToDelete] = useState('');
	const { validate, errors, setErrors } = useZod(categoryCreateSchema);
	const allCategories = trpc.categories.getAllCategories.useQuery();
	const utils = trpc.useContext();
	const categoryCreate = trpc.categories.addNewCategory.useMutation({
		async onMutate({ name, location }) {
			await utils.categories.getAllCategories.cancel();
			const prevData = utils.categories.getAllCategories.getData();
			utils.categories.getAllCategories.setData(undefined,
				(old) => old && [...old, { id: '-1', name, location }]
			);
			setErrors({});
			setIsCreateModalOpen(false);
			clearCreateCategoryFormData();
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

	const handleCategoryFormData: ChangeEventHandler<HTMLInputElement> = (event) => {
		setCategoryFormData({ ...categoryFormData, [event.target.id]: event.target.value });
	};

	const clearCreateCategoryFormData = () => {
		setCategoryFormData({ name: '', location: '' });
	};

	const createCategory = () => {
		// Validate on the client first
		const isAllowed = validate(categoryFormData);
		isAllowed && categoryCreate.mutate(categoryFormData);
	};

	const deleteCategory = () => {
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
									value={categoryFormData.name}
									onChange={handleCategoryFormData}
								/>
								<p className="text-xs text-red-500">{errors.name}</p>
							</fieldset>
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="location">Location</label>
								<input
									id="location"
									type="text"
									placeholder="Where?"
									value={categoryFormData.location}
									onChange={handleCategoryFormData}
								/>
							</fieldset>
						</div>
						<Dialog.Actions>
							<button
								className="bg-green-500 px-2 py-2 rounded mr-2 text-xs uppercase"
								onClick={createCategory}
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
											onClick={deleteCategory}
										>
											Delete
										</button>
									</Dialog.Actions>
								</Dialog.Content>
							</Dialog.Root>
						</li>
					))
					: allCategories.isLoading ? <p>Loading...</p>
						: <p>No categories man... </p>
				}
			</ul>
		</div>
	);
};

export default Categories;
