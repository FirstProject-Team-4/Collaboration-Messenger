import React, { type Dispatch, type SetStateAction } from 'react'

export type User = {
  username: string;
}

export type UserData = {
  username: string,
  email: string;
  uid: string,
  phoneNumber: number,
  image: string,
  isBlock: boolean,
  activity: string;
  notifications: {} |null,
  createdOn: Date;
  friendsRequest: {} | null,
  friends: {}
}
//User Context
export interface AppContextType {
  user: User | any
  userData: UserData | any
  setContext: Dispatch<SetStateAction<{ user: User|any, userData: UserData|any }>>
}

export const AppContext = React.createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
  const context = React.useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}



//Dyte Context
export type DyteContextType = {
  meeting: any;
  initMeeting: any;
};

export const DyteContext = React.createContext<DyteContextType | undefined>(undefined);

export const useDyteContext = () => {
  const context = React.useContext(DyteContext);
  if (!context) {
    throw new Error('useDyteContext must be used within a DyteContextProvider');
  }
  return context;
};

//Call Context

export type CallContextType = {
  inCall: boolean;
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CallContext = React.createContext<CallContextType | undefined>(undefined);

export const useCallContext = () => {
  const context = React.useContext(CallContext);
  if (!context) {
    throw new Error('useCallContext must be used within a CallContextProvider');
  }
  return context;
};