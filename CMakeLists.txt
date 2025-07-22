cmake_minimum_required(VERSION 3.16)
project(beatboxx)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIGURATION>")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIGURATION>")

add_subdirectory(vendored/SDL EXCLUDE_FROM_ALL)
add_subdirectory(vendored/glm EXCLUDE_FROM_ALL)

file(GLOB_RECURSE PROJECT_SOURCES
     CONFIGURE_DEPENDS
     "${CMAKE_SOURCE_DIR}/src/*.cpp"
     "${CMAKE_SOURCE_DIR}/src/*.h"
)
add_executable(beatboxx ${PROJECT_SOURCES})

if(EMSCRIPTEN)
  set_target_properties(beatboxx PROPERTIES SUFFIX ".html")

  # audio worklet flags
  #target_compile_definitions(beatboxx PRIVATE MA_ENABLE_AUDIO_WORKLETS)

  target_link_options(beatboxx PRIVATE
    "--shell-file=${CMAKE_SOURCE_DIR}/src/neocities/index.html" # emscriptem use custom template

    -sUSE_SDL=3
    -sFULL_ES3=1
    -sUSE_WEBGL2=1
    -sALLOW_MEMORY_GROWTH=1
    
    # audio worklet flags
    #-sAUDIO_WORKLET=1
    #-sWASM_WORKERS=1
    #-sASYNCIFY
    #-sSHARED_MEMORY=1
    
    #-sSINGLE_FILE=1

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

# implot
file(GLOB IMPLOT_SOURCES
  "${CMAKE_SOURCE_DIR}/vendored/implot/implot.cpp"
  "${CMAKE_SOURCE_DIR}/vendored/implot/implot_items.cpp"
  "${CMAKE_SOURCE_DIR}/vendored/implot/implot_demo.cpp"
)

add_library(implot STATIC ${IMPLOT_SOURCES})

target_include_directories(implot PUBLIC
  "${CMAKE_SOURCE_DIR}/vendored/implot"
)

target_link_libraries(implot
  PRIVATE imgui
)

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

# miniaudio
target_include_directories(beatboxx PRIVATE
  ${CMAKE_SOURCE_DIR}/miniaudio
)

# polyline2d
add_library(Polyline2D INTERFACE)
target_include_directories(Polyline2D INTERFACE
  ${CMAKE_SOURCE_DIR}/vendored/Polyline2D/include
)

# fastnoiselite
target_include_directories(beatboxx PRIVATE
  ${CMAKE_SOURCE_DIR}/FastNoiseLite
)

# stb
target_include_directories(beatboxx PRIVATE
  ${CMAKE_SOURCE_DIR}/stb
)

# freetype
set(FREETYPE_ROOT "${CMAKE_SOURCE_DIR}/vendored/freetype")

add_subdirectory(
  ${FREETYPE_ROOT}
  ${CMAKE_BINARY_DIR}/freetype-build
  EXCLUDE_FROM_ALL
)

target_include_directories(beatboxx PRIVATE
  ${FREETYPE_ROOT}/include
)

# link libraries
target_link_libraries(beatboxx
  PRIVATE
    SDL3::SDL3
    glm::glm

    glad
    imgui
    implot
    json
    nanovg
    Polyline2D
    freetype
)

target_include_directories(beatboxx PRIVATE
  ${CMAKE_SOURCE_DIR}/src
)
