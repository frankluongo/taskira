import { Input, Select } from "@/base";
import { colorSpacesArray, useColorMixer } from "./useColorMixer";
import css from "./ColorMixer.module.css";

export function ColorMixer() {
  const {
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
  } = useColorMixer();
  return (
    <div className={css.container}>
      <div className={css.inputs}>
        <div className={css.row}>
          <Select
            id="color-start"
            label="Start Color"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {colorSpacesArray.map((colorSpace) => (
              <option key={colorSpace} value={colorSpace}>
                {colorSpace}
              </option>
            ))}
          </Select>
        </div>
        <div className={css.row}>
          <Select
            id="color-start"
            label="Start Color"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          >
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </Select>
          <Select
            id="color-end"
            label="End Color"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          >
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </Select>
        </div>
        <div className={css.row}>
          <Input
            id="color-start-percent"
            label="Start Percent"
            type="number"
            min="0"
            max="100"
            step="5"
            value={startPercent}
            onChange={(e) => setStartPercent(Number(e.target.value))}
          />
          <Input
            id="color-end-percent"
            label="End Percent"
            type="number"
            min="0"
            max="100"
            step="5"
            value={endPercent}
            onChange={(e) => setEndPercent(Number(e.target.value))}
          />
        </div>
      </div>
      <div
        style={{
          border: "1px solid black",
          width: "20rem",
          height: "20rem",
          background: `color-mix(${mode}, var(${start}) ${startPercent}%, var(${end}) ${endPercent}%)`,
        }}
      />
    </div>
  );
}
