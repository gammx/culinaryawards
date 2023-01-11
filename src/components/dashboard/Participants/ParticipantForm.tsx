import { ChangeEventHandler, Dispatch, FC, SetStateAction, useState } from 'react';
import Modal from '~/components/UI/Modal';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import useUploadImage from '~/utils/useUploadImage';
import { trpc } from '~/utils/trpc';
import { participantCreateSchema } from '~/utils/schemas/participants';

export type ParticipantFormMode = 'create' | 'edit';

interface Option {
	label: string;
	value: string;
}

interface ParticipantFormProps {
	/** It controls the open state of the form modal */
	state: [boolean, Dispatch<SetStateAction<boolean>>];
	mode: ParticipantFormMode;
}

const ParticipantForm: FC<ParticipantFormProps> = ({
	state: [isOpen, setIsOpen],
	mode,
	...props
}) => {
	const title = mode === 'create' ? 'Add New Participant' : 'Edit Participant';
	const [categoriesAsOptions, setCategoriesAsOptions] = useState<Option[]>([]);
	const [participantForm, setParticipantForm] = useState({
		name: '',
		direction: '',
		thumbnail: '',
		categories: [] as string[],
		website: '',
		mapsAnchor: '',
	});
	const { validate, errors, setErrors } = useZod(participantCreateSchema);
	const { fileInputRef, uploadImage } = useUploadImage({
		onUpload: (url) => setParticipantForm(prev => ({ ...prev, thumbnail: url as string }))
	});
	const utils = trpc.useContext();
	const { data: categories, isLoading: isCategoriesLoading } = trpc.categories.getAllCategories.useQuery(undefined, {
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
			await utils.participants.getAllParticipants.cancel();
			const prevData = utils.participants.getAllParticipants.getData();
			utils.participants.getAllParticipants.setData(undefined,
				(old) => old && [...old, { ...vars, id: '-1', categoryIds: [] }]
			);
			setErrors({});
			setIsOpen(false);
			clearParticipantForm();
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
		},
		onSuccess() {
			utils.participants.getAllParticipants.invalidate();
		}
	});

	const participantHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
		setParticipantForm((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	const createParticipant = async () => {
		const isAllowed = validate(participantForm);
		isAllowed && participantCreate.mutate(participantForm);
	};

	const clearParticipantForm = () => {
		setParticipantForm({ name: '', direction: '', thumbnail: '', categories: [], website: '', mapsAnchor: '' });
	};

	return (
		<Modal state={[isOpen, setIsOpen]}>
			<h1>{title}</h1>
			<div className="flex flex-col flex-y-4">
				<fieldset className="flex flex-col space-y-2">
					<label htmlFor="name">Name</label>
					<input
						autoFocus
						id="name"
						type="text"
						placeholder="Something crazy"
						value={participantForm.name}
						onChange={participantHandler}
					/>
					<p className="text-xs text-red-500">{errors.name}</p>
				</fieldset>
				<fieldset className="flex flex-col space-y-2">
					<label htmlFor="thumbnail">Thumbnail</label>
					<input ref={fileInputRef} id="thumbnail" type="file" accept="image/png, image/jpeg" onChange={uploadImage} className="hidden" />
					{participantForm.thumbnail && <img src={participantForm.thumbnail} alt="thumbnail" />}
					<button
						className="bg-gray-300 px-2 py-2 rounded ml-2 text-xs uppercase"
						onClick={() => fileInputRef.current?.click()}
					>
						Upload
					</button>
					<p className="text-xs text-red-500">{errors.thumbnail}</p>
				</fieldset>
				<fieldset className="flex flex-col space-y-2">
					<label htmlFor="direction">Direction</label>
					<input type="text" id="direction" placeholder="Cabo San Lucas" value={participantForm.direction} onChange={participantHandler} />
					<p className="text-xs text-red-500">{errors.direction}</p>
				</fieldset>
				<fieldset className="flex flex-col space-y-2">
					<label htmlFor="website">Website URL</label>
					<input
						type="text"
						id="website"
						placeholder="https://..."
						value={participantForm.website}
						onChange={participantHandler}
					/>
				</fieldset>
				<fieldset className="flex flex-col space-y-2">
					<label htmlFor="mapsAnchor">Google Maps URL</label>
					<input
						type="text"
						id="mapsAnchor"
						placeholder="https://goo.gl/maps/..."
						value={participantForm.mapsAnchor}
						onChange={participantHandler}
					/>
				</fieldset>
				<fieldset className="flex flex-col space-y-2">
					<label htmlFor="categories">Categories</label>
					<Select
						id="categories"
						isLoading={isCategoriesLoading}
						options={categoriesAsOptions}
						onChange={(values) => setParticipantForm(prev => ({ ...prev, categories: values.map(e => e.value) }))}
						isMulti
						isSearchable
					/>
					<p className="text-xs text-red-500">{errors.categories}</p>
				</fieldset>
			</div>
			{mode === 'create' && (
				<button
					className="bg-green-500 px-2 py-2 rounded mr-2 text-xs uppercase"
					onClick={createParticipant}
				>
					Add
				</button>
			)}
		</Modal>
	);
};

export default ParticipantForm;
