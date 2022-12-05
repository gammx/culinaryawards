import { ChangeEventHandler, useState } from 'react';
import { trpc } from '~/utils/trpc';
import { categoryCreateSchema } from '~/utils/schemas/categories';
import * as Dialog from '@radix-ui/react-dialog';
import useZod from '~/hooks/useZod';

const Categories = () => {
	const [categoryFormData, setCategoryFormData] = useState({
		name: '',
		location: ''
	});
	const { validate, errors } = useZod(categoryCreateSchema);
	const allCategories = trpc.categories.getAllCategories.useQuery();
	const utils = trpc.useContext();
	const categoryCreate = trpc.categories.addNewCategory.useMutation({
		async onMutate({ name, location }) {
			await utils.categories.getAllCategories.cancel();
			const prevData = utils.categories.getAllCategories.getData();
			utils.categories.getAllCategories.setData(undefined,
				(old) => old && [...old, { id: '-1', name, location }]
			);
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.categories.getAllCategories.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.categories.getAllCategories.invalidate();
		}
	})
	const categoryDelete = trpc.categories.deleteCategory.useMutation({
		async onMutate({ categoryId }) {
			// Optimistically update to the new value
			await utils.categories.getAllCategories.cancel();
			const prevData = utils.categories.getAllCategories.getData();
			utils.categories.getAllCategories.setData(undefined,
				(old) => old && old.filter((category) => category.id !== categoryId)
			);
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

	/** It creates a new category validating on the client first */
	const createCategory = () => {
		const isAllowed = validate(categoryFormData);
		isAllowed && categoryCreate.mutate(categoryFormData);
	};

	return (
		<div>
			<div className="flex">
				<h1 className="text-2xl font-semibold">Categories</h1>
				<Dialog.Root>
					<Dialog.Trigger className="bg-green-500 px-2 cursor-pointer uppercase">
						+ Add new
					</Dialog.Trigger>
					<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
					<Dialog.Content className="bg-white rounded p-4 fixed top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 w-80">
						<Dialog.Title className="text-lg font-bold">Add New Category</Dialog.Title>
						<Dialog.Description className="mt-2 text-xs">Fill up the next fields</Dialog.Description>
						<div className="mt-2 flex flex-col space-y-4">
							<fieldset className="flex flex-col space-y-2">
								<label htmlFor="name">Name</label>
								<input
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
						<div className="mt-4 flex justify-end">
							<Dialog.Close className="bg-gray-200 px-2 py-2 rounded mr-2 text-xs uppercase">Cancel</Dialog.Close>
							<button
								className="bg-green-500 px-2 py-2 rounded mr-2 text-xs uppercase"
								onClick={createCategory}
							>
								Add
							</button>
						</div>
					</Dialog.Content>
				</Dialog.Root>
			</div>
			<ul>
				{allCategories.data && allCategories.data.length > 0
					? allCategories.data.map((category) => (
						<li key={category.id} className="flex">
							<span>{category.name}</span>
							<Dialog.Root>
								<Dialog.Trigger className="bg-red-500 px-2 cursor-pointer">
									x
								</Dialog.Trigger>
								<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
								<Dialog.Content className="bg-white rounded p-4 fixed top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 w-64">
									<Dialog.Title className="text-lg font-bold">
										Delete Category
									</Dialog.Title>
									<Dialog.Description className="mt-2 text-sm">
										Are you sure you want to delete this category?
									</Dialog.Description>
									<div className="flex justify-end mt-4">
										<Dialog.Close className="bg-gray-200 px-2 py-2 rounded mr-2 text-xs uppercase">Cancel</Dialog.Close>
										<button
											className="bg-red-500 px-2 py-2 rounded mr-2 text-xs uppercase"
											onClick={() => categoryDelete.mutate({ categoryId: category.id })}
										>
											Delete
										</button>
									</div>
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
