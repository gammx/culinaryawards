import { useSession } from 'next-auth/react';
import withAdminSession from '~/hoc/withAdminSession';
import { trpc } from '~/utils/trpc';

const Dashboard = () => {
	const { data } = useSession();
	const user = data!!.user!!;

	const allCategories = trpc.categories.getAllCategories.useQuery();

	return (
		<>
			<p>This page is protected {user.email}</p>
			<ul>
				{allCategories.data && allCategories.data.length > 0
					? allCategories.data.map((category) => (
						<li key={category.id}>{category.name}</li>
					))
					: allCategories.isLoading ? <p>Loading...</p>
					: <p>No categories man... </p>
				}
			</ul>
		</>
	);
};

export default withAdminSession(Dashboard);
