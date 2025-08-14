#!/bin/bash -e
npm run build
git add dist/*
git commit -m "dist"
git subtree push -f --prefix dist origin gh-pages

