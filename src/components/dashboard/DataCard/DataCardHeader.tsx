import React from 'react';
import { ArrowBackOutline } from '@styled-icons/evaicons-outline';
import cn from 'classnames';

interface DataCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const DataCardHeader: React.FC<DataCardHeaderProps> = (props) => {
	return (
		<div className="top-0 sticky flex flex-col space-y-4 mb-4" {...props} />
	);
};

export default DataCardHeader;
