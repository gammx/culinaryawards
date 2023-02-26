import { ChangeEventHandler, useState, useEffect } from 'react';
import { participantCreateSchema } from '~/utils/schemas/participants';
import { Participant } from '@prisma/client';
import { PlusOutline, FunnelOutline } from '@styled-icons/evaicons-outline';
import { trpc } from '~/utils/trpc';
import Button from '~/components/UI/Button';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import useUploadImage from '~/utils/useUploadImage';
import useViews from '~/utils/useViews';
import DashboardPanel from '../DashboardPanel';

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
  const deleteParticipant: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
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
  const createParticipant: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
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
  const editParticipant: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
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
    <DashboardPanel.Card>
      {views.current === 'list' && (
        <>
          <DashboardPanel.Titlebar title="Participants">
            <DashboardPanel.IconButton icon={PlusOutline} onClick={() => views.go('add')} />
            <DashboardPanel.IconButton icon={FunnelOutline} />
          </DashboardPanel.Titlebar>
          <DashboardPanel.Input outlined type="text" placeholder="Search" />
          <DashboardPanel.Content>
            <ul
              className="flex flex-col space-y-1 text-bone-muted"
            >
              {participants && participants.length > 0 &&
                participants.map((participant) => (
                  <li
                    key={participant.id}
                    className="flex space-x-4 items-center cursor-pointer card-search-bg p-2"
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

      {/** PARTICIPANT ADD ----------------------------------------- */}
      {views.current === 'add' && (
        <>
          <DashboardPanel.Titlebar
            title="Add Participant"
            onBack={cancelCreateParticipant}
          />
          <DashboardPanel.Content>
            <form onSubmit={createParticipant}>
              <fieldset >
                <label htmlFor="thumbnail">Picture *</label>
                <input ref={creatableAvatarRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={uploadCreatableAvatar} className="hidden" />
                <div className="pb-4 flex justify-center">
                  <img src={participantCreatable.thumbnail || '/default_pfp.png'} alt={`${participantCreatable.name} (Thumbnail)`} className="w-20 h-20 rounded-circle object-cover" />
                </div>
                <Button onClick={() => creatableAvatarRef.current?.click()}>Upload</Button>
                {errors.thumbnail && <span className="text-red text-sm">{errors.thumbnail}</span>}
              </fieldset>
              <fieldset>
                <label htmlFor="name">Name *</label>
                <DashboardPanel.Input
                  id="name"
                  type="text"
                  value={participantCreatable.name}
                  onChange={creatableHandler}
                />
                {errors.name && <span className="text-red text-sm">{errors.name}</span>}
              </fieldset>
              <fieldset>
                <label htmlFor="direction">Direction *</label>
                <DashboardPanel.Input
                  id="direction"
                  type="text"
                  value={participantCreatable.direction}
                  onChange={creatableHandler}
                />
                {errors.direction && <span className="text-red text-sm">{errors.direction}</span>}
              </fieldset>
              <fieldset>
                <label htmlFor="website">Website</label>
                <DashboardPanel.Input
                  id="website"
                  type="text"
                  value={participantCreatable.website}
                  onChange={creatableHandler}
                  placeholder="https://..."
                />
              </fieldset>
              <fieldset>
                <label htmlFor="mapsAnchor">Google Maps URL</label>
                <DashboardPanel.Input
                  id="mapsAnchor"
                  type="text"
                  value={participantCreatable.mapsAnchor}
                  onChange={creatableHandler}
                  placeholder="https://www.google.com/maps/place/..."
                />
              </fieldset>
              <fieldset>
                <label htmlFor="categories">Categories</label>
                <Select
                  id="categories"
                  isLoading={isCategoriesLoading}
                  options={categoriesAsOptions}
                  onChange={(values) => setParticipantCreatable(prev => ({ ...prev, categoryIds: values.map(e => e.value) }))}
                  isMulti
                  isSearchable
                  menuPlacement={'auto'}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                {errors.categoryIds && <span className="text-red text-sm">{errors.categoryIds}</span>}
              </fieldset>
              <Button variant="primary" type="submit">Add</Button>
            </form>
          </DashboardPanel.Content>
        </>
      )}

      {views.current === 'profile' && participantTarget && (
        <>
          <DashboardPanel.Tabs state={[profileTab, setProfileTab]} onBack={() => {
            setProfileTab('info');
            setParticipantTarget(null);
            views.goBack();
          }}>
            {/** PARTICIPANT INFO ----------------------------------------- */}
            <DashboardPanel.Tab value="info">
              <DashboardPanel.Profile
                name={participantTarget.name}
                thumbnail={participantTarget.thumbnail}
                siteAnchor={participantTarget.website}
                mapsAnchor={participantTarget.mapsAnchor}
              />
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

            {/** PARTICIPANT EDIT ----------------------------------------- */}
            <DashboardPanel.Tab value="edit">
              <form onSubmit={editParticipant}>
                <fieldset>
                  <label htmlFor="thumbnail">Picture</label>
                  <input ref={editableAvatarRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={uploadEditableAvatar} className="hidden" />
                  <div className="pb-6 relative">
                    <img src={participantEditable.thumbnail} alt={`${participantEditable.name} (Thumbnail)`} className="w-20 h-20 rounded-circle object-cover" />
                  </div>
                  <Button variant="tertiary" onClick={() => editableAvatarRef.current?.click()}>Upload</Button>
                  {errors.thumbnail && <p className="text-xs text-red-500 mt-2">{errors.thumbnail}</p>}
                </fieldset>
                <fieldset>
                  <label htmlFor="name">Name</label>
                  <DashboardPanel.Input
                    id="name"
                    type="text"
                    value={participantEditable.name}
                    onChange={editableHandler}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-2">{errors.name}</p>}
                </fieldset>
                <fieldset>
                  <label htmlFor="direction">Direction</label>
                  <DashboardPanel.Input
                    id="direction"
                    type="text"
                    value={participantEditable.direction || ''}
                    onChange={editableHandler}
                  />
                  {errors.direction && <p className="text-xs text-red-500 mt-2">{errors.direction}</p>}
                </fieldset>
                <fieldset>
                  <label htmlFor="website">Website</label>
                  <DashboardPanel.Input
                    id="website"
                    type="text"
                    value={participantEditable.website || ''}
                    onChange={editableHandler}
                  />
                </fieldset>
                <fieldset>
                  <label htmlFor="mapsAnchor">Google Maps URL</label>
                  <DashboardPanel.Input
                    id="mapsAnchor"
                    type="text"
                    value={participantEditable.mapsAnchor || ''}
                    onChange={editableHandler}
                  />
                </fieldset>
                <fieldset>
                  <label htmlFor="categories">Categories</label>
                  <Select
                    id="categories"
                    isLoading={isCategoriesLoading}
                    options={categoriesAsOptions}
                    defaultValue={defaultOptions}
                    onChange={(values) => setParticipantEditable(prev => ({ ...prev, categoryIds: values.map(e => e.value) }))}
                    isMulti
                    isSearchable
                    menuPlacement={'auto'}
                    menuPosition={'fixed'}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  {errors.categoryIds && <p className="text-xs text-red-500 mt-2">{errors.categoryIds}</p>}
                </fieldset>
                <div className="flex space-x-2">
                  <Button variant="primary" type="submit">Save</Button>
                  <Button onClick={() => changeProfileTab('info')}>Cancel</Button>
                </div>
              </form>
            </DashboardPanel.Tab>

            {/** PARTICIPANT DELETE ----------------------------------------- */}
            <DashboardPanel.Tab value="delete">
              <form onSubmit={deleteParticipant}>
                <fieldset className="h-full">
                  <label>Delete Participant</label>
                  <p className="text-sm text-ink/80">Are you sure you want to delete this participant? Remember this cannot be undone!</p>
                  <br />
                  <Button variant="danger" type="submit">Delete</Button>
                </fieldset>
              </form>
            </DashboardPanel.Tab>
          </DashboardPanel.Tabs>
        </>
      )}
    </DashboardPanel.Card>
  );
};

export default ParticipantsCard;
