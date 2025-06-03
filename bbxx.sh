#!/usr/bin/env bash
set -e

COMMAND="$1"
FLAG="$2"

case "$COMMAND" in
  init)
    # If and only if ./vcpkg.json does not exist
    if [ ! -f "./vcpkg.json" ]; then
      cd vendored/vcpkg
      ./bootstrap-vcpkg.sh
      ./vcpkg add port msdfgen
      cd ../..
    fi

    # If --emscripten flag is passed
    if [ "$FLAG" = "--emscripten" ]; then
      if [ ! -d "emsdk" ]; then
        git clone https://github.com/emscripten-core/emsdk.git
      fi
      cd emsdk
      ./emsdk install latest
      ./emsdk activate latest
      cd ..
    fi
    ;;
    
  compile)
    rm -rf build

	export VCPKG_ROOT="$(pwd)/vendored/vcpkg"
	export PATH="$VCPKG_ROOT:$PATH"
    # If directory emsdk/ exists
    if [ -d "emsdk" ]; then
      source ./emsdk/emsdk_env.sh
      emcmake cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE="$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake"

    else
      cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE="$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake"
    fi

    cmake --build build
    ;;
    
  run)
    # If directory emsdk/ exists
    if [ -d "emsdk" ]; then
      python3 -m http.server &
      # Open default web browser at http://localhost:8000/
      if command -v open >/dev/null 2>&1; then
        open http://localhost:8000/
      elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://localhost:8000/
      fi
      wait
    else
      ./build/beatboxx
    fi
    ;;

  *)
    echo "Usage: $0 { init [--emscripten] | compile | run }"
    exit 1
    ;;
esac
