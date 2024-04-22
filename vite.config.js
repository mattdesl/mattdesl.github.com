import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve, basename, relative, dirname, join, extname } from "path";
import * as fs from "fs";
import maxstache from "maxstache";

const pageDir = resolve(__dirname, "pages");
const templateFile = resolve(__dirname, "pages/_template.html");
const templateSrc = fs.readFileSync(templateFile, "utf8");

const pageDirFiles = fs.readdirSync(pageDir).filter((f) => !f.startsWith("_"));

const htmlFiles = [];
const dirs = pageDirFiles.filter((f) => {
  const isDir = fs.statSync(resolve(pageDir, f)).isDirectory();
  if (!isDir) return false;
  const name = basename(f);
  try {
    return fs.statSync(resolve(pageDir, f, name + ".js")).isFile();
  } catch (err) {
    return false;
  }
});

const doTemplate = (name, dir, entry) => {
  const src = maxstache(templateSrc, {
    name,
    banner: `<!-- auto-generated page, do not edit -->`,
    entry: entry ?? `./${name}/${name}.js`,
  });
  const fileName = `${name}.html`;
  const htmlFile = resolve(dir, fileName);
  fs.writeFileSync(htmlFile, src);
  return fileName;
};

for (let name of dirs) {
  const fileName = doTemplate(name, pageDir);
  htmlFiles.push(fileName);
}

// template index page
doTemplate(`index`, __dirname, "./lib/index.js");

// for (let page of pageDirFiles) {
//   if (page.endsWith(".html")) {
//     htmlFiles.push(page);
//   } else {

//   }
// }

// const htmlFiles = pageDirFiles.filter(
//   (f) => f.endsWith(".html") && !f.startsWith("_")
// );

console.log(`Parsing Files:`, htmlFiles);

// // collect
// const autoPages =

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        ...htmlFiles.reduce((obj, file) => {
          obj[basename(file, extname(file))] = join(pageDir, file);
          return obj;
        }, {}),
      },
      output: {
        entryFileNames: (chunk) => {
          const fileName =
            basename(chunk.facadeModuleId, extname(chunk.facadeModuleId)) +
            ".js";
          const dirNameBase = relative(
            __dirname,
            dirname(chunk.facadeModuleId)
          );
          return join(dirNameBase, fileName);
        },
      },
    },
  },
});
