SRC=$PWD/src
DIST=$PWD/dist
BUILD=$PWD/build

if [ ! -d node_modules ]; then
  npm install
fi

rm -rf $DIST
mkdir -p $DIST/scripts/content
mkdir $DIST/controllers
mkdir $DIST/assets

cp -r $SRC/assets $DIST
cp $SRC/manifest.json $DIST/manifest.json
npx minify $SRC/scripts/background.js > $DIST/scripts/background.js
npx minify $SRC/scripts/content/content.js > $DIST/scripts/content/content.js
npx minify $SRC/scripts/content/tooltip.js > $DIST/scripts/content/tooltip.js
npx minify $SRC/controllers/dictionary.js > $DIST/controllers/dictionary.js

rm -rf $BUILD
mkdir $BUILD
cd $DIST
zip -r $BUILD/yaka-sinhala-english-dictionary.zip .
cd -

echo "Building completed."
