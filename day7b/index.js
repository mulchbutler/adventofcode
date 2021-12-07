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
    // const testData = '16,1,2,0,4,2,7,1,2,14'
    const stg = data.trim().split(',').map(n => parseInt(n))

    /**
     * We want to find the average of all the crabs to help save fuel
     */
    const min = stg.reduce((a,b) => Math.min(a,b))
    const max = stg.reduce((a,b) => Math.max(a,b))

    /**
     * Now we calculate how much fuel each crab has to use to move to our avg value.
     * To sum the numbers in a sequence, we can use n(a1 + a2) / 2
     *   where n is the number of terms, a1 is the first term and a2 is the last term
     * In our case, a2 and n should be identical and a1 will always be 0
     * Note: Since we're including 0 in our series, n is actually a2 + 1
     */
    let fuel_used = (position, target) => {
        const a2 = Math.abs(position - target) // The distance we need to move
        return (a2 + 1)*(0 + a2)/2
    }
    
    /**
     * From reading some hint posts, the smart way to get the total distance needed involves taking derivatives.
     * I don't remember how to do that, so we're brute forcing it.
     * Starting at our minimum crab, work our way to the max crab and save any largest ones
     */

    let final_target = 0
    let final_fuel = Number.MAX_VALUE

    for(let x = min; x <= max; x++) {
        const test_fuel = stg.reduce((sum, crab) => sum + fuel_used(crab, x), 0)

        if (test_fuel < final_fuel) {
            final_target = x
            final_fuel = test_fuel
        }
    }

    console.log(final_target, final_fuel)
}