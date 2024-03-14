import React from "react";

interface Props {
  color: string;
}
const RightArrowIcon: React.FC<Props> = ({ color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="41"
      height="13"
      viewBox="0 0 41 13"
      fill="none"
    >
      <path
        d="M40.5303 7.03033C40.8232 6.73744 40.8232 6.26256 40.5303 5.96967L35.7574 1.1967C35.4645 0.903806 34.9896 0.903806 34.6967 1.1967C34.4038 1.48959 34.4038 1.96447 34.6967 2.25736L38.9393 6.5L34.6967 10.7426C34.4038 11.0355 34.4038 11.5104 34.6967 11.8033C34.9896 12.0962 35.4645 12.0962 35.7574 11.8033L40.5303 7.03033ZM0 7.25H40V5.75H0V7.25Z"
        fill={`#${color}`}
      />
    </svg>
  );
};

export default RightArrowIcon;
