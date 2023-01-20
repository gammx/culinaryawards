import React, { FC, HTMLAttributes } from 'react';
import Modal from 'react-modal';
import DataCardHeader from './DataCardHeader';
import DataCardTabs from './DataCardTabs';
import DataCardAnchor from './DataCardAnchor';
import { CloseOutline } from '@styled-icons/evaicons-outline';
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
		<div className={cn(cs.Wrapper, className, "h-full py-9")} {...props}>
			{children}
		</div>
	);
};

const DataCardContent: FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
	return (
		<div className={cn(className, "flex flex-col items-center")}>{children}</div>
	);
};

export default {
	Root: DataCardRoot,
	Content: DataCardContent,
	Header: DataCardHeader,
	Tabs: DataCardTabs,
	Tab: TabsContent,
	Anchor: DataCardAnchor,
};
