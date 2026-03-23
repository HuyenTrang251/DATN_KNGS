import React, { createContext, useState, useContext } from 'react';

const HideAuthContext = createContext();

export const HideAuthProvider = ({ children }) => {
  const [hideAuth, setHideAuth] = useState(false);

  return (
    <HideAuthContext.Provider value={{ hideAuth, setHideAuth }}>
      {children}
    </HideAuthContext.Provider>
  );
};

export const useHideAuth = () => useContext(HideAuthContext);