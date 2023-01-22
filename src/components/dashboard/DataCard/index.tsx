import React, { FC, HTMLAttributes } from 'react';
import DataCardHeader from './DataCardHeader';
import DataCardTabs from './DataCardTabs';
import DataCardAnchor from './DataCardAnchor';
import DataCardTitleBar from './DataCardTitleBar';
import { TabsContent } from '@radix-ui/react-tabs';
import cs from './DataCard.module.css';
import cn from 'classnames';

interface DataCardRootProps extends HTMLAttributes<HTMLDivElement> {}

const DataCardRoot: FC<DataCardRootProps> = ({
	children,
	className,
	...props
}) => {
	return (
		<div className={cn(cs.Wrapper, className, "h-full py-9 DataCard")} {...props}>
			{children}
		</div>
	);
};

const DataCardContent: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
	const contentRef = React.useRef<HTMLDivElement>(null);
	return (
		<div
			ref={contentRef}
			className={cn(className, "flex flex-col h-[26.6rem] overflow-y-auto")}
			{...props}
		/>
	);
};

export default {
	Root: DataCardRoot,
	Content: DataCardContent,
	Header: DataCardHeader,
	Tabs: DataCardTabs,
	Tab: TabsContent,
	Anchor: DataCardAnchor,
	TitleBar: DataCardTitleBar,
};
