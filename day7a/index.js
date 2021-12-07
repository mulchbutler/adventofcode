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
    const stg = data.trim().split(',').map(n => parseInt(n))

    /**
     * We want to find the median (middle value) of all the crabs
     * So we sort the array, get the middle index
     *   If the length is even, then 2 numbers are in the middle, so we get the average of them
     *   If the length is odd, only a single number is in the middle so we go with that one
     */
    let sorted = stg.slice().sort((a,b) => a-b);
    var middle = Math.floor(sorted.length / 2);
    let median = sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2.0 : sorted[middle]
    console.log(median)

    /**
     * Now we calculate how much fuel each crab has to use to move to our median value
     */
    let fuel_used = stg.reduce((sum, crab) => sum + Math.abs(median - crab), 0)
    console.log(fuel_used)
}