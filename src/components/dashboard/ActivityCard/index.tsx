import React from 'react';
import DashboardPanel from "~/components/dashboard/DashboardPanel";
import cs from './ActivityCard.module.css';
import cn from 'classnames';
import { PersonAddOutline, CheckmarkSquareOutline } from '@styled-icons/evaicons-outline';

const ActivityCard = () => {
  return (
    <DashboardPanel.Card className="grid grid-cols-2">
      <div>
        <DashboardPanel.Titlebar
          title="Activity"
        ></DashboardPanel.Titlebar>
        <ul className="flex flex-col space-y-4 mt-12">
          <li className="flex items-center">
            <img src="/pfp.jpg" alt="" className="w-6 h-6 rounded-full object-cover mr-5" />
            <p className="text-bone flex space-x-1">
              <span>donovan12</span>
              <span className="text-bone-muted opacity-50">has recently</span>
              <span className="text-[#FF8DFA] cursor-pointer hover:underline">voted</span>
            </p>
          </li>
          <li className="flex items-center">
            <img src="/pfp.jpg" alt="" className="w-6 h-6 rounded-full object-cover mr-5" />
            <p className="text-bone flex space-x-1">
              <span>papa48</span>
              <span className="text-bone-muted opacity-50">has recently</span>
              <span className="text-[#FF8DFA] cursor-pointer hover:underline">voted</span>
            </p>
          </li>
          <li className="flex items-center">
            <img src="/pfp.jpg" alt="" className="w-6 h-6 rounded-full object-cover mr-5" />
            <p className="text-bone flex space-x-1">
              <span>papa48</span>
              <span className="text-bone-muted opacity-50">has recently</span>
              <span className="text-[#FF8DFA] cursor-pointer hover:underline">joined</span>
            </p>
          </li>
        </ul>
      </div>
      <div className="flex items-center justify-center border-l border-[#0C1116] -mb-9 -mt-11">
        <div className="flex flex-col space-y-9">
          <div className="flex items-center justify-center space-x-4">
            <div className="dashboard-icon-card w-9 h-9 rounded-xl flex items-center justify-center border border-[#111921]">
              <PersonAddOutline size={16} className="fill-[#8899AA]" />
            </div>
            <div>
              <h1 className="font-display text-[13px] text-white mb-1">12,200 users</h1>
              <p className="font-light text-xs text-[#9EFBDF]">+645 new today</p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="dashboard-icon-card w-9 h-9 rounded-xl flex items-center justify-center border border-[#111921]">
              <CheckmarkSquareOutline size={16} className="fill-[#8899AA]" />
            </div>
            <div>
              <h1 className="font-display text-[13px] text-white mb-1">12,200 votes</h1>
              <p className="font-light text-xs text-[#9EFBDF]">+64 new today</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardPanel.Card>
  );
};

export default ActivityCard;
