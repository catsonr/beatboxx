#ifndef RUN_H
#define RUN_H

#include "Chart.h"

enum class judgements : uint64_t {
    PERFECT = 1000,
    COOL    = 2000,
    SAFE    = 6000,
    MISS    = 7000,
}; // judgements

static constexpr std::array<judgements, 4> judgements_container {
    judgements::PERFECT,
    judgements::COOL,
    judgements::SAFE,
    judgements::MISS,
}; // judgements_container

enum class types : uint8_t {
    tap  = 0,
    hold = 1,
}; // types

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
}; // buttons

struct NoteResult
{
    const Note& note;
    
    uint64_t frame;
    
    NoteResult(const Chart& chart, const Note& note) : note(note)
    {
        frame = chart.get_note_frame(note);
    }
    
    judgements judgement;
    
    bool passed { false };
}; // NoteResult

struct Run
{
    /* CONSTRUCTORS */

    Run(const Chart& chart) : chart(chart) {}

    /* PUBLIC MEMBERS */

    const Chart& chart;

    /* the number of notes hit correctly in a row */
    int combo { 0 };
    /* the highest combo achieved */
    int combo_max { 0 };

    /* the current score of the run */
    int score { 0 };
    /* the value added to score if a note is hit perfectly in time */
    static const int SCORE_PERFECT_HIT { 100 };
    
    /* health, run ends if you reach 0 */
    double gauge { 1.0f };
    
    /* the list of possible notes, with thier status */
    std::vector<NoteResult> noteresults;
    /* the index of the current note in Run */
    int noteresults_index { 0 };
    
    bool space_down { false };
    
    /* PUBLIC METHODS */

    void init()
    {
        noteresults.reserve(chart.notes.size());
        for(const Note& note : chart.notes)
        {
            noteresults.emplace_back(chart, note);
        }
    }
    
    void iterate(uint64_t frame)
    {
        // if next unhit note passes miss threshold (if current note is missed)
        if( !noteresults[noteresults_index].passed && noteresults[noteresults_index].frame + static_cast<uint64_t>(judgements::MISS) < frame)
        {
            noteresults[noteresults_index].judgement = judgements::MISS;
            noteresults[noteresults_index].passed = true;
            
            printf("note %i missed!\n", noteresults_index);
            
            noteresults_index++;
            
            if( combo_max < combo ) combo_max = combo;
            combo = 0;
        }
    }
    
    /* sets note has hit */
    void handle_note_hit()
    {
        noteresults[noteresults_index].passed = true;
        noteresults[noteresults_index].judgement = judgements::COOL;

        
        printf("note %i hit\n", noteresults_index);
        
        noteresults_index++;
        combo++;
    }

    /* finds the nearest note at the time of the button press */
    void button_pressed(uint64_t frame, buttons button)
    {
        if( button == buttons::space ) space_down = true;

        const std::vector<Note>& notes_curr = chart.get_beat_notes(chart.current_beat);
        const std::vector<Note>& notes_next = chart.get_beat_notes(chart.current_beat + 1);
        
        // vector of both current beat's and next beat's notes
        std::vector<Note> notes_all;
        notes_all.reserve(notes_curr.size() + notes_next.size());
        notes_all.insert(notes_all.end(), notes_curr.begin(), notes_curr.end());
        notes_all.insert(notes_all.end(), notes_next.begin(), notes_next.end());
        
        int closest_index = 0;
        uint64_t closest_dist = UINT64_MAX;
        
        int i = 0;
        for(const Note& note : notes_all)
        {
            uint64_t note_frame = chart.get_note_frame(note);
            
            uint64_t dt;
            if( frame >= note_frame)
                dt = frame - note_frame;
            else
                dt = note_frame - frame;

            if( dt < closest_dist ) {
                closest_dist = dt;
                closest_index = i;
            }
            
            i++;
        }
        
        if( closest_dist < static_cast<uint64_t>(judgements::MISS) )
            handle_note_hit();
    }
    
    void button_released(uint64_t frame, buttons button)
    {
        if( button == buttons::space ) space_down = false;
        // handle hold notes
    }
}; // Run

#endif // RUN_H