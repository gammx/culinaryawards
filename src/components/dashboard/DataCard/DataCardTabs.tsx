import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { MenuOutline, EditOutline, TrashOutline } from '@styled-icons/evaicons-outline';


interface DataCardTabsProps extends React.HTMLAttributes<HTMLDivElement> {
	state: [string, (value: string) => void],
}

const DataCardTabs: React.FC<DataCardTabsProps> = ({
	state: [value, setValue],
	children,
}) => {
	return (
		<Tabs.Root value={value} onValueChange={setValue} defaultValue="info" className="flex flex-col w-full h-full">
			<Tabs.List className="flex justify-between px-8">
				<Tabs.Trigger value="info" className="flex items-center justify-center h-12 group">
					<MenuOutline size={24} className="text-black/30 group-data-[state=active]:text-black" />
				</Tabs.Trigger>
				<Tabs.Trigger value="edit" className="flex items-center justify-center h-12 group">
					<EditOutline size={24} className="fill-black/30 group-data-[state=active]:fill-black" />
				</Tabs.Trigger>
				<Tabs.Trigger value="delete" className="flex items-center justify-center h-12 group">
					<TrashOutline size={24} className="fill-black/30 group-data-[state=active]:fill-black" />
				</Tabs.Trigger>
			</Tabs.List>
			<div className="h-px my-4 bg-white/20"></div>
			{children}
		</Tabs.Root>
	);
};

export default DataCardTabs;
