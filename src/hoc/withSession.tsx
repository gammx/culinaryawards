import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const withSession = (Component: React.ComponentType) => {
	const authenticatedComponent = (props: any) => {
		const router = useRouter();
		const { status } = useSession({
			onUnauthenticated: () => router.replace('/'),
			required: true
		});

		if (status === 'loading') return <div></div>;

		return <Component {...props} />;
	};

	return authenticatedComponent;
};

export default withSession;