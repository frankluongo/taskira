import { useEffect, useState } from "react";

export const colorSpacesArray = [
  "in srgb",
  "in srgb-linear",
  "in display-p3",
  "in a98-rgb",
  "in prophoto-rgb",
  "in rec2020",
  "in lab",
  "in oklab",
  "in xyz",
  "in xyz-d50",
  "in xyz-d65",
];

export function useColorMixer() {
  const [colors, setColors] = useState([]);
  const [mode, setMode] = useState(colorSpacesArray[0]);
  const [start, setStart] = useState("");
  const [startPercent, setStartPercent] = useState(100);
  const [endPercent, setEndPercent] = useState(100);
  const [end, setEnd] = useState("");

  useEffect(() => {
    const rootStyles = window.getComputedStyle(document.documentElement);
    const colorStylesArray = Object.entries(rootStyles)
      .map(([_, value]) => value)
      .filter((value) => value.startsWith("--color-"));
    setColors(colorStylesArray);
    setStart(colorStylesArray[0] ?? "");
    setEnd(colorStylesArray[1] ?? colorStylesArray[0] ?? "");
  }, []);

  return {
    colors,
    end,
    endPercent,
    mode,
    setEnd,
    setEndPercent,
    setMode,
    setStart,
    setStartPercent,
    start,
    startPercent,
  };
}
