import React from 'react';
import cn from 'classnames';
import * as Progress from '@radix-ui/react-progress';
import { trpc } from '~/utils/trpc';
import { ArrowRightOutline, ArrowLeftOutline, CheckmarkSquareOutline, PaperPlaneOutline } from '@styled-icons/evaicons-outline';
import { Participant } from '@prisma/client';
import { useRouter } from 'next/router';

interface Vote {
  categoryId: string;
  participantId: string;
}

const Vote = () => {
  const router = useRouter();
  /** Progress of the votation slider */
  const [progress, setProgress] = React.useState(0);
  const [currentCategory, setCurrentCategory] = React.useState(0);
  const { data: categories } = trpc.categories.getAllCategoriesWithParticipants.useQuery();
  const votesSend = trpc.votes.sendVotes.useMutation({
    onSettled(data) {
      router.replace('/voted');
    }
  });
  const [votes, setVotes] = React.useState<Vote[]>([]);

  /** It checks if the user has voted for a certain participant on the current category */
  const hasVoted = (participant: Participant) => {
    if (!categories) return false;

    const category = categories[currentCategory];
    const vote = votes.find((vote) => vote.categoryId === category?.id);
    return vote?.participantId === participant.id;
  };

  /** It checks if the user has already voted for the current category of the slider */
  const hasVotedCurrentCategory = () => {
    if (!categories) return false;

    const category = categories[currentCategory];
    const vote = votes.find((vote) => vote.categoryId === category?.id);
    return !!vote;
  };

  /** It checks if the current category of the slider is the last one */
  const isLastCategory = () => {
    if (!categories) return false;
    return currentCategory === categories.length - 1;
  };

  /** It votes a participant for the current category */
  const setVote = (participant: Participant) => {
    if (!categories) return;

    const category = categories[currentCategory];
    if (category) {
      setVotes((prev) => {
        const newVotes = [...prev];
        const voteIndex = newVotes.findIndex((vote) => vote.categoryId === category.id);
        if (voteIndex !== -1) {
          newVotes[voteIndex]!.participantId = participant.id;
        } else {
          newVotes.push({
            categoryId: category.id,
            participantId: participant.id
          });
        }
        return newVotes;
      });
    }
  };

  /** It executes the send votes action */
  const sendVotes = () => votesSend.mutate({ votes });

  const goToNextCategory = () => {
    if (!categories) return;

    const progressPerCategory = 100 / categories.length;
    setProgress((prev) => prev + progressPerCategory);
    setCurrentCategory((prev) => prev + 1);
  };

  const goToPreviousCategory = () => {
    if (!categories) return;

    const progressPerCategory = 100 / categories.length;
    setProgress((prev) => prev - progressPerCategory);
    setCurrentCategory((prev) => prev - 1);
  };

  return (
    <div className="bg-black text-white h-screen w-full flex flex-col">
      <Progress.Root value={progress} className="w-full overflow-hidden h-2" style={{ transition: 'translateZ(0)' }}>
        <Progress.Indicator
          className="bg-bone w-full h-full transition-all duration-500"
          style={{ transform: `translateX(-${100 - progress}%)` }}
        />
      </Progress.Root>
      {categories && (
        <>
          {/** HEADER --------------------- */}
          <div className="flex justify-between items-center px-44 pt-16">
            <div>
              <h1 className="font-display text-5xl font-medium">{categories[currentCategory]?.name}</h1>
              {categories[currentCategory]?.location && (
                <div className="py-[2px] px-2 bg-pink-vivid font-medium inline-block uppercase my-5">{categories[currentCategory]?.location}</div>
              )}
            </div>
            <div className="flex space-x-4">
              {currentCategory > 0 && (
                <button
                  className="border border-bone font-display font-bold uppercase inline-flex p-3 transition-opacity duration-300"
                  onClick={goToPreviousCategory}
                >
                  <ArrowLeftOutline className="mr-2" size={24} />
                  Back
                </button>
              )}
              <button
                className={cn("bg-bone text-black font-display font-bold uppercase inline-flex items-center p-3 transition-opacity duration-300", {
                  "cursor-not-allowed opacity-10": !hasVotedCurrentCategory(),
                  "bg-yellow": isLastCategory(),
                })}
                disabled={!hasVotedCurrentCategory()}
                onClick={isLastCategory() ? sendVotes : goToNextCategory}
              >
                {isLastCategory() ? (
                  <>
                    <PaperPlaneOutline className="mr-2" size={18} />
                    Finish
                  </>
                ) : (
                  <>
                    <ArrowRightOutline className="mr-2" size={24} />
                    Next
                  </>
                )}
              </button>
            </div>
          </div>

          {/** PARTICIPANTS --------------------- */}
          <div className="w-full grid grid-cols-votation items-center justify-center gap-16 my-10">
            {categories[currentCategory]?.participants.map((participant) => (
              <div
                key={participant.id}
                className="relative h-[300px] w-[300px] cursor-pointer"
                onClick={() => setVote(participant)}
              >
                <img
                  src={participant.thumbnail}
                  alt={`${participant.name} (Thumbnail)`}
                  className={cn("w-full h-full object-cover", {
                    "grayscale": !hasVoted(participant),
                  })}
                />
                {hasVoted(participant) ? (
                  <>
                    <div className="absolute top-0 left-0 h-[300px] w-[300px] voted-gradient z-10 backdrop-blur-sm" />
                    <div
                      className="absolute top-0 left-0 w-full h-full z-20 flex flex-col px-4 pt-4 pb-8"
                      style={{ background: 'url(/retrowave_figure.png)' }}
                    >
                      <div>
                        <img src={participant.thumbnail} className="w-12 h-12 object-cover" alt={`${participant.name} (Thumbnail)`} />
                      </div>
                      <div className="flex-1 flex flex-col justify-end">
                        <p className="text-3xl font-display font-medium text-black mb-3">{participant.name}</p>
                        <div>
                          <div className="px-2 py-1 inline-flex items-center bg-black">
                            <CheckmarkSquareOutline size={16} />
                            <p className="text-sm ml-2 font-medium font-display uppercase">Voted</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute top-0 left-0 h-[300px] w-[300px] bg-gradient-to-b from-transparent to-black z-10 flex items-end px-4 pt-4 pb-8 hover:opacity-90 transtion-opacity duration-200">
                    <p className="text-2xl font-display font-medium">{participant.name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Vote;
