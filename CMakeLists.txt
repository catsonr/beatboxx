cmake_minimum_required(VERSION 3.16)
project(beatboxx)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIGURATION>")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/$<CONFIGURATION>")

add_subdirectory(vendored/SDL EXCLUDE_FROM_ALL)

file(GLOB_RECURSE PROJECT_SOURCES
     CONFIGURE_DEPENDS
     "${CMAKE_SOURCE_DIR}/src/*.cpp"
     "${CMAKE_SOURCE_DIR}/src/*.h"
)

add_executable(beatboxx ${PROJECT_SOURCES})

target_include_directories(beatboxx PRIVATE
  ${CMAKE_SOURCE_DIR}/src/miku
)

target_link_libraries(beatboxx PRIVATE SDL3::SDL3)