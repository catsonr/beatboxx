#ifndef RUN_H
#define RUN_H

#include "Chart.h"

enum class type : uint8_t {
    tap = 0,
    hold = 1,
}; // type

enum class buttons : uint8_t {
    divaL1 = 0,
    divaL2 = 1,
    divaL3 = 2,
    divaL4 = 3,

    divaR1 = 4,
    divaR2 = 5,
    divaR3 = 6,
    divaR4 = 7,

    tkL = 8,
    tkR = 9,
        
    space = 10,
}; // button

struct Run
{
    const Chart& chart;
    const uint64_t safe_window { 10000 };

    Run(const Chart& chart) : chart(chart) {}

    /* the number of notes hit correctly in a row */
    int combo { 0 };
    /* the highest combo achieved */
    int combo_highest { 0 };

    int score { 0 };
    /* the value added to score if a note is hit perfectly in time */
    static const int SCORE_PERFECT_HIT { 100 };
    
    void button_pressed(uint64_t frame, buttons button)
    {
        printf("button pressed @ %llu\n", frame);

        uint64_t current_beat_frame = chart.beats.front();
        if( chart.current_beat >= 0 )
            current_beat_frame = chart.beats[chart.current_beat];

        uint64_t next_beat_frame = chart.beats.back();
        if( chart.current_beat + 1 < chart.beats.size() )
            next_beat_frame = chart.beats[chart.current_beat + 1];
        
        printf("\tcurrent beat @ %llu | next beat @ %llu\n", current_beat_frame, next_beat_frame);
        
        /* how far from the nearest beat (in frames) the button press is */
        uint64_t dt;
        int closest_beat_index = 0;
        /* whether or not the button press happened BEFORE the current beat or AFTER the current beat */
        bool before = false;
        if( chart.current_beat < 0 ) { // if first beat hasn't happened yet (which would mean current_beat_frame and next_beat_frame both point at beat 0)
            dt = current_beat_frame - frame;
        }
        else {
            dt = frame - current_beat_frame;
            uint64_t dt2 = next_beat_frame - frame;
            
            if( dt2 < dt ) {
                before = true;
                closest_beat_index = chart.current_beat + 1;
                dt = dt2;
            }
            else closest_beat_index = chart.current_beat;
        }
        
        printf("\tclosest beat is beat %i\n", closest_beat_index);
        printf("\tbutton %llu frames %s beat!\n", dt, before ? "before" : "after");
    }
    
    void button_released(uint64_t frame, buttons button)
    {
        // handle hold notes
    }
}; // Run

#endif // RUN_H