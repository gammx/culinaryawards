import Select from 'react-select';
import useZod from '~/hooks/useZod';
import useViews from '~/utils/useViews';
import Button from '~/components/UI/Button';
import Image from 'next/image';
import DashboardPanel from '../DashboardPanel';
import type { Category } from '@prisma/client';
import type { Option } from '~/utils/select';
import { ChangeEventHandler, useState, useEffect } from 'react';
import { trpc } from '~/utils/trpc';
import { categoryCreateSchema, categoryEditSchema } from '~/utils/schemas/categories';
import { PlusOutline, FunnelOutline } from '@styled-icons/evaicons-outline';

const Categories = () => {
  const views = useViews('list');
  const [categoryBanner, setCategoryBanner] = useState('');
  const [participantsAsOptions, setParticipantsAsOptions] = useState<Option[]>([]);
  const [defaultParticipantOptions, setDefaultParticipantOptions] = useState<Option[]>([]);
  /** The currently focused category profile */
  const [categoryProfile, setCategoryProfile] = useState<Category | null>(null);
  const [categoryProfileTab, setCategoryProfileTab] = useState('info');
  const [categoryCreatable, setCategoryCreatable] = useState({
    name: '',
    location: '',
    participantIds: [] as string[],
  });
  const [categoryEditable, setCategoryEditable] = useState({
    id: '',
    name: '',
    location: '',
    participantIds: []
  } as Category);
  const { validate, errors, setErrors } = useZod(categoryCreateSchema);
  const categoryEditZod = useZod(categoryEditSchema);
  const utils = trpc.useContext();
  const { data: categories, isLoading: isCategoriesLoading } = trpc.categories.getAllCategories.useQuery(undefined, {
    onSuccess(data) {
      // Sync the category profile with the fetched data
      if (data && categoryProfile) {
        const target = data.find((participant) => participant.id === categoryProfile.id);
        target && setCategoryProfile(target);
      }
    },
  });
  const { data: participants, isFetching: isParticipantsFetching } = trpc.participants.getAllParticipants.useQuery(undefined, {
    onSuccess(data) {
      // Sync the form select options with the fetched data
      setParticipantsAsOptions(data.map((participant) => ({
        value: participant.id,
        label: participant.name
      })));
    },
  });
  const categoryCreate = trpc.categories.addNewCategory.useMutation({
    async onMutate(vars) {
      await utils.categories.getAllCategories.cancel();
      const prevData = utils.categories.getAllCategories.getData();
      utils.categories.getAllCategories.setData(undefined,
        (old) => old && [...old, { ...vars, id: '-1' }]
      );
      setErrors({});
      views.goBack();
      clearCategoryForms();
      return { prevData };
    },
    onError(err, vars, ctx) {
      ctx && utils.categories.getAllCategories.setData(undefined, ctx.prevData);
    },
    onSettled() {
      utils.categories.getAllCategories.invalidate();
      // We're probably assigning this new category to some participants, so we need to invalidate the participants query
      utils.participants.getAllParticipants.invalidate();
    }
  });
  const categoryEdit = trpc.categories.editCategory.useMutation({
    async onMutate(dto) {
      await utils.categories.getAllCategories.cancel();
      const prevData = utils.categories.getAllCategories.getData();
      // Update the category profile because we're on the profile view and its data is now stale
      // We also save the previous category data so if we get an error, we'll revert the changes later
      setCategoryProfile(dto);
      let prevCategory = {} as Category;
      utils.categories.getAllCategories.setData(undefined,
        (old) => old && old.map((category) => {
          if (category.id === dto.id) {
            prevCategory = category;
            return dto;
          }
          return category;
        })
      );
      categoryEditZod.setErrors({});
      setCategoryProfileTab('info');
      clearCategoryForms();
      return { prevData, prevCategory };
    },
    onError(err, vars, ctx) {
      if (ctx) {
        utils.categories.getAllCategories.setData(undefined, ctx.prevData);
        setCategoryProfile(ctx.prevCategory);
      }
    },
    onSettled() {
      utils.categories.getAllCategories.invalidate();
      // We're probably assigning this category to some participants, so we need to invalidate the participants query
      utils.participants.getAllParticipants.invalidate();
    }
  });
  const categoryDelete = trpc.categories.deleteCategory.useMutation({
    async onMutate({ categoryId }) {
      // Optimistically update to the new value
      await utils.categories.getAllCategories.cancel();
      const prevData = utils.categories.getAllCategories.getData();
      utils.categories.getAllCategories.setData(undefined,
        (old) => old && old.filter((category) => category.id !== categoryId)
      );
      views.go('list');
      return { prevData };
    },
    onError(err, vars, ctx) {
      ctx && utils.categories.getAllCategories.setData(undefined, ctx.prevData);
    },
    onSettled() {
      utils.categories.getAllCategories.invalidate();
      utils.participants.getAllParticipants.invalidate();
    }
  });

  /** Sync editable DTO with the current category profile changes */
  useEffect(() => {
    if (!categoryProfile || !participants) return;

    setCategoryEditable(categoryProfile);
    setDefaultParticipantOptions(categoryProfile.participantIds.map((id) => {
      const participant = participants.find((participant) => participant.id === id);
      return {
        label: participant!.name,
        value: participant!.id,
      };
    }));
  }, [categoryProfile, participants]);

  /** It clears both category forms */
  const clearCategoryForms = () => {
    setCategoryCreatable({ name: '', location: '', participantIds: [] });
    setCategoryEditable({ id: '', name: '', location: '', participantIds: [] });
  };

  /** It handles the category create form updates */
  const categoryCreateHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
    setCategoryCreatable({ ...categoryCreatable, [event.target.id]: event.target.value });
  };

  /** It executes the category create mutation, validating the values first */
  const createCategory: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const isAllowed = validate(categoryCreatable);
    isAllowed && categoryCreate.mutate(categoryCreatable);
  };

  /** It handles the category edit form updates */
  const editableHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
    setCategoryEditable({ ...categoryEditable, [event.target.id]: event.target.value });
  };

  /** It executes the category edit mutation, if the validation gets passed */
  const editCategory: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!categoryEditable) return;

    const isAllowed = categoryEditZod.validate(categoryEditable);
    isAllowed && categoryEdit.mutate(categoryEditable);
  };

  /** It executes the category delete mutation */
  const deleteCategory: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    categoryDelete.mutate({ categoryId: categoryProfile!.id });
  };

  const goToProfile = (editable: Category) => {
    setCategoryProfile(editable);
    setCategoryProfileTab('info');
    setCategoryBanner(getRandomCategoryBanner());
    views.go('profile');
  };

  const goBackToList = () => {
    setCategoryProfile(null);
    setCategoryProfileTab('info');
    views.goBack();
  };

  const getRandomCategoryBanner = () => {
    const colors = ["dark_blue", "dark_aqua", "dark_pink", "golden", "sick_1", "sick_2", "sick_3", "sick_4"];
    return colors[Math.floor(Math.random() * colors.length)]!;
  };

  return (
    <DashboardPanel.Card className="void-green-gradient">
      {views.current === 'list' && (
        <>
          <DashboardPanel.Titlebar
            title="Categories"
          >
            <DashboardPanel.IconButton icon={PlusOutline} onClick={() => views.go('add')} />
            <DashboardPanel.IconButton icon={FunnelOutline} />
          </DashboardPanel.Titlebar>
          <DashboardPanel.Input outlined type="text" placeholder="Search" />
          <DashboardPanel.Content>
            <ul className="flex flex-col space-y-1 text-bone-muted">
              {categories && categories.length > 0 && categories.map((category) => (
                <li
                  key={category.id}
                  className="flex space-x-4 items-center cursor-pointer card-search-bg p-2"
                  onClick={() => goToProfile(category)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </DashboardPanel.Content>
        </>
      )}

      {/** PARTICIPANT ADD ----------------------------------------- */}
      {views.current === 'add' && (
        <>
          <DashboardPanel.Titlebar
            title="Add Category"
            onBack={views.goBack}
          />
          <DashboardPanel.Content>
            <form onSubmit={createCategory}>
              <fieldset>
                <label htmlFor="name">Name *</label>
                <DashboardPanel.Input
                  type="text"
                  id="name"
                  value={categoryCreatable.name}
                  onChange={categoryCreateHandler}
                />
                {errors.name && <span className="text-red text-xs">{errors.name}</span>}
              </fieldset>
              <fieldset>
                <label htmlFor="location">Location</label>
                <DashboardPanel.Input
                  type="text"
                  id="location"
                  value={categoryCreatable.location}
                  onChange={categoryCreateHandler}
                />
              </fieldset>
              <fieldset>
                <label htmlFor="participantIds">Participants</label>
                <Select
                  id="participantIds"
                  isLoading={isCategoriesLoading}
                  options={participantsAsOptions}
                  onChange={(opts) => setCategoryCreatable({ ...categoryCreatable, participantIds: opts.map(option => option.value) })}
                  isMulti
                  isSearchable
                  menuPlacement={'auto'}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </fieldset>
              <Button type="submit" variant="primary">Add Category</Button>
            </form>
          </DashboardPanel.Content>
        </>
      )}

      {views.current === 'profile' && categoryProfile && (
        <>

          {/** PARTICIPANT INFO ----------------------------------------- */}
          <DashboardPanel.Tabs
            state={[categoryProfileTab, setCategoryProfileTab]}
            onBack={goBackToList}
          >
            <DashboardPanel.Tab value="info">
              <div className="flex justify-center relative">
                <Image src={`/retrowave_plains/${categoryBanner}.png`} width={180} height={160} alt="Retrowave figure" />
                <div className="absolute w-full h-full top-0 left-0 flex flex-col justify-end items-center text-center space-y-2 pb-8">
                  <h1 className="font-display text-bone text-2xl">{categoryProfile.name}</h1>
                  <p className="font-display text-bone text-xs uppercase">{categoryProfile.location}</p>
                </div>
              </div>
              <div className="mt-11">
                <p className="text-xs font-medium tracking-wider uppercase text-ink-dark">Categories</p>
                <ul className="text-sm text-ink mt-5 space-y-2">
                  {isParticipantsFetching
                    ? <li>Loading...</li>
                    : (participants && categoryProfile.participantIds.length > 0)
                      ? participants.filter((participant) => categoryProfile.participantIds.includes(participant.id)).map(participant => (
                        <li key={participant.id}>{participant.name}</li>
                      ))
                      : <li>No categories yet</li>
                  }
                </ul>
              </div>
            </DashboardPanel.Tab>

            {/** PARTICIPANT EDIT ----------------------------------------- */}
            <DashboardPanel.Tab value="edit">
              <form onSubmit={editCategory}>
                <fieldset>
                  <label htmlFor="name">Name *</label>
                  <DashboardPanel.Input
                    type="text"
                    id="name"
                    value={categoryEditable.name}
                    onChange={editableHandler}
                  />
                  {categoryEditZod.errors.name && <p className="text-xs text-red mt-2">{categoryEditZod.errors.name}</p>}
                </fieldset>
                <fieldset>
                  <label htmlFor="location">Location</label>
                  <DashboardPanel.Input
                    type="text"
                    id="location"
                    value={categoryEditable.location || ''}
                    onChange={editableHandler}
                  />
                </fieldset>
                <fieldset>
                  <label htmlFor="participantIds">Categories</label>
                  <Select
                    id="participantIds"
                    isLoading={isCategoriesLoading}
                    options={participantsAsOptions}
                    defaultValue={defaultParticipantOptions}
                    onChange={(values) => setCategoryEditable(prev => ({ ...prev, participantIds: values.map(e => e.value) }))}
                    isMulti
                    isSearchable
                    menuPlacement={'auto'}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </fieldset>
                <Button type="submit" variant="primary">Save</Button>
              </form>
            </DashboardPanel.Tab>

            {/** PARTICIPANT DELETE ----------------------------------------- */}
            <DashboardPanel.Tab value="delete">
              <form onSubmit={deleteCategory}>
                <fieldset>
                  <label>Delete Category</label>
                  <p className="text-ink/80">Are you sure you want to delete this category?</p>
                  <br />
                  <Button type="submit" variant="danger">Delete</Button>
                </fieldset>
              </form>
            </DashboardPanel.Tab>
          </DashboardPanel.Tabs>
        </>
      )}
    </DashboardPanel.Card>
  );
};

export default Categories;
