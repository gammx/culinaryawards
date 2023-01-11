import { Dispatch, FC, HTMLAttributes, SetStateAction } from 'react';
import ModalPrimitive from 'react-modal';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
	state: [boolean, Dispatch<SetStateAction<boolean>>];
}

const Modal: FC<ModalProps> = ({
	state: [isOpen, setIsOpen],
	className,
	children,
	...props
}) => {
	return (
		<div>
			<ModalPrimitive
				isOpen={isOpen}
				onRequestClose={() => setIsOpen(false)}
				className="bg-white absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 p-4"
				overlayClassName="fixed top-0 left-0 right-0 bottom-0 bg-black/50"
			>
				{children}
			</ModalPrimitive>
		</div>
	);
};

export default Modal;