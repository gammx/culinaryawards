import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const withAdminSession = (Component: React.ComponentType) => {
	const authenticatedComponent = (props: any) => {
		const router = useRouter();
		const { data: session, status } = useSession({
			onUnauthenticated: () => router.replace('/'),
			required: true
		});

		useEffect(() => {
			if (!session) return;
			if (session?.user?.role !== 'ADMIN') router.replace('/');
		}, [session]);

		if (status === 'loading') return <div></div>;

		return <Component {...props} />;
	};

	return authenticatedComponent;
};

export default withAdminSession;