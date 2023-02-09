import { useSession } from 'next-auth/react';
import withAdminSession from '~/hoc/withAdminSession';
import { PlusOutline } from '@styled-icons/evaicons-outline';
import DashboardPanel from '~/components/dashboard/DashboardPanel';

const Dashboard = () => {
	const { data } = useSession();
	const user = data!!.user!!;

	return (
		<main
			className="w-screen h-screen flex flex-col relative bg-void"
		>
			<div className="absolute w-full h-full top-0 left-0 bg-[url('/space_grid.png')] bg-cover bg-center bg-no-repeat"></div>
			<div className="flex flex-col basis-5/12 shrink-0">
				<div className="border basis-1/12"></div>
				<div className="border basis-11/12"></div>
			</div>
			<div className="flex basis-7/12 z-10" id="cards-row">
				<DashboardPanel.Root className="basis-3/12">
					<DashboardPanel.Card>
						<DashboardPanel.Titlebar title="Participants">
							<DashboardPanel.IconButton icon={PlusOutline} />
						</DashboardPanel.Titlebar>
						<DashboardPanel.Input type="text" />
						<DashboardPanel.Content>
							Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quam veritatis quo perspiciatis voluptates tempora laboriosam. Omnis laborum exercitationem, quo eaque molestiae quasi saepe! Doloribus minima, corporis vitae iure placeat voluptatibus?
							Aliquam minus ullam pariatur iure numquam obcaecati unde sapiente reprehenderit eligendi, dolore inventore quia assumenda ipsam voluptate beatae ducimus nisi cumque atque, dignissimos sed mollitia. Fugiat cupiditate blanditiis placeat voluptatem?
							Architecto, quam! Blanditiis beatae, officia exercitationem modi quas debitis enim suscipit voluptas excepturi fugit laudantium tenetur soluta corrupti corporis, atque pariatur natus tempora sunt ratione molestiae porro hic nulla similique.
							Quasi necessitatibus vel vero temporibus facere blanditiis commodi consequatur. Quod commodi architecto perspiciatis ullam amet, ipsa voluptatibus consequuntur dignissimos quia nulla aliquam rerum alias tempora mollitia minima provident sunt laboriosam!
							Est doloribus odio architecto? Ab corrupti, iste suscipit sapiente corporis asperiores recusandae, debitis dicta dignissimos sit laboriosam quis. At facere vitae omnis quisquam? Velit possimus repudiandae inventore accusantium molestias nulla.
							Harum, maxime vero repudiandae cumque ea optio sed, blanditiis itaque natus commodi minima rem veritatis quibusdam aut alias odit quia excepturi tempora voluptates dolor exercitationem. Pariatur dolores iste impedit dolore!
							Cumque sit eos sunt pariatur quas, rerum voluptatum laboriosam, temporibus aliquam quasi dolorum nisi suscipit in architecto commodi itaque repellendus nesciunt reiciendis quis blanditiis deserunt. Necessitatibus deserunt aperiam repudiandae ea!
							Ratione ipsum consequatur quia possimus, veritatis libero recusandae fuga expedita assumenda perspiciatis. Dolor quidem repudiandae debitis tenetur saepe at similique obcaecati necessitatibus, corrupti voluptates commodi officiis officia, laboriosam eos distinctio.
							Assumenda nobis quae eum accusamus, est tenetur. Delectus nemo labore possimus libero. Iure unde temporibus et iste minima, quo explicabo neque ratione optio dolorum nisi, natus nobis tenetur necessitatibus magni?
							Mollitia odit corrupti iusto dolore quae ullam, asperiores ut quo voluptatibus ab sapiente alias, eaque aliquam voluptas unde pariatur? Voluptas, error ipsum culpa ad blanditiis quia ratione vero consectetur nemo!
						</DashboardPanel.Content>
					</DashboardPanel.Card>
				</DashboardPanel.Root>
				<section className="basis-6/12">
				</section>
				<section className="basis-3/12">
				</section>
			</div>
		</main>
	);
};

export default withAdminSession(Dashboard);
