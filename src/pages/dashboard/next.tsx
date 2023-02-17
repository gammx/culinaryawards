import { useSession } from 'next-auth/react';
import { Particles } from '~/hooks/useParticles';
import withAdminSession from '~/hoc/withAdminSession';
import DashboardPanel from '~/components/dashboard/DashboardPanel';
import ParticipantsCard from '~/components/dashboard/ParticipantsCard/next';
import CategoriesCard from '~/components/dashboard/CategoriesCard';

const Dashboard = () => {
	const { data } = useSession();
	const user = data!!.user!!;

	return (
		<main
			className="w-screen h-screen flex flex-col relative bg-void"
		>
			<div className="absolute w-full h-full top-0 left-0 bg-[url('/space_grid.png')] bg-cover bg-center bg-no-repeat"></div>
			<Particles />
			<div className="flex flex-col basis-5/12 shrink-0">
				<div className="border basis-1/12"></div>
				<div className="border basis-11/12"></div>
			</div>
			<div className="flex basis-7/12 z-10" id="cards-row">
				<DashboardPanel.Root className="basis-3/12">
					<ParticipantsCard />
				</DashboardPanel.Root>
				<section className="basis-6/12">
				</section>
				<DashboardPanel.Root className="basis-3/12">
					<CategoriesCard />
				</DashboardPanel.Root>
			</div>
		</main>
	);
};

export default withAdminSession(Dashboard);
