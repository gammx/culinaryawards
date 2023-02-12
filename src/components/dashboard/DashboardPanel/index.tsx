import React, { FC, HTMLAttributes } from 'react';
import DashboardCardContent from './DashboardCardContent';
import DashboardCardInput from './DashboardCardInput';
import DashboardIconButton from './DashboardIconButton';
import DashboardPanelCard from './DashboardPanelCard';
import DashboardPanelTitlebar from './DashboardPanelTitlebar';
import DashboardPanelTabs from './DashboardPanelTabs';
import DashboardCardProfile from './DashboardCardProfile';
import cn from 'classnames';
import { TabsContent } from '@radix-ui/react-tabs';

interface DataCardRootProps extends HTMLAttributes<HTMLDivElement> { }

const DataCardRoot: FC<DataCardRootProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn(className, "h-[560px] p-6")} {...props}>
      {children}
    </div>
  );
};

export default {
  Root: DataCardRoot,
  Titlebar: DashboardPanelTitlebar,
  Card: DashboardPanelCard,
  Content: DashboardCardContent,
  Input: DashboardCardInput,
  IconButton: DashboardIconButton,
  Tabs: DashboardPanelTabs,
  Tab: TabsContent,
  Profile: DashboardCardProfile,
};