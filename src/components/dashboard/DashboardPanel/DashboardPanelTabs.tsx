import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { MenuOutline, EditOutline, TrashOutline, ChevronLeftOutline } from '@styled-icons/evaicons-outline';


interface DashboardPanelTabs extends React.HTMLAttributes<HTMLDivElement> {
  state: [string, (value: string) => void],
  onBack?: () => void,
}

const DashboardPanelTabs: React.FC<DashboardPanelTabs> = ({
  state: [value, setValue],
  onBack,
  children,
}) => {
  return (
    <Tabs.Root value={value} onValueChange={setValue} defaultValue="info" className="relative flex flex-col w-full h-full">
      <div className="flex items-center mb-6 space-x-2.5">
        {onBack && <ChevronLeftOutline role="button" size={24} className="cursor-pointer fill-ink/60 hover:fill-ink" onClick={onBack} />}
        <Tabs.List className="w-full flex justify-between p-1 bg-void-high rounded-full text-ink-dark/50 max-w-[300px] self-center">
          <Tabs.Trigger value="info" className="flex items-center justify-center h-7 w-12 rounded-full group data-[state=active]:bg-ink-dark/10">
            <MenuOutline size={20} className="group-data-[state=active]:text-ink" />
          </Tabs.Trigger>
          <Tabs.Trigger value="edit" className="flex items-center justify-center h-7 w-12 rounded-full group data-[state=active]:bg-ink-dark/10">
            <EditOutline size={20} className="group-data-[state=active]:text-ink" />
          </Tabs.Trigger>
          <Tabs.Trigger value="delete" className="flex items-center justify-center h-7 w-12 rounded-full group data-[state=active]:bg-ink-dark/10">
            <TrashOutline size={20} className="group-data-[state=active]:text-ink" />
          </Tabs.Trigger>
        </Tabs.List>
      </div>
      <div className="overflow-y-auto dashboard-card-scrollbar -mx-8 px-8 pt-4 dashboard-card-tab">
        {children}
      </div>
    </Tabs.Root>
  );
};

export default DashboardPanelTabs;
