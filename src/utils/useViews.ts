import useState from 'react-usestateref';

export interface Views {
	current: string;
	lastAction: string;
	go: (to: string) => void;
	goBack: () => void;
	reset: () => void;
}

const useViews = (defaultView: string): Views => {
	const [current, setView] = useState(defaultView);
	const [history, setHistory, historyRef] = useState([defaultView]);
	const [lastAction, setLastAction] = useState('');

	/** It changes the current view */
	const go = (to: string) => {
		setLastAction('go');
		setHistory(old => [...old, ...[to]]);
		setView(to);
	};

	/** It changes the current view to the previous one */
	const goBack = () => {
		setLastAction('goBack');
		setView(historyRef.current[historyRef.current.length - 2] || defaultView);
		setHistory(historyRef.current.slice(0, -1));
	};

	/** It resets the current view to the default one */
	const reset = () => {
		setLastAction('');
		setView(defaultView);
		setHistory([defaultView]);
	};

	return {
		current,
		lastAction,
		go,
		goBack,
		reset
	};
};

export default useViews;