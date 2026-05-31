import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api
      .getSettings()
      .then((res) => setSettings(res.data || {}))
      .catch(() => setSettings({}));
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
