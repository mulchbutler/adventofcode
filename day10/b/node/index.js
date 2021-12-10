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
     * If the next index is the end of the string, we've reached the end of the string. In this case, return the string
     * for the missing closing braces that we need
     * 
     * If the next index is the wrong closing character, return the negative index of the corrupted char to indicate a corrupted chunk
     * If the next index is an opening chunk, then call recursively with that index. 
     */
    const checkStatus = (arr, opener) => {
        const openChar = arr[opener]
        let closeIndex = opener + 1
        if (closeIndex === arr.length) return chunkPairs[openChar] // We reached the end of the chunk without closing, so an incomplete chunk. Start returning the missing closers

        let nextChar = arr[closeIndex]

        /**
         * It's possible to have multiple small chunks in our chunk, so we may have to recurse multiple times
         * For instance: [()()()] would require us to recurse 3 times.
         * So we recurse until we either reach the end of the array or we encounter a closing character
         */

        while (openings.includes(nextChar)) {// The next character is another opener, so the start of a new chunk. RECURSE!
            closeIndex = checkStatus(arr, closeIndex)
            if (typeof closeIndex === 'string') return closeIndex + chunkPairs[openChar] // The recurse found an incomplete chunk, so we collect the missing closers
            if (closeIndex === arr.length) return chunkPairs[openChar] // We reached the end of the chunk without closing, so an incomplete chunk. Start returning the missing closers
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

    const chunkStatuses = stg.map(row => {
        /**
         * If we encounter a complete block, then checkStatus will return.
         * But we know each row is either corrupt or incomplete, so we want to keep going until 
         * we either get a corrupt line or get our incomplete line
         */
        let status = 0
        while (typeof status !== 'string' && status >= 0 && status < row.length) {
            status = checkStatus(row, status)
        }
        return status
    })
    console.log(chunkStatuses)
    
    /**
        * Calculate the part 2 score. 
        * Grab all the incomplete statuses (strings) and calculate the scores
        */ 
   const scores = {
       ')': 1,
       ']': 2,
       '}': 3,
       '>': 4
   }
   let finalScores = chunkStatuses
     .filter(status => typeof status === 'string') // Ignore the corrupted chunks and only look at the incomplete chunks.
     // To get the score, for each closer, multiply the score by 5 and then add the current closer's score value
     .map(stat => stat.split('').reduce((score, st) => score*5 + scores[st], 0)) 

    // The actual final score is the middle score, so sort the scores and grab the middle value
    finalScores.sort((a,b) => a-b)
    console.log(finalScores)
    const finalScore = finalScores[Math.floor(finalScores.length / 2)] 
    console.log(finalScore)
}