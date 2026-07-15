import css from "./Header.module.css";
export function Header({ className = "", variant = "", ...props }) {
  const variants = variant.split(" ").filter(Boolean);
  const classes = [css.header, ...variants.map((v) => css[v]), className]
    .filter(Boolean)
    .join(" ");
  const dragProps = variants.includes("site")
    ? { "data-tauri-drag-region": "deep" }
    : {};
  return <header className={classes} {...dragProps} {...props} />;
}
