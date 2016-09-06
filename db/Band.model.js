'use strict';

// * Band name
// * Genres []
// * Bio
// * Band since (year)
// * Location (origin)
// * Age of fanbase (range)
// * Gear you have
// * Gear you need (venue to provide)
// * Average Set Length (null until several shows have been played)
// * Influences (bands) []
// * website_url
// * Facebook_url
// * Myspace_url
// * Soundcloud_url
// * Bandcamp_url




const db = require('./mongoose.config');
const randomstring = require('randomstring');

const BandSchema = db.Schema({
    name: {
        type: String,
        required: true
    },
    genres: {
        type: Array,
        required: true
    },
    slug: {
        type: String,
        required: true,
        default: randomstring.generate(),
        unique: true
    },
    bio: String,
    band_since: Date,
    location: String,
    age_of_fanbase: [],
    gear_you_have: [],
    average_set_length: Number,
    influences: [],
    website_url: String,
    Facebook_url: String,
    myspace_url: String,
    soundcloud_url: String,
    bandcamp_url: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
    deleted_at: {type: Date, default: null}
});


const Band = db.model('Band', BandSchema);


module.exports = Band;
