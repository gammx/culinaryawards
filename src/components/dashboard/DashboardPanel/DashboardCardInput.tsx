import React from 'react';
import cn from 'classnames';

interface DashboardCardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	outlined?: boolean;
}

const DashboardCardInput: React.FC<DashboardCardInputProps> = ({
	className,
	...props
}) => {
	return (
		<input
			spellCheck={false}
			className={cn("bg-transparent border border-[#0A1419] outline-[#0A1419] focus:outline focus:outline-offset-2 focus:outline-[#0A1419]/50 w-full h-8 px-5 py-3 text-sm text-[#96B1BA] transition-all duration-150", className, {
				"bg-[#081116]/30": !props.outlined,
			})}
			{...props}
		/>
	);
};

export default DashboardCardInput;
