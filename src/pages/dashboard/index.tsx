import { useSession } from 'next-auth/react';
import Categories from '~/components/dashboard/Categories';
import Participants from '~/components/dashboard/Participants';
import withAdminSession from '~/hoc/withAdminSession';

const Dashboard = () => {
	const { data } = useSession();
	const user = data!!.user!!;

	return (
		<div className="bg-black flex flex-col w-full h-screen">
			<div className="flex flex-col flex-1">
				<div className="border basis-2/12"></div>
				<div className="border basis-1/12"></div>
				<div className="border basis-9/12"></div>
			</div>
			<div className="flex basis-7/12">
				<div className="border basis-3/12"></div>
				<div className="border basis-6/12"></div>
				<div className="border basis-3/12"></div>
			</div>
			{/*<p>This page is protected {user.email}</p>
			<Categories />
			<Participants />*/}

		</div>
	);
};

export default withAdminSession(Dashboard);
