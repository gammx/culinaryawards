import React from 'react';
import DashboardPanel from "~/components/dashboard/DashboardPanel";
import Button from '~/components/UI/Button';
import InfiniteScroll from 'react-infinite-scroll-component';
import cn from 'classnames';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { Category, Logs, LogType, Participant, User, Votes } from '@prisma/client';
import { trpc } from '~/utils/trpc';
import {
  PersonAddOutline,
  CheckmarkSquareOutline,
  BarChartOutline, EmailOutline,
  HashOutline,
  CloseSquareOutline,
  PersonDeleteOutline,
  SmilingFaceOutline,
  AlertTriangleOutline,
} from '@styled-icons/evaicons-outline';

interface CachedVotes {
  [key: string]: (Votes & {
    category: Category;
    participant: Participant;
  })[];
}

type Log = Logs & { invoker: User; };

const ActivityCard = () => {
  const utils = trpc.useContext();
  const { data: activityLogs, hasNextPage, fetchNextPage, status } = trpc.logs.getActivityLogs.useInfiniteQuery({}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
  });
  const [expandedLog, setExpandedLog] = React.useState<Log | null>(null);
  // Check if the invoker of the currently expanded log has already voted to prevent removing unexisting votes
  const { data: hasInvokerVoted, refetch: refetchHasUserVoted } = trpc.votes.hasVotes.useQuery({ userId: expandedLog?.invokerId! }, {
    enabled: !!expandedLog && expandedLog.type === 'VOTE',
  });
  const votesRemove = trpc.votes.removeVotes.useMutation();
  const userRemove = trpc.auth.deleteUser.useMutation({
    async onMutate(variables) {
      // Handle optimistic update, removing the logs invoked by the user we're removing
      await utils.logs.getActivityLogs.cancel();
      const prevData = utils.logs.getActivityLogs.getInfiniteData();
      utils.logs.getActivityLogs.setInfiniteData({ cursor: undefined }, (prev) => ({
        pageParams: prev?.pageParams || [],
        pages: prev?.pages.map((page) => {
          return {
            ...page,
            logs: page.logs.filter((log) => log.invokerId !== variables.userId),
          };
        }) || []
      }));
      
      setExpandedLog(null);
      return { prevData };
    },
    onError(err, variables, context) {
      context && utils.logs.getActivityLogs.setInfiniteData({ cursor: undefined }, context.prevData);
    }
  });
  // We cache the votes so we don't have to refetch them when the user clicks on the same user again
  const [cachedVotes, setCachedVotes] = React.useState<CachedVotes>({});
  const { isRefetching: isRefetchingVotes, error: refetchingVotesError } = trpc.votes.getVotes.useQuery({ userId: expandedLog?.invokerId! }, {
    // Don't fetch any vote until the user clicks on some user
    enabled: !!expandedLog && expandedLog.type === 'VOTE' && !cachedVotes[expandedLog.invokerId],
    refetchOnWindowFocus: false,
    retry(failureCount, error) {
      // Don't retry if the user has no votes
      if (error?.message === 'VOTES_NOT_FOUND') return false;

      return true;
    },
    onSuccess(data) {
      const userId = data[0]?.userId;
      if (!userId) return;

      setCachedVotes((prev) => {
        return { ...prev, [userId]: data };
      });
    },
  });

  const getLogTypeStr = (log: Log) => {
    switch (log.type) {
      case 'VOTE':
        return 'voted';
      case 'REGISTER':
        return 'registered';
      case 'USER_DELETE':
        return `removed @${log.subject}`;
    }
  };

  /** Removes the expanded log invoker votes */
  const removeVotes = async () => {
    if (!expandedLog?.invokerId) return;

    await votesRemove.mutateAsync({ userId: expandedLog.invokerId });
    refetchHasUserVoted();
  };

  /** Removes the expanded log invoker */
  const removeUser = async () => {
    if (!expandedLog?.invokerId) return;
    userRemove.mutate({ userId: expandedLog.invokerId });
  };

  /** It opens the side view of the card */
  const expandLog = (log: Log) => {
    // These logs don't contain a lot of information, so we don't need to expand them
    if (["USER_DELETE"].includes(log.type)) return;

    setExpandedLog(log);
  };

  /** Returns the side view content based on the log type */
  const getExpandedLogView = () => {
    if (!expandedLog) return null;

    switch (expandedLog.type) {
      // View showing the user votes
      case 'VOTE':
        return (
          <>
            <DashboardPanel.Titlebar title="Votes" onBack={() => setExpandedLog(null)}>
              <div className="flex space-x-2.5 items-center text-bone-muted text-sm">
                <img src="/pfp.jpg" alt="" className="w-4 h-4 rounded-full object-cover" />
                <p>{expandedLog.invoker.name || expandedLog.invoker.email?.split('@')[0]}</p>
              </div>
            </DashboardPanel.Titlebar>
            <DashboardPanel.Content id="scrollableContainer" className="!mx-0 !px-0">
              {(!cachedVotes[expandedLog.invokerId] || isRefetchingVotes) && !refetchingVotesError ? (
                <p className="text-center text-sm mt-6 mb-6 text-bone-muted/50">Loading...</p>
              ) : (
                <ul className="flex flex-col space-y-6">
                  {cachedVotes[expandedLog.invokerId]?.map((vote) => (
                    <li key={vote.id} className="flex space-x-3 items-start">
                      <div><img src={vote.participant.thumbnail} alt="" className="w-5 h-5 object-cover rounded-full" /></div>
                      <div>
                        <p className="font-display text-bone mb-1 leading-none">{vote.category.name}</p>
                        <p className="text-xs text-bone-muted">{vote.participant.name}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* DISPLAY ERROR WHILE FETCHING USER VOTES -------------------- */}
              {refetchingVotesError && (
                <div className="flex flex-col items-center">
                  <AlertTriangleOutline size={24} className="fill-bone-muted/50 mt-6" />
                  <p className="text-bone-muted font-display my-2">Whoops!</p>
                  <p className="text-center text-sm text-bone-muted/50">
                    An error occurred while fetching the votes. Probably the user has no votes.
                  </p>
                </div>
              )}
            </DashboardPanel.Content>
          </>
        );
      case 'REGISTER':
        return (
          <>
            <DashboardPanel.Titlebar title="Profile" onBack={() => setExpandedLog(null)}></DashboardPanel.Titlebar>
            <div className="flex flex-col space-y-5 items-center">
              <img src="/pfp.jpg" alt="" className="w-20 h-20 rounded-full object-cover mt-6" />
              <div>
                <p className="text-bone text-center font-display text-lg">{expandedLog.invoker.name || expandedLog.invoker.email?.split('@')[0]}</p>
                <div className="flex items-center justify-center space-x-2 text-bone-muted">
                  <SmilingFaceOutline size={16} />
                  <p className="text-xs uppercase">{expandedLog.invoker.role}</p>
                </div>
              </div>
              <div className="flex space-x-2.5">
                <a
                  className="w-8 h-8 flex items-center justify-center neon-shadow--blue border border-neon-blue text-neon-blue rounded-xl hover:opacity-80"
                  title={`Contact ${expandedLog.invoker.email}`}
                  href={`mailto:${expandedLog.invoker.email}`}
                >
                  <EmailOutline size={16} />
                </a>
                <button
                  className="w-8 h-8 flex items-center justify-center neon-shadow--yellow border border-neon-yellow text-neon-yellow rounded-xl hover:opacity-80"
                  title="Copy ID"
                  onClick={() => navigator.clipboard.writeText(expandedLog.invoker.id)}
                >
                  <HashOutline size={16} />
                </button>
                <AlertDialog.Root>
                  <AlertDialog.Trigger asChild disabled={!hasInvokerVoted}>
                    <button
                      className={cn("w-8 h-8 flex items-center justify-center neon-shadow--pink border border-neon-pink text-neon-pink rounded-xl hover:opacity-80", {
                        'opacity-30 pointer-events-none': !hasInvokerVoted,
                      })}
                      title="Remove User Votes"
                    >
                      <CloseSquareOutline size={16} />
                    </button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="bg-void/70 inset-0 fixed z-50" />
                    <AlertDialog.Content className="bg-void-high/30 border border-linear/10 backdrop-blur rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] max-h-[85vh] p-6 focus:outline-none z-50">
                      <AlertDialog.Title className="m-0 text-white font-medium font-display text-xl mb-2">Remove Votes</AlertDialog.Title>
                      <AlertDialog.Description className="text-bone-muted mb-8 leading-6 text-sm">
                        This action cannot be undone, this will remove all the votes sent by this user.
                      </AlertDialog.Description>
                      <div className="flex space-x-2.5">
                        <AlertDialog.Cancel asChild>
                          <Button outlined variant="tertiary">Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <Button className="!border-neon-pink !text-neon-pink" outlined onClick={removeVotes}>Remove</Button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
                <AlertDialog.Root>
                  <AlertDialog.Trigger asChild>
                    <button
                      className="w-8 h-8 flex items-center justify-center neon-shadow--purple border border-neon-purple text-neon-purple rounded-xl hover:opacity-80"
                      title="Delete User"
                    >
                      <PersonDeleteOutline size={16} />
                    </button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="bg-void/70 inset-0 fixed z-50" />
                    <AlertDialog.Content className="bg-void-high/30 border border-linear/10 backdrop-blur rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] max-h-[85vh] p-6 focus:outline-none z-50">
                      <AlertDialog.Title className="m-0 text-white font-medium font-display text-xl mb-2">Remove User</AlertDialog.Title>
                      <AlertDialog.Description className="text-bone-muted mb-8 leading-6 text-sm">
                        This action cannot be undone, this will remove the user entirely from our servers.
                      </AlertDialog.Description>
                      <div className="flex space-x-2.5">
                        <AlertDialog.Cancel asChild>
                          <Button outlined variant="tertiary">Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <Button
                            outlined
                            className="!border-neon-purple !text-neon-purple"
                            onClick={removeUser}
                          >
                            Remove
                          </Button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </div>
            </div>
          </>
        );
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
            dataLength={activityLogs?.pages.length || 0}
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
              {activityLogs?.pages.map((page) => {
                return page.logs.map((log) => {
                  return (
                    <li className="flex items-center" key={log.id}>
                      <img src="/pfp.jpg" alt="" className="w-6 h-6 rounded-full object-cover mr-5" />
                      <p className="text-bone flex space-x-1">
                        <span>{log.invoker.name || log.invoker.email?.split('@')[0]}</span>
                        <span className="text-bone-muted opacity-50">has recently</span>
                        <span className="text-[#FF8DFA] cursor-pointer hover:underline" onClick={() => expandLog(log)}>{getLogTypeStr(log)}</span>
                      </p>
                    </li>
                  );
                });
              })}
            </ul>
          </InfiniteScroll>
        </DashboardPanel.Content>
      </div>


      <div className={cn("flex border-l border-[#0C1116] -mb-9 -mt-11 basis-6/12", {
        'items-center justify-center': !expandedLog,
        'flex-col pb-9 pt-11 pl-8': !!expandedLog,
      })}>
        {!!expandedLog ? getExpandedLogView() : (
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
        )}
      </div>
    </DashboardPanel.Card>
  );
};

export default ActivityCard;
