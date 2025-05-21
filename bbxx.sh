#!/bin/bash

case "$1" in
  compile)
    cmake -B build
    cmake --build build
    ;;

  run)
    cp build/beatboxx .
    ./beatboxx
    ;;

  clean)
    rm -f beatboxx
    ;;

  *)
    echo "usage: ./bbxx { compile | run | clean }"
    exit 1
    ;;
esac