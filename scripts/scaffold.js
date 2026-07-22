#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const name = process.argv[2]

if (!name) {
  console.error('Usage: npm run scaffold <ComponentName>')
  process.exit(1)
}

if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error(`Invalid component name "${name}" — use PascalCase, e.g. "Badge" or "TabBar".`)
  process.exit(1)
}

const componentDir = path.join(root, 'src', 'base', 'components', name)

if (existsSync(componentDir)) {
  console.error(`"${path.relative(root, componentDir)}" already exists.`)
  process.exit(1)
}

const baseClass = name[0].toLowerCase() + name.slice(1)

const jsx = `import css from "./${name}.module.css";

export function ${name}({ className = "", variant = "", ...props }) {
  const variants = variant.split(" ").filter(Boolean);
  const classes = [css.${baseClass}, ...variants.map((v) => css[v]), className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
}
`

const css = `@layer components {
.${baseClass} {
}
}
`

mkdirSync(componentDir, { recursive: true })
writeFileSync(path.join(componentDir, `${name}.jsx`), jsx)
writeFileSync(path.join(componentDir, `${name}.module.css`), css)

const indexPath = path.join(root, 'src', 'base', 'components', 'index.js')
const lines = readFileSync(indexPath, 'utf8').split('\n').filter(Boolean)
const exportRe = /export \* from "\.\/(\w+)\//

let insertAt = lines.length
for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(exportRe)
  if (match && match[1].localeCompare(name) > 0) {
    insertAt = i
    break
  }
}

lines.splice(insertAt, 0, `export * from "./${name}/${name}";`)
writeFileSync(indexPath, lines.join('\n') + '\n')

console.log(`Scaffolded ${name}:`)
console.log(`  src/base/components/${name}/${name}.jsx`)
console.log(`  src/base/components/${name}/${name}.module.css`)
console.log('  updated src/base/components/index.js')
