import { NavLink } from "react-router-dom";


export default function About() {

  return (
    <>
      <div>
        <h1>About view</h1>
      </div>
      <div>
        <NavLink to="/login" > Login </NavLink>
        <NavLink to="/register" > Register </NavLink>
    
      </div>
    </>
  );
}
