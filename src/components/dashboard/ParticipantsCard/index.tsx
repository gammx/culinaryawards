import { ChangeEventHandler, useState } from 'react';
import { participantCreateSchema } from '~/utils/schemas/participants';
import { Participant } from '@prisma/client';
import { trpc } from '~/utils/trpc';
import { PlusOutline, FunnelOutline, ArrowUpwardOutline } from '@styled-icons/evaicons-outline';
import Dialog from '~/components/UI/Dialog';
import Modal from '~/components/UI/Modal';
import Select from 'react-select';
import useZod from '~/hooks/useZod';
import useUploadImage from '~/utils/useUploadImage';
import cs from './ParticipantsCard.module.css';
import cn from 'classnames';

interface Option {
	label: string;
	value: string;
}

const ParticipantsCard = () => {
	const utils = trpc.useContext();
	const allParticipants = trpc.participants.getAllParticipants.useQuery();
	const { validate, errors, setErrors } = useZod(participantCreateSchema);
	// These are the award categories displayed as options in the participant forms
	const [categoriesAsOptions, setCategoriesAsOptions] = useState<Option[]>([]);
	const [defaultOptions, setDefaultOptions] = useState<Option[]>([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [participantCreatable, setParticipantCreatable] = useState({
		name: '',
		direction: '',
		thumbnail: '',
		categories: [] as string[],
		website: '',
		mapsAnchor: '',
	});
	const { fileInputRef: creatableFileRef, uploadImage: creatableFileUpload } = useUploadImage({
		onUpload: (url) => setParticipantCreatable(prev => ({ ...prev, thumbnail: url as string }))
	});
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [participantEditable, setParticipantEditable] = useState({} as Participant);
	const { fileInputRef: editableFileRef, uploadImage: editableFileUpload } = useUploadImage({
		onUpload: (url) => setParticipantEditable(prev => ({ ...prev, thumbnail: url as string })),
	});
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
			// Prepare for optimistic update
			await utils.participants.getAllParticipants.cancel();
			const prevData = utils.participants.getAllParticipants.getData();
			utils.participants.getAllParticipants.setData(undefined,
				(old) => old && [...old, { ...vars, id: '-1', categoryIds: [] }]
			);
			setErrors({});
			setIsCreateModalOpen(false);
			participantCreateClear();
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
			await utils.participants.getAllParticipants.invalidate();
			const prevData = utils.participants.getAllParticipants.getData();
			utils.participants.getAllParticipants.setData(undefined,
				(old) => old && old.map((participant) => participant.id === vars.id ? { ...participant, ...vars } : participant)
			);
			setErrors({});
			setIsEditModalOpen(false);
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.participants.getAllParticipants.invalidate();
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
			return { prevData };
		},
		onError(err, vars, ctx) {
			ctx && utils.participants.getAllParticipants.setData(undefined, ctx.prevData);
		},
		onSettled() {
			utils.participants.getAllParticipants.invalidate();
		}
	});

	/** It executes the delete mutation */
	const participantDeleteAction = async (participantId: string) => {
		participantDelete.mutate({ participantId });
	};

	/** It clears the create participant form */
	const participantCreateClear = () => {
		setParticipantCreatable({ name: '', direction: '', thumbnail: '', categories: [], website: '', mapsAnchor: '' });
	};

	/** It handles the create form updates */
	const participantCreateHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
		setParticipantCreatable((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	/** It executes the create mutation if the introduced values are valid */
	const participantCreateAction = () => {
		const isAllowed = validate(participantCreatable);
		isAllowed && participantCreate.mutate(participantCreatable);
	};

	/** It handles the edit form updates */
	const participantEditHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
		setParticipantEditable((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	/** It opens the edit participant modal */
	const participantEditLink = (editable: Participant) => {
		setParticipantEditable(editable);
		if (categories) {
			setDefaultOptions(editable.categoryIds.map((id) => {
				const category = categories.find((category) => category.id === id);
				return {
					label: category!.name,
					value: category!.id,
				};
			}));
		}
		setIsEditModalOpen(true);
	};

	/** It executes the edit mutation if the introduced values are valid */
	const participantEditAction = () => {
		const { categoryIds, ...editable } = participantEditable;
		const isAllowed = validate({ ...editable, categories: categoryIds });
		isAllowed && participantEdit.mutate({ ...editable, categories: categoryIds });
	};

	return (
		<div className={cn(cs.Wrapper, 'h-full text-white py-9 px-8 border-r border-r-white/20')}>
			<div className="flex justify-between items-center mb-4">
				<h1 className="font-medium text-2xl">Participants</h1>
				<div className="flex space-x-5">
					<div role="button" className="border border-[#D3E7EE] rounded-lg w-6 h-6 flex items-center justify-center hover:border-white">
						<PlusOutline size={18} className="fill-[#4B6E7A]" />
					</div>
					<div role="button" className="border border-[#D3E7EE] rounded-lg w-6 h-6 flex items-center justify-center hover:border-white">
						<FunnelOutline size={18} className="fill-[#4B6E7A]" />
					</div>
					<ArrowUpwardOutline size={24} className="fill-[#4B6E7A] rotate-45" />
				</div>
			</div>
			<input
				type="text"
				placeholder="Search"
				className="outline-none h-9 w-full bg-white opacity-30 backdrop-blur-sm rounded-full focus:outline-white py-2-5 px-5 text-black text-sm"
			/>
		</div>
	);
};

export default ParticipantsCard;
