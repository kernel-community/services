echo "${PWD}"
cp -R packages/projects/node_modules/acorn-jsx packages/projects/node_modules/acorn-jsx-esm
cp patches/acorn-jsx-esm/* packages/projects/node_modules/acorn-jsx-esm
cp patches/micromark-extension-mdxjs/index.js packages/projects/node_modules/micromark-extension-mdxjs/
