import React from 'react';
import DashboardPanel from "~/components/dashboard/DashboardPanel";
import InfiniteScroll from 'react-infinite-scroll-component';
import type { LogType } from '@prisma/client';
import { PersonAddOutline, CheckmarkSquareOutline, BarChartOutline } from '@styled-icons/evaicons-outline';
import { trpc } from '~/utils/trpc';
import cn from 'classnames';

const ActivityCard = () => {
  const { data, hasNextPage, fetchNextPage, status } = trpc.logs.getActivityLogs.useInfiniteQuery({}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const getLogTypeStr = (type: LogType) => {
    switch (type) {
      case 'VOTE':
        return 'voted';
      case 'REGISTER':
        return 'registered';
    }
  };

  return (
    <DashboardPanel.Card className="!flex-row">
      <div className="flex flex-col basis-6/12">
        <DashboardPanel.Titlebar
          title="Activity"
          className="!m-0"
        ></DashboardPanel.Titlebar>
        {/**
         * Remove Content custom horizontal padding/margin so we can use the provided one by the Card component,
         * as we are just using Content as an scrollable container.
        */}
        <DashboardPanel.Content id="scrollableContainer" className="!mx-0 !px-0">
          <InfiniteScroll
            dataLength={data?.pages.length || 0}
            next={fetchNextPage}
            hasMore={!!hasNextPage}
            loader={<p className="text-center text-sm mt-6 mb-6 text-bone-muted/50">Loading...</p>}
            endMessage={
              <div className="flex flex-col space-y-2 items-center text-sm mt-6 mb-6 text-bone-muted/50">
                <BarChartOutline size={24} />
                <p>You have reached the end</p>
              </div>
            }
            scrollableTarget="scrollableContainer"
          >
            <ul className="flex flex-col space-y-4 text-sm">
              {data?.pages.map((page) => {
                return page.logs.map((log) => {
                  return (
                    <li className="flex items-center" key={log.id}>
                      <img src="/pfp.jpg" alt="" className="w-6 h-6 rounded-full object-cover mr-5" />
                      <p className="text-bone flex space-x-1">
                        <span>{log.invoker.name || log.invoker.email?.split('@')[0]}</span>
                        <span className="text-bone-muted opacity-50">has recently</span>
                        <span className="text-[#FF8DFA] cursor-pointer hover:underline">{getLogTypeStr(log.type)}</span>
                      </p>
                    </li>
                  );
                });
              })}
            </ul>
          </InfiniteScroll>
        </DashboardPanel.Content>
      </div>


      <div className="flex items-center justify-center border-l border-[#0C1116] -mb-9 -mt-11 basis-6/12">
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
