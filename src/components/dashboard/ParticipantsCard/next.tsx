import { ChangeEventHandler, useState, useEffect } from 'react';
import { participantCreateSchema } from '~/utils/schemas/participants';
import { Participant } from '@prisma/client';
import { PlusOutline, FunnelOutline, HashOutline, GlobeOutline, Globe2Outline, ChevronLeftOutline, Link2Outline, PinOutline } from '@styled-icons/evaicons-outline';
import { trpc } from '~/utils/trpc';
import Button from '~/components/UI/Button';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import DataCard from '../DataCard';
import IconButton from '~/components/UI/IconButton';
import HighlightedIcon from '~/components/UI/HighlightedIcon';
import useUploadImage from '~/utils/useUploadImage';
import useViews from '~/utils/useViews';
import DashboardPanel from '../DashboardPanel';
import _ from 'underscore.string';

interface Option {
  label: string;
  value: string;
}

const ParticipantsCard = () => {
  const views = useViews('list');
  const utils = trpc.useContext();
  const { data: participants, refetch: refetchParticipants } = trpc.participants.getAllParticipants.useQuery(undefined, {
    onSuccess(data) {
      if (data && participantTarget) {
        const target = data.find((participant) => participant.id === participantTarget.id);
        target && setParticipantTarget(target);
      }
    },
  });
  const { validate, errors, setErrors } = useZod(participantCreateSchema);
  // These are the award categories displayed as options in the participant forms
  const [categoriesAsOptions, setCategoriesAsOptions] = useState<Option[]>([]);
  const [defaultOptions, setDefaultOptions] = useState<Option[]>([]);
  const [profileTab, setProfileTab] = useState('info');
  const [participantTarget, setParticipantTarget] = useState<Participant | null>(null);
  const [participantCreatable, setParticipantCreatable] = useState({
    name: '',
    direction: '',
    thumbnail: '',
    categoryIds: [] as string[],
    website: '',
    mapsAnchor: '',
  });
  const [participantEditable, setParticipantEditable] = useState({} as Participant);
  const { fileInputRef: creatableAvatarRef, uploadImage: uploadCreatableAvatar } = useUploadImage({
    onUpload: (url) => setParticipantCreatable(prev => ({ ...prev, thumbnail: url as string }))
  });
  const { fileInputRef: editableAvatarRef, uploadImage: uploadEditableAvatar } = useUploadImage({
    onUpload: (url) => setParticipantEditable(prev => ({ ...prev, thumbnail: url as string })),
  });
  const { data: categories, isLoading: isCategoriesLoading, isFetching: isCategoriesFetching } = trpc.categories.getAllCategories.useQuery(undefined, {
    onSuccess: (data) => {
      if (!data) return;
      setCategoriesAsOptions(data.map((category) => ({
        label: category.name,
        value: category.id,
      })));
    }
  });
  const participantCreate = trpc.participants.addNewParticipant.useMutation({
    async onMutate(vars) {
      // Prepare for optimistic update
      await utils.participants.getAllParticipants.cancel();
      const prevData = utils.participants.getAllParticipants.getData();
      utils.participants.getAllParticipants.setData(undefined,
        (old) => old && [...old, { ...vars, id: '-1', categoryIds: [] }]
      );
      setErrors({});
      views.goBack();
      clearCreatable();
      return { prevData };
    },
    onError(err, vars, ctx) {
      ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
    },
    onSuccess() {
      utils.participants.getAllParticipants.invalidate();
    }
  });
  const participantEdit = trpc.participants.editParticipant.useMutation({
    async onMutate(vars) {
      // Prepare for optimistic update
      await utils.participants.getAllParticipants.cancel();
      const prevData = utils.participants.getAllParticipants.getData();
      let prevParticipant = {} as Participant;
      setParticipantTarget(vars);
      utils.participants.getAllParticipants.setData(undefined,
        (old) => old && old.map((participant) => {
          if (participant.id === vars.id) {
            prevParticipant = participant;
            return vars;
          }
          return participant;
        })
      );
      setErrors({});
      setProfileTab('info');
      return { prevData, prevParticipant };
    },
    onError(err, vars, ctx) {
      if (ctx) {
        utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
        setParticipantTarget(ctx.prevParticipant);
      }
    },
    onSettled() {
      refetchParticipants();
      utils.categories.getAllCategories.invalidate();
    }
  });
  const participantDelete = trpc.participants.deleteParticipant.useMutation({
    async onMutate(dto) {
      // Prepare for optimistic update
      await utils.participants.getAllParticipants.cancel();
      const prevData = utils.participants.getAllParticipants.getData();
      utils.participants.getAllParticipants.setData(undefined,
        (old) => old && old.filter((participant) => participant.id !== dto.participantId)
      );
      views.goBack();
      setProfileTab('info');
      return { prevData };
    },
    onError(err, vars, ctx) {
      ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
    },
    onSettled() {
      utils.participants.getAllParticipants.invalidate();
    }
  });

  /** Sync editable DTO with the current participant profile changes */
  useEffect(() => {
    if (!participantTarget || !categories) return;

    setParticipantEditable(participantTarget);
    setDefaultOptions(categories.filter((category) => participantTarget.categoryIds.includes(category.id)).map((category) => ({
      label: category.name,
      value: category.id,
    })));
  }, [participantTarget, categories]);

  /** It executes the delete mutation */
  const participantDeleteAction = () => {
    participantTarget && participantDelete.mutate({ participantId: participantTarget.id });
  };

  /** It clears the create participant form */
  const clearCreatable = () => {
    setParticipantCreatable({ name: '', direction: '', thumbnail: '', categoryIds: [], website: '', mapsAnchor: '' });
  };

  /** It handles the create form updates */
  const creatableHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    setParticipantCreatable((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  /** It executes the create mutation if the introduced values are valid */
  const createParticipant = () => {
    const isAllowed = validate(participantCreatable);
    isAllowed && participantCreate.mutate(participantCreatable);
  };

  /** It handles the edit form updates */
  const editableHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    setParticipantEditable((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  /** It opens a participant profile */
  const goToProfile = (editable: Participant) => {
    setParticipantTarget(editable);
    views.go('profile');
  };

  /** It executes the edit mutation if the introduced values are valid */
  const editParticipant = () => {
    const isAllowed = validate(participantEditable);
    isAllowed && participantEdit.mutate(participantEditable);
  };

  /** Callback to execute when user moves between tabs */
  const changeProfileTab = (tab: string) => {
    participantTarget && setParticipantEditable(participantTarget);
    setErrors({});
    setProfileTab(tab);
  };

  /** It cancels the add participant action */
  const cancelCreateParticipant = () => {
    views.go('list');
    setErrors({});
    clearCreatable();
  };

  return (
    <DashboardPanel.Card className="void-green-gradient">
      {views.current === 'list' && (
        <>
          <DashboardPanel.Titlebar title="Participants">
            <DashboardPanel.IconButton icon={PlusOutline} onClick={() => views.go('add')} />
            <DashboardPanel.IconButton icon={FunnelOutline} />
          </DashboardPanel.Titlebar>
          <DashboardPanel.Input type="text" placeholder="Search" />
          <DashboardPanel.Content>
            <ul
              className="flex flex-col space-y-1 text-bone-muted"
            >
              {participants && participants.length > 0 &&
                participants.map((participant) => (
                  <li
                    key={participant.id}
                    className="flex space-x-4 items-center cursor-pointer card-search-bg rounded-lg p-2"
                    onClick={() => goToProfile(participant)}
                  >
                    <img src={participant.thumbnail} alt={`${participant.name} (Thumbnail)`} className="rounded-circle w-6 h-6 object-cover" />
                    <span>{participant.name}</span>
                  </li>
                ))
              }
            </ul>
          </DashboardPanel.Content>
        </>
      )}

      {views.current === 'profile' && participantTarget && (
        <div>
          <DashboardPanel.Tabs state={[profileTab, setProfileTab]} onBack={() => {
            setProfileTab('info');
            setParticipantTarget(null);
            views.goBack();
          }}>
            <DashboardPanel.Content>
              <DashboardPanel.Tab value="info">
                <DashboardPanel.Profile
                  name={participantTarget.name}
                  thumbnail={participantTarget.thumbnail}
                  siteAnchor={participantTarget.website}
                  mapsAnchor={participantTarget.mapsAnchor}
                />
                {/* ------------ PARTICIPANT CATEGORIES ------------ */}
                <div className="mt-11">
                  <p className="text-xs font-medium tracking-wider uppercase text-ink-dark">Categories</p>
                  <ul className="text-sm text-ink mt-5">
                    {isCategoriesFetching
                      ? <li>Loading...</li>
                      : (categories && participantTarget.categoryIds.length > 0)
                        ? categories.filter((category) => participantTarget.categoryIds.includes(category.id)).map((category) => (
                          <li key={category.id}>{category.name}</li>
                        ))
                        : <li>No categories yet</li>
                    }
                  </ul>
                </div>
              </DashboardPanel.Tab>
            </DashboardPanel.Content>
          </DashboardPanel.Tabs>
        </div>
      )}
    </DashboardPanel.Card>
  );
};

export default ParticipantsCard;
