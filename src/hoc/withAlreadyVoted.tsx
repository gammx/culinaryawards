import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";

const withAlreadyVoted = (Component: React.ComponentType) => {
	const authenticatedComponent = (props: any) => {
		const router = useRouter();
		const { isLoading: isChecking } = trpc.votes.hasAlreadyVoted.useQuery(undefined, {
			onSuccess(data) {
				if (!data) router.replace('/vote');
			}
		});

		if (isChecking) return <div></div>;

		return <Component {...props} />;
	};

	return authenticatedComponent;
};

export default withAlreadyVoted;