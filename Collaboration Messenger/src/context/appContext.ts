import React, { type Dispatch, type SetStateAction } from 'react'


export type User = {
  username:string;
  }
  
  export type UserData = {
    username: string,
    email: string;
    uid:string,
    phoneNumber: number,
    activity:string;
    notifications:{},
    createdOn: Date;
    groups: string[];
  
  }
  
  export interface AppContextType {
    user: User | null
    userData: UserData | null
    setContext: Dispatch<SetStateAction<{ user: User | null, userData: UserData | null  }>>
  }
  
  export const AppContext = React.createContext<AppContextType | undefined>(undefined)

  export const useAppContext = () => {
    const context = React.useContext(AppContext)
    if (!context) {
      throw new Error('useAppContext must be used within an AppContextProvider')
    }
    return context
  }