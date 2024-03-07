import { IconProps } from "@/lib/types";

const PopSmileyIcon: React.FC<IconProps> = ({ color, size, className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 60 61"
      fill="none"
    >
      <path
        d="M45 0.251953C36.7163 0.251953 30 6.9682 30 15.252C30 6.9682 23.2837 0.251953 15 0.251953C6.71625 0.251953 0 6.9682 0 15.252V30.252C0 46.8207 13.4312 60.252 30 60.252C21.7163 60.252 15 53.5357 15 45.252H22.5C18.3575 45.252 15 41.8945 15 37.752C15 33.6095 18.3575 30.252 22.5 30.252C26.6425 30.252 30 33.6095 30 37.752C30 33.6095 33.3575 30.252 37.5 30.252C41.6425 30.252 45 33.6095 45 37.752C45 41.8945 41.6425 45.252 37.5 45.252H45C45 53.5357 38.2837 60.252 30 60.252C46.5687 60.252 60 46.8207 60 30.252V15.252C60 6.9682 53.2837 0.251953 45 0.251953ZM30 37.752C30 41.8945 26.6425 45.252 22.5 45.252H37.5C33.3575 45.252 30 41.8945 30 37.752Z"
        fill={color}
        className={className}
      />
    </svg>
  );
};

export default PopSmileyIcon;
