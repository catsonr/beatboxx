#ifndef CHART_H
#define CHART_H

// std
#include <cstdint>
#include <vector>

// beatboxx
#include "Meter.h"

struct Note
{
    int beat; // which beat of the chart the note lies
    int beat_subdivision; // the level of beat subdivision (1=none, 2=half beat, 3=triplet beat)
    int beat_subdivision_count; // which of the subdivisions the actual note lies on (starting at 0)
    uint64_t frame; // the exact frame the note is to occur
    uint64_t frame_quantized; // the frame of the nearest beat or subdivision
}; // Note

struct Chart
{
    Meter meter;
    std::vector<Note> notes;
    
    // TEMP FUNCTION!
    void add_note(uint64_t frame)
    {
        Note note;
        note.beat = meter.current_beat;
        note.beat_subdivision = 1;
        note.beat_subdivision_count = 0;
        note.frame = frame;
        note.frame_quantized = meter.beat_locations[meter.current_beat];
        
        notes.push_back(note);
    }
}; // Chart

#endif // CHART_H