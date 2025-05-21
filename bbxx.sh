#!/bin/bash

case "$1" in
  compile)
    cmake -B build
    cmake --build build
    ;;
    
  sym)
    rm -rf build/Debug/assets
    ln -s assets build/Debug/assets
    ;;

  run)
    cp build/beatboxx .
    ./beatboxx
    ;;

  clean)
    rm -f beatboxx
    ;;
    
  r)
    "$0" compile
    "$0" clean
    "$0" run
    ;;
    
  rvs)
    "$0" compile
    "$0" sym
    ./build/Debug/beatboxx
    ;;

  *)
    echo "usage: ./bbxx { compile | run | clean }"
    exit 1
    ;;
esac