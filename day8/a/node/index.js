const axios = require('axios');
require('dotenv').config()
const fs = require('fs')

/**
 * Get the data for the day. First check for an input.txt. If it doesn't exist, get the input from aoc and save it to an input.txt
 */
if (fs.existsSync(`${__dirname}/input.txt`)) {
    fs.readFile(`${__dirname}/input.txt`, `utf8`, (_, data) => run(data))
} else {
    const day = __dirname.match(/.*day(\d+)/)[1]
    axios.get(`https://adventofcode.com/2021/day/${day}/input`,{ "headers": { Cookie: `session=${process.env.session}` } })
    .then(({data}) => {
        fs.writeFile(`${__dirname}/input.txt`, data, err => err && console.error(err))
        run(data)
    })
}

// The logic to actually solve the challenge
const run = data => {
    const stg = data.trim().split('\n')
      .map(row => row.split(' | ').map(combos => combos.split(' '))) // Split each entry on the ' | ' delimiter and then each of those on the spaces
      .map(([bad_mappings, final_outputs]) => ({bad_mappings, final_outputs})) // Do the final data parsing into workable objects

    /**
     * For the first part of the challenge, we just have to figure out how many times 1, 4, 7, or 8 appear in the final_outputs.
     * This is pretty easy, because each of those numbers has a unique number of segments (2, 4, 3, and 7 respectively).
     * So we just loop through all the outputs and count the number of times one of those values is found
     */

    let sum = 0
    stg.forEach(({final_outputs}) => {
        final_outputs.forEach(mapping => {
            if ([2, 4, 3, 7].includes(mapping.length)) {
                sum++
            }
        })
    })
    console.log(sum)

}