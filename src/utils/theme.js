export const setTheme = (mode) => {
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

export const loadTheme = () => {
  const saved = localStorage.getItem("theme") || "light";
  setTheme(saved);
};