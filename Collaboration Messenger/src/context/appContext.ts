import React, { type Dispatch, type SetStateAction } from 'react'


export type User = {
  username: string;
}

export type UserData = {
  username: string,
  email: string;
  uid: string,
  phoneNumber: number,
  activity: string;
  notifications: {} |null,
  createdOn: Date;
  friendsRequest: {} | null,
  friends: {}
}

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