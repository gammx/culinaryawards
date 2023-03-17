import React from 'react';
import Select, { ActionMeta, GroupBase, OptionsOrGroups, PropsValue, SingleValue } from 'react-select';
import { Option } from '~/utils/select';
import cn from 'classnames';

interface SelectMinimalProps {
	isLoading?: boolean;
	id?: string;
	options: OptionsOrGroups<Option, GroupBase<Option>> | undefined;
	defaultValue?: PropsValue<Option> | undefined;
	onChange?: ((newValue: SingleValue<Option>, actionMeta: ActionMeta<Option>) => void) | undefined;
	className?: string;
	placeholder?: string;
}

const SelectMinimal: React.FC<SelectMinimalProps> = ({
	id,
	options,
	defaultValue,
	onChange,
	className,
	placeholder,
	isLoading = false,
}) => {
	return (
		<Select
			id={id}
			isLoading={isLoading}
			options={options}
			defaultValue={defaultValue}
			isSearchable
			isClearable={true}
			menuPlacement={'auto'}
			menuPosition={'fixed'}
			className={cn("select--outlined select--minimal select select--small", className)}
			classNamePrefix="react-select"
			placeholder={placeholder || 'Select'}
			onChange={onChange}
		/>
	);
};

export default SelectMinimal;
