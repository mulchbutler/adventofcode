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

    const segmentMapping = { // Hard code the proper segment mappings for each value
        'abcefg': 0,
        'cf': 1,
        'acdeg': 2,
        'acdfg': 3,
        'bcdf': 4,
        'abdfg': 5,
        'abdefg': 6,
        'acf': 7,
        'abcdefg': 8,
        'abcdfg': 9
    }

    let final_sum = 0
    stg.forEach(display => {
        /**
         * The proper 8 segment display looks like this:
         *   aaaa 
         *  b    c
         *  b    c
         *   dddd 
         *  e    f
         *  e    f
         *   gggg 
         * So we have to figure out which letter in the bad_mappings maps to each correct segment
         * 
         */

        /**
         * Finding 8:
         * 8 is really easy to find. It's the only input that uses all seven segments.
         * This will be really useful for finding later segments.
         */
        const eight = display.bad_mappings.filter(mapping => mapping.length === 7)[0]

        /**
         * Solving A:
         * 7 and 1 both use a unique number of segments (A,C,F and C,F respectively). No other numbers are 2-3 in segment length
         * Since 7 and 1 overlap with C & F, we can use that to figure out with 7 what the A segment is mapped to.
         * By removing our 1's segments from 7's segments, we're left with our A segment
         * This has a side effect of telling us what C&F are, though not exactly. Still, it helps with later mappings
         */
        
        const seven = display.bad_mappings.filter(mapping => mapping.length === 3)[0]
        const one = display.bad_mappings.filter(mapping => mapping.length === 2)[0]
        const A = seven.split('').filter(segment => !one.includes(segment))[0]

        // We don't know exactly which one is C & F, but we know the they're one of these two, so we save for later solving
        const maybeC = one.charAt(0)
        const maybeF = one.charAt(1)

        /**
         * Solving G:
         * Using what we learned solving A and the fact that 4 is uniquely identifiable by length, we can identify 9 and use that to sovle G
         * 4 is the only number to use four segments, so that's easy to identify.
         * We know which segments are probably C & F, so identifying 4 tells us what is probably B & D
         * 9 is the only number that uses all the same characters as 4, plus A & G.
         * Since we solved A, we can basically subtract 4 & A from 9 to get G.
         * As a side effect of finding 4, we also get probable B & D
         */
        const four = display.bad_mappings.filter(mapping => mapping.length === 4)[0]
        const [maybeB, maybeD] = four.split('').filter(char => char !== maybeC && char != maybeF) // Get our possible B & D from 4

        const nine = display.bad_mappings
            .filter(mapping => mapping.length === 6) // 9 is length 6
            .filter(mapping => mapping.includes(A)) // 9 uses A
            .filter(mapping => four.split('').reduce((match, char) => match && mapping.includes(char), true))[0] // 9 uses all the characters in 4
        
        const G = nine.split('').filter(char => 
            char !== A // Remove A from the running
            && !four.includes(char) // Remove 4's segments from the running
        )[0]

        /**
         * Solving E:
         * Now that we know 9 and 8, we can solve for E.
         * Since 8 uses every segment and 9 uses every segment except E, we just filter 9's mappings out of 8
         */
        const E = eight.split('').filter(char => !nine.includes(char))[0]
        
        
        /**
         * Solving B, C, D, F:
         * At this point, we know A, E, & G. We also possibly know C/F & B/D.
         * We should be able to find 2 and use that to solve C/F & B/D.
         * 2 is the only 5 segment long number that uses A, E, & G. It also uses C & D.
         * Since we know a possible C/F pair from solving A, then we know that whichever of those two appears
         * in 2 is C and the that doesn't appear is F. The same applies with B/D
         */
        
        const two = display.bad_mappings
         .filter(mapping => mapping.length === 5) // 2 is length 5
         .filter(mapping => mapping.includes(A) && mapping.includes(E) && mapping.includes(G))[0] // 2 uses A, E, & G
        
        // 2 includes C, which we have 2 possible values of. Whichever one it has is C, while the other is F
        const C = two.includes(maybeC) ? maybeC : maybeF
        const F = !two.includes(maybeC) ? maybeC : maybeF
        // 2 includes D, which we have 2 possible values of. Whichever one it has is D, while the other is B
        const D = two.includes(maybeD) ? maybeD : maybeB
        const B = !two.includes(maybeD) ? maybeD : maybeB
        
        
        /**
         * Solving the actual display values:
         * We've now solved the mapping for every mixed mapping.
         * 
         */

        let final_display_value = display.final_outputs.reduce((fixed_display, output) => {
            let fixed_mapping = (output.includes(A) ? 'a':'')
             + (output.includes(B) ? 'b':'')
             + (output.includes(C) ? 'c':'')
             + (output.includes(D) ? 'd':'')
             + (output.includes(E) ? 'e':'')
             + (output.includes(F) ? 'f':'')
             + (output.includes(G) ? 'g':'')
            return fixed_display + segmentMapping[fixed_mapping]
        }, '')
        final_sum += parseInt(final_display_value)
    })
    console.log(final_sum)
}