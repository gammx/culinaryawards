import React from 'react';
import cn from 'classnames';
import _ from 'underscore.string';
import { PinOutline, Link2Outline } from '@styled-icons/evaicons-outline';

interface DashboardCardProfileProps extends React.HTMLAttributes<HTMLDivElement> {
	thumbnail: string;
	name: string;
	mapsAnchor: string | null;
	siteAnchor: string | null;
}

const DashboardCardProfile: React.FC<DashboardCardProfileProps> = ({
	thumbnail,
	name,
	mapsAnchor,
	siteAnchor,
	className,
	...props
}) => {
	return (
		<div className={cn("flex", className)}>
			{/* ------------ PARTICIPANT LINKS ------------ */}
			<div>
				<div className="py-3 px-2.5 border border-linear-tertiary flex flex-col rounded-2xl space-y-2.5 text-ink-secondary">
					{mapsAnchor && <a href={mapsAnchor} target="_blank" className="flex"><PinOutline size={18} className="cursor-pointer hover:fill-pastel-pink" /></a>}
					{siteAnchor && <a href={siteAnchor} target="_blank" className="flex"><Link2Outline size={18} className="cursor-pointer hover:fill-pastel-yellow" /></a>}
				</div>
			</div>

			{/* ------------ PARTICIPANT THUMBNAIL ------------ */}
			<div className="flex-1 flex justify-center relative">
				<img src={thumbnail} alt="" className="w-32 h-32 rounded-circle shadow-xl shadow-void-high z-10" />
				<img src="/participant_avatar_overlay.png" alt="" className="absolute -bottom-4 left-32" />
			</div>

			{/* ------------ PARTICIPANT NAME ------------ */}
			<div>
				<h1 className="font-display font-medium text-ink -scale-[1] vertical-rl">{_.truncate(name, 14)}</h1>
			</div>
		</div>
	);
};

export default DashboardCardProfile;
