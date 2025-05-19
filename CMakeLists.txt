cmake_minimum_required(VERSION 3.16)
project(beatboxx)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIGURATION>")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIGURATION>")

add_subdirectory(vendored/SDL EXCLUDE_FROM_ALL)
add_subdirectory(vendored/SDL_mixer EXCLUDE_FROM_ALL)
add_subdirectory(vendored/SDL_image EXCLUDE_FROM_ALL)

add_subdirectory(vendored/freetype EXCLUDE_FROM_ALL)
add_library(Freetype::Freetype ALIAS freetype)

add_subdirectory(vendored/RmlUi EXCLUDE_FROM_ALL)

if(EMSCRIPTEN)
	set(CMAKE_EXECUTABLE_SUFFIX ".html" CACHE INTERNAL "")
	#set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s USE_SDL=2 -s FULL_ES3=1 -s USE_WEBGL2=1")
endif()

file(GLOB_RECURSE PROJECT_SOURCES
     CONFIGURE_DEPENDS
     "${CMAKE_SOURCE_DIR}/src/*.cpp"
     "${CMAKE_SOURCE_DIR}/src/*.h"
)

list(APPEND PROJECT_SOURCES
  "${CMAKE_SOURCE_DIR}/vendored/RmlUi/Backends/RmlUi_Backend_SDL_GL3.cpp"
  "${CMAKE_SOURCE_DIR}/vendored/RmlUi/Backends/RmlUi_Platform_SDL.cpp"
  "${CMAKE_SOURCE_DIR}/vendored/RmlUi/Backends/RmlUi_Renderer_GL3.cpp"
)

add_executable(beatboxx ${PROJECT_SOURCES})

add_library(glad STATIC
  glad/glad.c
)

target_include_directories(glad PUBLIC
  glad
)

add_library(rmlui_gl3_backend INTERFACE)
target_include_directories(rmlui_gl3_backend INTERFACE
  "${CMAKE_SOURCE_DIR}/vendored/RmlUi/Backends"
)
target_compile_definitions(rmlui_gl3_backend INTERFACE
  RMLUI_SDL_VERSION_MAJOR=3
  RMLUI_NUM_MSAA_SAMPLES=4
  RMLUI_GL3_CUSTOM_LOADER=<glad.h>
)

target_link_libraries(beatboxx
  PRIVATE
    SDL3::SDL3
    SDL3_mixer::SDL3_mixer
    SDL3_image::SDL3_image

    RmlUi::RmlUi
    rmlui_gl3_backend
    glad
)

target_compile_definitions(beatboxx PRIVATE
  RMLUI_SDL_VERSION_MAJOR=3
  RMLUI_SDL_VERSION_MINOR=3
  RMLUI_SDL_VERSION_PATCH=0
)
