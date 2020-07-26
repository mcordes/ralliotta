#!/bin/sh

# If you don't have realpath install 'coreutils' with apt (Ubuntu) or brew (OS X)
cwd=$(realpath $(dirname $0))


npx nodemon $cwd/mockrally.js -w $cwd
