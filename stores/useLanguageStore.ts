import { create } from "zustand";

interface LanguageState {
  language: string;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "English",
  toggleLanguage: () =>
    set((state) => ({
      language: state.language === "English" ? "Portuguese" : "English",
    })),
}));
