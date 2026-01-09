import { create } from 'zustand';

export type ModalInfo = {
	title: React.ReactNode;
	body: React.ReactNode;
};

export type ModalState = typeof defaultState & {
	openModal: (info: ModalInfo) => void,
	closeModal: () => void;
};

const defaultState = {
	open: false,
	info: undefined as ModalInfo | undefined,
};

export const useModal = create<ModalState>(set => {
	return {
		...defaultState,
		openModal: info => set({ info, open: true, }),
		closeModal: () => set({ info: undefined, open: false, }),
	};
});
