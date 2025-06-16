#ifndef CHART_H
#define CHART_H

#include <cstdint>
#include <vector>

enum NoteType {

};

struct Note
{
    NoteType notetype;
    int beat; // which beat of the chart the note lies
    int beat_subdivision; // how many times the beat is subdivided
    int beat_subdivision_count; // which of the subdivisions the actual note lies on
}; // Note

struct Chart
{
    std::vector<Note*> notes;
}; // Chart

#endif // CHART_H