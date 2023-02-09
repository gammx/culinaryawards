import React from 'react';
import cn from 'classnames';

interface DashboardCardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const DashboardCardInput: React.FC<DashboardCardInputProps> = ({
	className,
	...props
}) => {
	return (
		<input
			className={cn("bg-transparent border border-linear/50 focus:outline focus:outline-linear/10 focus:outline-4 rounded-md w-full h-8 mt-6 px-5 py-3 text-sm text-[#C5D7E2]", className)}
			{...props}
		/>
	);
};

export default DashboardCardInput;
