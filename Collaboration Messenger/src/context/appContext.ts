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
  notifications: {} | null,
  createdOn: Date;
  friendsRequest: {} | null,
  friends: {}
}

export interface AppContextType {
  user: User | any
  userData: UserData | any
  setContext: Dispatch<SetStateAction<{ user: User | any, userData: UserData | any }>>
}

/**
 * The context object for the app.
 * @typeParam AppContextType - The type of the app context.
 */
export const AppContext = React.createContext<AppContextType | undefined>(undefined)

/**
 * Custom hook to access the AppContext.
 * @returns The AppContext object.
 * @throws {Error} If used outside of an AppContextProvider.
 */
export const useAppContext = () => {
  const context = React.useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}

/**
 * Represents the type of the Dyte context.
 */
export type DyteContextType = {
  meeting: any;
  initMeeting: any;
};

/**
 * The DyteContext is a React context that holds the DyteContextType.
 * It is used to provide the DyteContextType to the components in the application.
 */
export const DyteContext = React.createContext<DyteContextType | undefined>(undefined);

/**
 * Custom hook to access the Dyte context.
 * @returns The Dyte context.
 * @throws {Error} If used outside of a DyteContextProvider.
 */
export const useDyteContext = () => {
  const context = React.useContext(DyteContext);
  if (!context) {
    throw new Error('useDyteContext must be used within a DyteContextProvider');
  }
  return context;
};


/**
 * Represents the type of the call context.
 */
export type CallContextType = {
  /**
   * Indicates whether the user is currently in a call.
   */
  inCall: boolean;

  /**
   * Sets the value of `inCall`.
   * @param value - The new value for `inCall`.
   */
  setInCall: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Context for managing call-related data.
 */
export const CallContext = React.createContext<CallContextType | undefined>(undefined);

/**
 * Custom hook to access the CallContext.
 * @returns The CallContext object.
 * @throws Error if used outside of a CallContextProvider.
 */
export const useCallContext = () => {
  const context = React.useContext(CallContext);
  if (!context) {
    throw new Error('useCallContext must be used within a CallContextProvider');
  }
  return context;
};