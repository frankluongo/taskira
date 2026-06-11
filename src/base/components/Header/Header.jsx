import css from "./Header.module.css";
export function Header({ className = "", variant = "", ...props }) {
  const variants = variant.split(" ").filter(Boolean);
  const classes = [css.header, ...variants.map((v) => css[v]), className]
    .filter(Boolean)
    .join(" ");
  return <header className={classes} {...props} />;
}
