import React from 'react';
import cs from './ActivityCard.module.css';
import cn from 'classnames';

const ActivityCard = () => {
  return (
    <div className={cn(cs.Wrapper, 'h-full py-9 px-8')}>
      <h1 className="font-medium text-2xl">Activity</h1>
    </div>
  );
};

export default ActivityCard;
