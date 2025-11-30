import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setTheme, AVAILABLE_THEMES } from '../slices/themeSlice';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';

export const ThemeSelector: React.FC = () => {
    const dispatch = useDispatch();
    const { currentTheme, isDark } = useSelector((state: RootState) => state.theme);

    const onThemeChange = (e: DropdownChangeEvent) => {
        dispatch(setTheme(e.value));
    };

    const selectedThemeConfig = AVAILABLE_THEMES.find(t => t.file === currentTheme);

    // Group themes by family for better UI if needed, but flat list is fine for now
    // Let's offer a simple Light/Dark toggle logic + Color logic
    
    // Extract base colors (Cyan, Blue, Indigo, Teal, Soho, Viva)
    const baseFamilies = Array.from(new Set(AVAILABLE_THEMES.map(t => {
        const parts = t.name.split(' ');
        if (parts[0] === 'Lara') return parts[2]; // Cyan, Blue...
        return parts[0]; // Soho, Viva
    })));

    const handleColorChange = (family: string) => {
        // Find corresponding theme preserving mode (light/dark)
        let nextTheme = AVAILABLE_THEMES.find(t => t.name.includes(family) && t.isDark === isDark);
        if (!nextTheme) {
            // Fallback if specific combo doesn't exist
            nextTheme = AVAILABLE_THEMES.find(t => t.name.includes(family));
        }
        if (nextTheme) {
            dispatch(setTheme(nextTheme.file));
        }
    };

    const toggleMode = (dark: boolean) => {
        if (dark === isDark) return;
        
        // Try to find the counterpart (e.g., lara-light-cyan -> lara-dark-cyan)
        const currentFamily = selectedThemeConfig?.name.replace('Light ', '').replace('Dark ', '').replace('Lara ', '').replace('Soho ', 'Soho').replace('Viva ', 'Viva');
        
        // Construct target name part roughly
        let targetTheme = AVAILABLE_THEMES.find(t => t.isDark === dark && t.name.includes(currentFamily || 'Cyan'));
        
        if (!targetTheme) {
            // Default fallback
            targetTheme = AVAILABLE_THEMES.find(t => t.isDark === dark && t.file.includes('cyan'));
        }

        if (targetTheme) {
            dispatch(setTheme(targetTheme.file));
        }
    };

    return (
        <div className="flex flex-column gap-4">
            <div>
                <label className="block text-900 font-medium mb-2">Mode</label>
                <div className="flex gap-4">
                    <div className="flex align-items-center">
                        <RadioButton inputId="modeLight" name="mode" value={false} checked={!isDark} onChange={() => toggleMode(false)} />
                        <label htmlFor="modeLight" className="ml-2">Light</label>
                    </div>
                    <div className="flex align-items-center">
                        <RadioButton inputId="modeDark" name="mode" value={true} checked={isDark} onChange={() => toggleMode(true)} />
                        <label htmlFor="modeDark" className="ml-2">Dark</label>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-900 font-medium mb-2">Theme Family</label>
                <div className="flex flex-wrap gap-2">
                    {baseFamilies.map(family => {
                        const isSelected = selectedThemeConfig?.name.includes(family);
                        return (
                            <div 
                                key={family} 
                                onClick={() => handleColorChange(family)}
                                className={`
                                    cursor-pointer px-3 py-2 border-round border-1 transition-colors
                                    ${isSelected ? 'bg-primary text-primary-inverse border-primary' : 'surface-card border-300 text-700 hover:surface-100'}
                                `}
                            >
                                {family}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="block text-900 font-medium mb-2">Detailed Selection</label>
                <Dropdown 
                    value={currentTheme} 
                    options={AVAILABLE_THEMES} 
                    onChange={onThemeChange} 
                    optionLabel="name" 
                    optionValue="file"
                    className="w-full"
                    placeholder="Select a theme" 
                />
            </div>
        </div>
    );
};
