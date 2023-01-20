import React from 'react';
import { GlobeOutline, Globe2Outline, ExternalLinkOutline } from '@styled-icons/evaicons-outline';
import cn from 'classnames';

interface DataCardAnchorProps {
	icon?: 'web' | 'maps';
	href: string;
	children?: string;
}

const DataCardAnchor: React.FC<DataCardAnchorProps> = ({
	icon = 'web',
	href,
	children,
}) => {
	return (
		<div className="px-8 flex items-center mb-4">
			<div className={cn("rounded-lg flex items-center justify-center w-6 h-6 mr-8", {
				'bg-blue-muted': icon === 'web',
				'bg-yellow-muted': icon === 'maps',
			})}>
				{icon === 'web' && <GlobeOutline size={18} className="text-blue" />}
				{icon === 'maps' && <Globe2Outline size={18} className="text-yellow" />}
			</div>
			<p className="flex-1 text-sm">{children || href}</p>
			<ExternalLinkOutline role="button" className="text-black/30 hover:text-black" size={18} />
		</div>
	);
};

export default DataCardAnchor;
