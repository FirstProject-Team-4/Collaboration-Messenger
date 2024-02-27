

import React from "react";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  color?: string;
  id?: string;
}

/**
 * Button component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} [props.children=null] - The content of the button.
 * @param {Function} [props.onClick=() => {}] - The click event handler for the button.
 * @param {string} [props.color=""] - The color of the button.
 * @param {string} [props.id=""] - The id of the button.
 * @returns {JSX.Element} The rendered Button component.
 */
const Button: React.FC<ButtonProps> = ({ children = null, onClick = () => { }, color = "", id = '' }) => {

  return (
    <>
      <button id={id} style={color ? { border: `2px solid ${color}` } : undefined} onClick={onClick}>{children}</button>
    </>
  );
}

export default Button;
