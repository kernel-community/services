echo "${PWD}"
# projects
PACKAGE="projects"
cp -R packages/${PACKAGE}/node_modules/acorn-jsx packages/${PACKAGE}/node_modules/acorn-jsx-esm
cp patches/acorn-jsx-esm/* packages/${PACKAGE}/node_modules/acorn-jsx-esm
cp patches/micromark-extension-mdxjs/index.js packages/${PACKAGE}/node_modules/micromark-extension-mdxjs/
# www
PACKAGE="www"
cp -R packages/${PACKAGE}/node_modules/acorn-jsx packages/${PACKAGE}/node_modules/acorn-jsx-esm
cp patches/acorn-jsx-esm/* packages/${PACKAGE}/node_modules/acorn-jsx-esm
cp patches/micromark-extension-mdxjs/index.js packages/${PACKAGE}/node_modules/micromark-extension-mdxjs/
