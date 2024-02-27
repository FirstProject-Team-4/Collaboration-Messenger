import React, { type Dispatch, type SetStateAction } from 'react'


type User = {
  username:string;
  }
  
  type UserData = {
    username: string,
    email: string;
    uid:string,
    phoneNumber: number,
    activity:string;
    notifications:{},
    createdOn: Date;
  
  }
  
  interface AppContextType {
    user: User | null
    userData: UserData | null
    setContext: Dispatch<SetStateAction<{ user: User | null, userData: UserData | null }>>
  }
  
  export const appContext = React.createContext<AppContextType | undefined>(undefined)

  export const useAppContext = () => {
    const context = React.useContext(appContext)
    if (!context) {
      throw new Error('useAppContext must be used within an AppContextProvider')
    }
    return context
  }