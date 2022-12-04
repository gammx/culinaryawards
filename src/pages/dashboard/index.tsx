import { useSession } from 'next-auth/react';
import withAdminSession from '~/hoc/withAdminSession';

const Dashboard = () => {
	const { data } = useSession();
	const user = data!!.user!!;

	return (
		<>
			<p>This page is protected {user.email}</p>
		</>
	);
};

export default withAdminSession(Dashboard);
