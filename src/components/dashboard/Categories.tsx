import * as Dialog from '@radix-ui/react-dialog';
import { trpc } from '~/utils/trpc';

const Categories = () => {
	const allCategories = trpc.categories.getAllCategories.useQuery();
	const utils = trpc.useContext();
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

	return (
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
									<Dialog.Close className="bg-gray-200 px-2 py-2 rounded mr-2 text-xs uppercase">CANCEL</Dialog.Close>
									<button
										className="bg-red-500 px-2 py-2 rounded mr-2 text-xs uppercase"
										onClick={() => categoryDelete.mutate({ categoryId: category.id })}
									>
										DELETE
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
	);
};

export default Categories;
