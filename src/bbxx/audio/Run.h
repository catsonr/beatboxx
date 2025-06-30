#ifndef RUN_H
#define RUN_H

#include "Chart.h"

/*
    the number of frames a note and a hit can be seperated by (dt) to count for each judgement
    if dt > SAFE, the note is considered missed
*/
enum class judgements : uint64_t {
    PERFECT = 1000,
    COOL    = 2000,
    SAFE    = 6000,
    MISS    = UINT64_MAX
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
    NoteResult(const Chart& chart, const Note& note) :
        note(note)
    {
        frame = chart.get_note_frame(note);
    }

    const Note& note;
    
    uint64_t frame;
    
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
        if( noteresults[noteresults_index].frame + static_cast<uint64_t>(judgements::SAFE) <= frame)
        {
            noteresults[noteresults_index].judgement = judgements::MISS;
            noteresults[noteresults_index].passed = true;
            
            printf("note %i missed!\n", noteresults_index);
            
            noteresults_index++;
            
            if( combo > combo_max ) combo_max = combo;
            combo = 0;
        }
    }
    
    /* sets note has hit */
    void handle_note_hit(uint64_t dt)
    {
        noteresults[noteresults_index].passed = true;
        
        if( dt <= static_cast<uint64_t>(judgements::PERFECT) )
            noteresults[noteresults_index].judgement = judgements::PERFECT;
        else if( dt <= static_cast<uint64_t>(judgements::COOL) )
            noteresults[noteresults_index].judgement = judgements::COOL;
        else if( dt <= static_cast<uint64_t>(judgements::SAFE) )
            noteresults[noteresults_index].judgement = judgements::SAFE;
        else {
            printf("[Run::handle_note_hit] handle_note_hit() called for dt not within safe range! (ignoring, though this message should never be seen)\n");
        }
        
        printf("note %i hit\n", noteresults_index);
        
        noteresults_index++;
        combo++;
    }

    // determines if current note is within judgement zone, and if so calls handle_note_hit()
    void button_pressed(uint64_t frame, buttons button)
    {
        if( button == buttons::space ) space_down = true;
        
        printf("[Run::button_pressed] @ frame %llu -- checking note %i\n", frame, noteresults_index);
        
        uint64_t currentnoteframe = chart.get_note_frame(noteresults[noteresults_index].note);
        
        uint64_t dt;
        if( currentnoteframe >= frame)
            dt = currentnoteframe - frame;
        else
            dt = frame - currentnoteframe;
    }
    
    void button_released(uint64_t frame, buttons button)
    {
        if( button == buttons::space ) space_down = false;
        // handle hold notes
    }
}; // Run

#endif // RUN_H