import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ThemeConfig {
    name: string;
    file: string;
    isDark: boolean;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
    { name: 'Lara Light Cyan', file: 'lara-light-cyan', isDark: false },
    { name: 'Lara Dark Cyan', file: 'lara-dark-cyan', isDark: true },
    { name: 'Lara Light Blue', file: 'lara-light-blue', isDark: false },
    { name: 'Lara Dark Blue', file: 'lara-dark-blue', isDark: true },
    { name: 'Lara Light Indigo', file: 'lara-light-indigo', isDark: false },
    { name: 'Lara Dark Indigo', file: 'lara-dark-indigo', isDark: true },
    { name: 'Lara Light Teal', file: 'lara-light-teal', isDark: false },
    { name: 'Lara Dark Teal', file: 'lara-dark-teal', isDark: true },
    { name: 'Soho Light', file: 'soho-light', isDark: false },
    { name: 'Soho Dark', file: 'soho-dark', isDark: true },
    { name: 'Viva Light', file: 'viva-light', isDark: false },
    { name: 'Viva Dark', file: 'viva-dark', isDark: true },
];

interface ThemeState {
    currentTheme: string; // The file name
    isDark: boolean;
}

const initialState: ThemeState = {
    currentTheme: 'lara-light-cyan',
    isDark: false,
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<string>) => {
            const themeConfig = AVAILABLE_THEMES.find(t => t.file === action.payload);
            if (themeConfig) {
                state.currentTheme = themeConfig.file;
                state.isDark = themeConfig.isDark;
                
                // Update DOM
                const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
                if (themeLink) {
                    themeLink.href = `https://unpkg.com/primereact/resources/themes/${themeConfig.file}/theme.css`;
                }
            }
        },
    },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
