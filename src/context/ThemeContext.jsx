// ThemeContext removed - GharKaSwad uses a unified brand theme.
export const ThemeProvider = ({ children }) => children;
export const useTheme = () => ({ theme: 'light', isDark: false, toggleTheme: () => {} });
export default ThemeProvider;
