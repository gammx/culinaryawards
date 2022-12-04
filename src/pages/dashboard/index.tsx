import { useSession } from 'next-auth/react';
import Categories from '~/components/dashboard/Categories';
import withAdminSession from '~/hoc/withAdminSession';

const Dashboard = () => {
	const { data } = useSession();
	const user = data!!.user!!;

	return (
		<>
			<p>This page is protected {user.email}</p>
			<Categories />
		</>
	);
};

export default withAdminSession(Dashboard);
