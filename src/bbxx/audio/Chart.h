#ifndef CHART_H
#define CHART_H

// std
#include <cstdint>
#include <vector>
#include <iostream>
#include <filesystem>
#include <fstream>

// json
#include <nlohmann/json.hpp>

struct Note
{
    /* which beat of the chart the note lies */
    int beat { -1 };
    /*
        where in the beat the note lies 
        e.g. (assume 4/4):
            0.0 -> lies on beat
            0.5 -> lies on upbeat
            0.66 -> lies on 'li' of quarter note triplet
    */
    float pos;
    
    /* which beat of the chart this is (starting at 0) */
    int index { -1 };
}; // Note

struct Chart
{
    /* PUBLIC MEMBERS */
    // all beats in chart
    std::vector<uint64_t> beats;
    int beat_count;

    // all notes in chart
    std::vector<Note> notes;

    // the current beat of playback
    const int BEAT_BEFORE_FIRST { -1 };
    int current_beat { BEAT_BEFORE_FIRST };

    std::filesystem::path json_path;
    const int json_dump_spacing { 2 }; // -1 for no whitespace 
    
    /* PUBLIC METHODS */
    bool init(const char* full_path)
    {
        json_path = std::filesystem::path(full_path);
        json_path.replace_extension(".json");

        if( !json_load() ) {
            printf("[Chart::init] failed to load JSON '%s'!\n", json_path.c_str());
            return false;
        }
        
        return true;
    }

    /* returns true if beat passed this frame */
    bool iterate(uint64_t current_frame)
    {
        // before first beat
        if( beats.size() == 0 || current_frame < beats.front()) {
            return false;
        }
        
        // first beat happens
        else if( current_beat < 0 ) {
            current_beat = 0;
            return true;
        }
        
        // beat passed
        if( current_frame > get_nextBeatLocation(current_beat) && current_beat < (int)beats.size()) {
            current_beat++;
            return true;
        }
        
        return false;
    }
    
    /*
        sets current_beat to what it would be at given frame
    */
    void seek_frame(uint64_t frame)
    {
        current_beat = BEAT_BEFORE_FIRST;
        while(beats[current_beat++] < frame);
        current_beat--;
        current_beat--;
    }
    
    /* returns a vector of all notes in specified beat--returns empty vector if none are found */
    std::vector<Note> get_beat_notes(int beat) const
    {
        std::vector<Note> result;
        for(const Note& note : notes)
        {
            if( note.beat < beat ) continue;
            if( note.beat > beat ) break;
            
            result.push_back(note);
        }
        
        return result;
    }
    
    // JSON 
    // returns true if it created a new file, and false otherwise
    bool json_init()
    {
        if( std::filesystem::exists(json_path) ) return false;

        nlohmann::json j;
        j["beats"] = nlohmann::json::array();
        
        std::ofstream ofs(json_path, std::ios::binary);
        if( !ofs ) {
            std::cerr << "[Chart::json_init] canont write '" << json_path << "'!\n";
            
            return false;
        }
        
        ofs << j.dump(json_dump_spacing) << "\n";
        
        return true;
    }
    
    bool json_write() const
    {
        nlohmann::json j;

        // save beats
        j["beats"] = beats;
        
        // save notes
        j["notes"] = nlohmann::json::array();
        for(const Note& note : notes)
        {
            j["notes"].push_back({
                { "beat", note.beat },
                { "pos",  note.pos }
            });
        }

        // open file
        std::ofstream ofs(json_path, std::ios::binary);
        if (!ofs) {
            std::cerr << "[Chart::json_write] failed to open '"
                      << json_path.string() << "'!\n";
            return false;
        }

        // write file
        ofs << j.dump(json_dump_spacing) << "\n";
        
        printf("[Chart::json_write] wrote file '%s'!\n", json_path.c_str());
        return true;
    }
    
    bool json_load()
    {
        // create file if neccessary
        if ( json_init() ) {
            printf("[Chart::json_load] new JSON file '%s' created!\n", json_path.c_str());
        }

        // load file
        std::ifstream ifs(json_path);
        if( !ifs ) {
            printf("[Chart::json_load] unable to load file '%s'! (does the file exist?)\n", json_path.c_str());
            return false;
        }
        
        // save file content to 'text'
        std::string text {
            std::istreambuf_iterator<char>(ifs),
            std::istreambuf_iterator<char>()
        };
        
        try
        {
            auto j = nlohmann::json::parse(text);

            // load beats
            beats.clear();
            beats = j.at("beats").get<std::vector<uint64_t>>();
            
            // load notes
            notes.clear();
            int note_index = 0;
            if( j.contains("notes") && j["notes"].is_array() )
            {
                for( const auto& e : j["notes"] )
                {
                    Note note;
                    note.beat = e.at("beat").get<int>();
                    note.pos  = e.at("pos").get<float>();
                    note.index = note_index++;

                    notes.push_back(note);
                }
            }
        }
        catch(const nlohmann::json::parse_error& e)
        {
            std::size_t pos = e.byte;
            std::cerr << "[Chart::load_json] JSON parse error at byte " << pos << ": " << e.what() << " !!!\n";

            return false;
        }

        return true;
    }
    
    // METER CREATION
    void add_beat(uint64_t frame)
    {
        beats.push_back(frame);
    }

    // returns the frame of the next beat
    uint64_t get_nextBeatLocation(int beat_index) const
    {
        if( beat_index < 0 ) return beats[0];

        int beat_count = (int)beats.size();

        // if we're at the last beat there is no next beat, so return the last beat's location
        if( beat_index >= beat_count ) return beats[beat_count - 1];
        
        return beats[beat_index + 1];
    }
    
    // returns the number of frames until the next beat
    uint64_t get_dFrames(int beat_index) const
    {
        assert( beat_index > 0 ); // TO-DO: remove assert()
        
        return get_nextBeatLocation(beat_index) - beats[beat_index];
    }
    
    // CHART CREATION
    void add_note(uint64_t frame)
    {
        Note note;

        note.beat = current_beat;

        uint64_t dFrames = get_dFrames(current_beat);
        uint64_t current_beat_location = beats[current_beat];
        note.pos = (float)(frame - current_beat_location) / dFrames;
        
        quantize(&note);
        
        notes.push_back(note);
    }

    // where, within a beat, the note lies
    const std::vector<float> quantize_positions {
        0.0,
        //0.25,
        0.3333333,
        //0.5,
        0.6666666,
        //0.75,
        1.0
    };
    bool quantize(Note* note)
    {
        bool changed = false;

        float best_distance = 1.0;
        float best_position = note->pos;
        for(float position : quantize_positions)
        {
            if( fabs(note->pos - position) < best_distance )
            {
                best_distance = fabs(note->pos - position);
                best_position = position;
                changed = true;
            }
        }
        
        if( changed )
        {
            note->pos = best_position;
            
            // if it was closest to 1.0, save it as 0.0 of next beat
            if( note->pos == 1.0 ) {
                note->beat++;
                note->pos = 0.0;
            }
        }
        
        return changed;
    }
    
    uint64_t get_note_frame(const Note& note) const
    {
        uint64_t beat_frame = beats[note.beat];
        double offset = static_cast<double>(get_dFrames(note.beat)) * static_cast<double>(note.pos);
        
        return beat_frame + static_cast<uint64_t>(std::floor(offset + 0.5));
    }

    void cleanup()
    {
        beats.clear();
        notes.clear();
        current_beat = -1;
    }
}; // Chart

#endif // CHART_H