#!/usr/bin/env sh

set -e

VERSION="$1"

if [ -z "$VERSION" ]
then
  echo "error: version not set"
  exit 1
fi

echo "setting to $VERSION"

npm version --no-git-tag-version --allow-same-version -C server $VERSION
npm version --no-git-tag-version --allow-same-version -C client $VERSION

git add -A
npm version --no-git-tag-version $VERSION

git commit -m "$VERSION"
git tag "v$VERSION" -m "$VERSION"
