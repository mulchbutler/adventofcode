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
    const power_consumptio2  = 
    data
    .trim() // The data ends with an extra blank line, so trim it off
    .split('\n') // Split the data into an array on each new line
    .reduce((b,r,i,a)=> 
        /**
         * We want to count how many times 1 appears at each index for all the inputs
         * b: the final input array. It starts empty, but should end up with an integer entry for each bit in the inputs.
         * r: the row that we're currently counting. It should be a binary string
         * i: the current index. Only used because for index 0, we want to subtract half the array length for later comparisons
         * a: the whole array. we really only want the length
         */
        [...r] // Turn the binary string into an array of the 1 and 0 characters
        .map((v,j)=>
        /**
         * Loop through each character and add the 1/0 value to it's index in the output array. 
         * v: either a '1' or '0' string
         * j: the index of the current character
         */

            /**
             * b is the output array. It initializes empty, so b[j] will be undefined on the first pass. In later passes, it will be an integer
             * representing how many 1s have been found at that index j.
             * To make sure we get a 0 if b[j] is undefined or the int value at b[j], we use a double bitwise NOT ~~
             */
            ~~b[j] 
             + // Add that to
            ~~v // v is a string, either '1' or '0'. We need to convert it to an int without messing with the addition, so another double bitwise NOT ~~

            /**
             * Later down the line, we need to see if there are more 1s or 0s for a given index. We can't carry the length variable down the line, so we use
             * a trick here to help with that. Once for each position (so index 0 for the whole dataset) we subtract half the array length. This way
             * later down the line, we know 1s are more common if the value is positive, and 0 is more common if the value is negative
             */
            -(!i&&a.length/2)
        ),[] // The inital vale of the reduce, an empty array
    )
    .reduce(([g,e],c)=>
    /**
     * We now have an array with the count of 1/0 for each index. If the count is positive, it means there were more 1s. Negative means more 0s.
     * The goal now is to calculate our gamma and epsilon values. Each digit for gamma is either 1 if there were more 1s, or 0 if there were more 0s.
     * Epsilon is the inverse of gamma.
     * 
     * Our output goal is two binary strings, so we start with an array of two empty strings
     * g: the current gamma binary string
     * e: the current epsilon binary string
     * c: the current index count being considered
     */
        ([
            g+(+(c>=0)), // Check to see if c is positive, and convert the resulting binary to an integer (1 for true and 0 for false), then append to our binary string
            e+(+(c<0)) // Check to see if c is negative, and convert to 1 for true and 0 for false, then append to our binary string
        ]),
        ['',''] // The starting array with the empty binary strings
    )
    .reduce((p,n)=>
    /**
     * Our final output is the product of gamma and epsilon. our input from the last step is an array with two binary strings
     * p: The current product. Starts as 1, so the output should be our product
     * n: The current binary string being multiplied
     */
        p // our current product
        * // multiplied by
        +('0b'+n), // This is a really janky way to convert a binary string into an actual binary number for multiplication. The same as parseInt(n, 2)
        1 // Start the value at 1 to not mess with the multiplication
    )
    console.log(power_consumptio2)
}
