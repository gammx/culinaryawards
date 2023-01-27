import React from 'react';

interface DataCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

const DataCardHeader: React.FC<DataCardHeaderProps> = (props) => {
  return (
    <div className="top-0 sticky flex flex-col space-y-4 mb-4" {...props} />
  );
};

export default DataCardHeader;
