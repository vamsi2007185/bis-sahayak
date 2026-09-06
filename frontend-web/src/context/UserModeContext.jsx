import React, { createContext, useContext, useState, useEffect } from 'react';

const UserModeContext = createContext();

export const UserModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('bis_user_mode') || 'msme'; // 'consumer' | 'msme'
  });

  useEffect(() => {
    localStorage.setItem('bis_user_mode', mode);
  }, [mode]);

  const isMSME = mode === 'msme';

  return (
    <UserModeContext.Provider value={{ mode, setMode, isMSME }}>
      {children}
    </UserModeContext.Provider>
  );
};

export const useUserMode = () => useContext(UserModeContext);
