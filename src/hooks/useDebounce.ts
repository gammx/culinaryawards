import React from "react";

/**
 * It creates a state that is updated only after the delay has passed.
 * 
 * @param value The value to debounce
 * @param delay The delay in ms
 * @returns The debounced value
 */
export const useDebounce = (value: string, delay: number = 500) => {
	const [debouncedValue, setDebouncedValue] = React.useState(value);

	React.useEffect(() => {
		const handler: NodeJS.Timeout = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Cancel the timeout if value changes or unmount
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};