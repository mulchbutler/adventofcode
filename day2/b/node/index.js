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

    console.log(stg)
}

axios.get(`https://adventofcode.com/2021/day/2/input`,{
    "headers": {
        Cookie: `session=${process.env.session}`
    }
})
.then(({data}) => {
    const arr = data.split('\n')

    let horizontal = 0
    let depth = 0

    arr.forEach(input => {
        if (input.trim() === '') return

        let [command, amount] = input.split(' ')
     
        amount = parseInt(amount)
        switch(command) {
            case 'forward': horizontal += amount; break;
            case 'down': depth += amount; break;
            case 'up': depth -= amount; break;
        }
    })

    console.log(`horizontal: ${horizontal} depth: ${depth} mult: ${depth*horizontal}`)
})
.catch(function (error) {
    // handle error
    console.log(error);
})
