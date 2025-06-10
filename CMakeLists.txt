if (NOT DEFINED CMAKE_TOOLCHAIN_FILE)
  set(CMAKE_TOOLCHAIN_FILE
      "${CMAKE_SOURCE_DIR}/vendored/vcpkg/scripts/buildsystems/vcpkg.cmake"
      CACHE STRING "Vcpkg toolchain file")
endif()

cmake_minimum_required(VERSION 3.16)
project(beatboxx)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIGURATION>")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIGURATION>")

find_package(msdfgen CONFIG REQUIRED)
find_package(freetype CONFIG REQUIRED)
#set(MSDF_ATLAS_GEN_BUILD_MSDFGEN OFF CACHE BOOL "")
file(GLOB MSDF_ATLAS_GEN_SOURCES
    "vendored/msdf-atlas-gen/msdf-atlas-gen/*.cpp"
)
add_library(msdf-atlas-gen STATIC ${MSDF_ATLAS_GEN_SOURCES})
target_include_directories(msdf-atlas-gen PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/vendored/msdf-atlas-gen
    ${CMAKE_CURRENT_SOURCE_DIR}/vendored/msdf-atlas-gen/artery-font-format
)
target_link_libraries(msdf-atlas-gen PUBLIC msdfgen::msdfgen freetype)

add_subdirectory(vendored/SDL EXCLUDE_FROM_ALL)
add_subdirectory(vendored/SDL_mixer EXCLUDE_FROM_ALL)
add_subdirectory(vendored/glm EXCLUDE_FROM_ALL)

file(GLOB_RECURSE PROJECT_SOURCES
     CONFIGURE_DEPENDS
     "${CMAKE_SOURCE_DIR}/src/*.cpp"
     "${CMAKE_SOURCE_DIR}/src/*.h"
)
add_executable(beatboxx ${PROJECT_SOURCES})

if(EMSCRIPTEN)
	set(CMAKE_EXECUTABLE_SUFFIX ".html" CACHE INTERNAL "")
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s USE_SDL=2 -s FULL_ES3=1 -s USE_WEBGL2=1 -s ALLOW_MEMORY_GROWTH=1")
  target_link_options(beatboxx PRIVATE
    "--preload-file=${CMAKE_SOURCE_DIR}/assets@/assets"
    "--preload-file=${CMAKE_SOURCE_DIR}/vendored/lygia@/vendored/lygia"
  )
endif()

# glad
add_library(glad STATIC
  glad/src/glad.c
)

target_include_directories(glad PUBLIC
	glad/include
	glad/include/glad
)

# imgui
file(GLOB IMGUI_SOURCES
  vendored/imgui/imgui.cpp
  vendored/imgui/imgui_draw.cpp
  vendored/imgui/imgui_tables.cpp
  vendored/imgui/imgui_widgets.cpp
  vendored/imgui/imgui_demo.cpp

  vendored/imgui/backends/imgui_impl_sdl3.cpp
  vendored/imgui/backends/imgui_impl_opengl3.cpp
)

add_library(imgui STATIC ${IMGUI_SOURCES})

target_include_directories(imgui PUBLIC
    vendored/imgui
    vendored/imgui/backends
)

target_link_libraries(imgui PRIVATE SDL3::SDL3)

# nlohmann/json
add_library(json INTERFACE)

target_include_directories(json INTERFACE
  ${CMAKE_SOURCE_DIR}
)

# nanovg
set(NANOVG_ROOT "${CMAKE_SOURCE_DIR}/vendored/nanovg")
set(NANOVG_SOURCES
  "${NANOVG_ROOT}/src/nanovg.c"
)

add_library(nanovg STATIC ${NANOVG_SOURCES})

target_include_directories(nanovg PUBLIC
  "${NANOVG_ROOT}/src"
)

target_link_libraries(nanovg
  glad
  glm::glm
)

# link libraries
target_link_libraries(beatboxx
  PRIVATE
    SDL3::SDL3
    SDL3_mixer::SDL3_mixer
    glm::glm

    glad
    imgui
    
    json
    
    nanovg
    
    msdfgen::msdfgen
    msdf-atlas-gen
)
