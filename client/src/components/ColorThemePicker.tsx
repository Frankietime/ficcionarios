/**
 * Horizontal bar of 17 color theme circles.
 */
import { useThemeStore, COLOR_THEMES, THEME_NAMES } from '../stores/themeStore';

export function ColorThemePicker() {
  const { colorTheme, isDark, setColorTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-1 cursor-pointer">
      {THEME_NAMES.map((name) => {
        const theme = COLOR_THEMES[name];
        const color = isDark ? theme.dark.main : theme.light.main;
        const isActive = colorTheme === name;

        return (
          <button
            key={name}
            type="button"
            onClick={() => setColorTheme(name)}
            className={`w-5 h-5 rounded-full cursor-pointer border-2 border-border flex-shrink-0 transition-shadow ${
              isActive ? 'ring-2 ring-ring ring-offset-2' : ''
            }`}
            style={{ backgroundColor: color }}
            title={name}
          />
        );
      })}
    </div>
  );
}
