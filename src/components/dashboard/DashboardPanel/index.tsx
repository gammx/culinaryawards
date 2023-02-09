import React, { FC, HTMLAttributes } from 'react';
import DashboardCardContent from './DashboardCardContent';
import DashboardCardInput from './DashboardCardInput';
import DashboardIconButton from './DashboardIconButton';
import DashboardPanelCard from './DashboardPanelCard';
import DashboardPanelTitlebar from './DashboardPanelTitlebar';
import cn from 'classnames';

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
};