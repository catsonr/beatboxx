#ifndef CHART_H
#define CHART_H

// std
#include <cstdint>
#include <vector>

// beatboxx
#include "Meter.h"

struct Note
{
    /*
        which beat of the chart the note lies
    */
    int beat;

    /*
        where in the beat the note lies 
            e.g. (assume 4/4):
                0.0 -> lies on beat
                0.5 -> lies on upbeat
                0.66 -> lies on 'li' of quarter note triplet
    */
    float beat_pos;
}; // Note

struct Chart
{
    Meter meter;
    std::vector<Note> notes;
    
    void add_note(uint64_t frame)
    {
        Note note;

        note.beat = meter.current_beat;

        uint64_t dFrames = meter.get_dFrames(meter.current_beat);
        uint64_t current_beat_location = meter.beat_locations[meter.current_beat];
        note.beat_pos = (float)(current_beat_location - frame) / dFrames;
        
        notes.push_back(note);
    }
}; // Chart

#endif // CHART_H