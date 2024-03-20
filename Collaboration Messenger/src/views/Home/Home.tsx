import { useEffect } from "react";
import { useAppContext } from "../../context/appContext";
import './Home.css';
/**
 * Renders the Home component.
 * 
 * @returns The rendered Home component.
 */
export default function Home() {
  const { userData } = useAppContext();
  useEffect(() => {
  }, [userData]);
  return (
    <div>
      <h1>Welcome to Busy chat</h1>
      <img className="home-view" src='/image/home-view.png' />
    </div>
  );
}