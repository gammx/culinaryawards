import withAdminSession from '~/hoc/withAdminSession';
import DashboardPanel from '~/components/dashboard/DashboardPanel';
import ParticipantsCard from '~/components/dashboard/ParticipantsCard';
import CategoriesCard from '~/components/dashboard/CategoriesCard';
import ActivityCard from '~/components/dashboard/ActivityCard';
import VotesCard from '~/components/VotesCard';
import { useSession } from 'next-auth/react';
import { Tooltip } from 'react-tooltip';

const Dashboard = () => {
	const { data } = useSession();
	const user = data!!.user!!;

	return (
		<main
			className="w-screen h-screen flex flex-col relative bg-void overflow-hidden"
		>
			<div className="absolute w-full h-full top-0 left-0 bg-[url('/space_grid.png')] bg-cover bg-center bg-no-repeat"></div>
			<div className="flex flex-col basis-5/12 shrink-0">
				<div className="basis-1/12"></div>
				<div className="basis-11/12 flex mx-6 space-x-5 z-10">
					<div className="w-[350px] h-full">
						<VotesCard />
					</div>
					<div className="flex-1 w-full h-full border"></div>
					<div className="w-[395px] h-full border"></div>
				</div>
			</div>
			<div className="flex basis-7/12 z-10" id="cards-row">
				<DashboardPanel.Root className="basis-3/12">
					<ParticipantsCard />
				</DashboardPanel.Root>
				<DashboardPanel.Root className="basis-6/12">
					<ActivityCard />
				</DashboardPanel.Root>
				<DashboardPanel.Root className="basis-3/12">
					<CategoriesCard />
				</DashboardPanel.Root>
			</div>
			<Tooltip
				id="dashboard-ttip"
				place="top"
				className="!bg-ink-secondary !text-black !opacity-100 !z-50 !rounded-sm !px-2 !py-1 !leading-none !text-sm"
			></Tooltip>
		</main>
	);
};

export default withAdminSession(Dashboard);
