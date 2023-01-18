import { useSession } from 'next-auth/react';
import ParticipantsCard from '~/components/dashboard/ParticipantsCard';
import CategoriesCard from '~/components/dashboard/CategoriesCard';
import ActivityCard from '~/components/dashboard/ActivityCard';
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
				<section className="basis-3/12">
					<ParticipantsCard />
				</section>
				<section className="basis-6/12">
					<ActivityCard />
				</section>
				<section className="basis-3/12">
					<CategoriesCard />
				</section>
			</div>
		</div>
	);
};

export default withAdminSession(Dashboard);
