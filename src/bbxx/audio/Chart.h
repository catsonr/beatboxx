#ifndef CHART_H
#define CHART_H

// std
#include <cstdint>
#include <vector>

// json
#include <nlohmann/json.hpp>

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
    float pos;
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
        note.pos = (float)(frame - current_beat_location) / dFrames;
        
        quantize(&note);
        
        notes.push_back(note);
    }
    
    const std::vector<float> quantize_positions {
        0.0,
        0.25,
        0.5,
        0.75,
        1.0
    };
    const float epsilon = 0.20;
    bool quantize(Note* note)
    {
        for(float quant : quantize_positions)
        {
            if( fabs(note->pos - quant) <= epsilon )
            {
                if(quant == 1.0)
                {
                    note->beat++;
                    note->pos = 0.0;
                    return true;
                }
                else 
                {
                    note->pos = quant;
                    return true;
                }
            }
        }
        
        return false;
    }
}; // Chart

#endif // CHART_H