import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [darkmode, setDarkmode] = useState(
    localStorage.getItem("darkmode") === "active"
  );

  useEffect(() => {
    if (darkmode) {
      document.body.classList.add("darkmode");
      localStorage.setItem("darkmode", "active");
    } else {
      document.body.classList.remove("darkmode");
      localStorage.setItem("darkmode", "null");
    }
  }, [darkmode]);

  return [darkmode, setDarkmode];
}
