import { useEffect } from "react";
import { useAppContext } from "../../context/appContext";

export default function Home(){
  const{userData}=useAppContext();
  console.log(userData);
  useEffect(()=>{
    console.log(userData);
  },[userData]);
  return (
    <div>
      <h1>Welcome to Busy chat</h1>
        
    </div>
  );
}