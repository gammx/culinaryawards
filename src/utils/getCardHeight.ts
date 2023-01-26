export const getCardHeight = () => {
	const cardsRow = document.querySelector("#cards-row");
	const dataCard = document.querySelector(".DataCard");
	if (cardsRow && dataCard) {
		const cardsRowHeight = cardsRow.getBoundingClientRect().height;
		const cardsRowPadding = parseInt(window.getComputedStyle(dataCard).paddingTop) * 2;
		return `${cardsRowHeight - cardsRowPadding}px`;
	}
};