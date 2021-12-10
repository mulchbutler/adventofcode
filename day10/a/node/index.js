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
    const testData = 
`[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]`
    const stg = data.trim().split('\n').map(row => row.split(''))

    const chunkPairs = {
        '(': ')',
        '[': ']',
        '{': '}',
        '<': '>'
    }
    const openings = '([{<'

    /**
     * Search for the index of the closing character for the provided open character index.
     * It returns a positive value for a successfully parsed chunk, and a negative value for a chunk with errors
     * 
     * The first parameter is the array we're iterating on, and the second is the index for our chunk opener
     * 
     * If the next index is the end of the string, return the array length to indicate an incomplete chunk
     * If the next index is the wrong closing character, return the negative index of the corrupted char to indicate a corrupted chunk
     * If the next index is an opening chunk, then call recursively with that index. 
     */
    const checkStatus = (arr, opener) => {
        if (opener + 1 === arr.length) return arr.length // We reached the end of the chunk without closing, so an incomplete chunk

        const openChar = arr[opener]
        let closeIndex = opener + 1
        let nextChar = arr[opener + 1]

        /**
         * It's possible to have multiple small chunks in our chunk, so we may have to recurse multiple times
         * For instance: [()()()] would require us to recurse 3 times.
         * So we recurse until we either reach the end of the array or we encounter a closing character
         */

        while (openings.includes(nextChar)) {// The next character is another opener, so the start of a new chunk. RECURSE!
            closeIndex = checkStatus(arr, closeIndex)
            if (closeIndex === arr.length) return arr.length // The theroetical next character is once more the end of the string, so an incomplete chunk
            if (closeIndex < 0) return closeIndex // One of our recurses found an issue, so bail out with the status
            nextChar = arr[closeIndex]
        }

        /**
         * So at this point, our closeIndex for sure points at a character.
         * If it's not the correct closing character, then the chunk is corrupted and return -2
         */

        if (nextChar !== chunkPairs[openChar]) { // The pairs don't match, so corrupted chunk
            return closeIndex * -1
        }
        // Our closing pair is a successful match, so return the next index after it to let the parent process keep checking
        return closeIndex + 1
    }

    const chunkStatuses = stg.map(row => 
        checkStatus(row, 0)
    )
    console.log(chunkStatuses)

    /**
     * Calculate the part 1 score. 
     * Grab all the corrupted statuses (less than 0), make them positive, then get the character at the index
     * and get sum the score for each character
     */ 
    const scores = {
        ')': 3,
        ']': 57,
        '}': 1197,
        '>': 25137
    }
    const finalScore = chunkStatuses
        .map(st => st * -1) // Invert all statuses. This fixes the corrupted chunks and negates the non-corrupted chunks
        .reduce((score, st, i) => {
            if (st < 0) return score // A non-corrupted chunk, ignore
            return score + scores[stg[i][st]]
        }, 0)
    console.log(finalScore)
}