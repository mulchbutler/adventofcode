const axios = require('axios');
require('dotenv').config()
const fs = require('fs')


var Jetty = require("jetty");
var jetty = new Jetty(process.stdout);
jetty.clear();

(async function() {
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
})()

// The logic to actually solve the challenge
const run = async data => {
    const steps = 200
    const testData = 
`5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`
    const smallTestData = 
`11111
19991
19191
19991
11111`
    const stg = testData.trim().split('\n').map(num => num.split('').map(n => ({num: parseInt(n), flashing: false})))
    const max_y = stg.length - 1
    const max_x = stg[0].length - 1

    let flashes = 0
    let step = 0

    const print = (nx, ny, sx, sy) => {
        const letters = ['A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T','U','V']
        let str = `Step: ${step} Flashes: ${flashes}\n`
        stg.forEach((row, x) => {
            row.forEach(({num, flashing}, y) => {
                let color = `2`
                let value = num > 9 ? letters[num - 10] : num
                if (x === sx && y === sy) {
                    color = `31`
                } else if (x === nx && y === ny) {
                    color = `32`
                } else if (flashing) {
                    color = `1`
                }
                str += `\x1b[${color}m${value}\x1b[0m`
            })
            str += '\n'
        })
        jetty.moveTo([0,0]).text(str)
    }

    const increment_neighbors = async (x,y) => {
        let process_sides = 0
        let process_tops = 0


        if (x === 0) process_sides = -1
        if (x === max_x) process_sides = 1
        if (y === 0) process_tops = -1
        if (y === max_y) process_tops = 1

        if (process_sides !== -1 && process_tops !== -1) {
            const {num, flashing} = stg[x-1][y-1]
            stg[x-1][y-1] = {num: num + 1, flashing: num+1 > 9}
            print(x, y, x-1,y-1)
            if (num + 1 > 9 && !flashing){
                flashes++
                await increment_neighbors(x-1,y-1)
            }
        }
        if (process_tops !== -1) {
            const {num, flashing} = stg[x][y-1]
            stg[x][y-1] = {num: num + 1, flashing: num+1 > 9}
            print(x, y, x,y-1)
            if (num + 1 > 9 && !flashing){
                flashes++
                await increment_neighbors(x,y-1)
            }
        }
        if (process_tops !== -1 && process_sides !== 1) {
            const {num, flashing} = stg[x+1][y-1]
            stg[x+1][y-1] = {num: num + 1, flashing: num+1 > 9}
            print(x, y, x+1,y-1)
            if (num + 1 > 9 && !flashing){
                flashes++
                await increment_neighbors(x+1,y-1)
            }
        }

        if ( process_sides !== -1) {
            const {num, flashing} = stg[x-1][y]
            stg[x-1][y] = {num: num + 1, flashing: num+1 > 9}
            print(x, y, x-1,y)
            if (num + 1 > 9 && !flashing){
                flashes++
                await increment_neighbors(x-1,y)
            }
        }
        if (process_sides !== 1) {
            const {num, flashing} = stg[x+1][y]
            stg[x+1][y] = {num: num + 1, flashing: num+1 > 9}
            print(x, y, x+1,y)
            if (num + 1 > 9 && !flashing){
                flashes++
                await increment_neighbors(x+1,y)
            }
        }


        if (process_sides !== -1 && process_tops !== 1) {
            const {num, flashing} = stg[x-1][y+1]
            stg[x-1][y+1] = {num: num + 1, flashing: num+1 > 9}
            print(x, y, x-1,y+1)
            if (num + 1 > 9 && !flashing){
                flashes++
                await increment_neighbors(x-1,y+1)
            }
        }
        if (process_tops !== 1) {
            const {num, flashing} = stg[x][y+1]
            stg[x][y+1] = {num: num + 1, flashing: num+1 > 9}
            print(x, y, x,y+1)
            if (num + 1 > 9 && !flashing){
                flashes++
                await increment_neighbors(x,y+1)
            }
        }
        if (process_tops !== 1 && process_sides !== 1) {
            const {num, flashing} = stg[x+1][y+1]
            stg[x+1][y+1] = {num: num + 1, flashing: num+1 > 9}
            print(x, y, x+1,y+1)
            if (num + 1 > 9 && !flashing){
                flashes++
                await increment_neighbors(x+1,y+1)
            }
        }
    }

    for (step = 0; step < steps; step ++) {
        for (let x = 0; x <= max_x; x++) {
            for (let y = 0; y <= max_y; y++) {
                const {num} = stg[x][y]
                stg[x][y] = {num: num+1, flashing: num+1 > 9}
                print(x, y)
            }
        }

        let flashers = stg.flatMap((row, x) => row.map(({flashing}, y) => ({x, y, flashing})).filter(({flashing}) => flashing))
        for (let {x, y} of flashers) {
            flashes++
            await increment_neighbors(x, y)
        }
        flashers = stg.flatMap((row, x) => row.map(({flashing}, y) => ({x, y, flashing})).filter(({flashing}) => flashing))
        for (let {x, y} of flashers) {
            stg[x][y] = {num: 0, flashing: false}
            print(x,y)
        }
    }
    console.log(flashes)
}