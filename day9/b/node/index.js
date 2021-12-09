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
    // Map each entry into an object with the value. Later, we'll be adding basin X/Y coords to the object to reduce duplicate parsing
    let heatmap = data.trim().split('\n').map(row => row.split('').map(num => ({point: parseInt(num)})))

    /**
     * This object will hold all our basin low points and their associates basin size count
     */
    let basins = {}


    /**
     * For a given point, check for smaller values in the Up, Down, Left, or Right directions.
     * If we find a lower point, then recursively call processPoint with that point.
     * If it turns out that we're the lowest point, then return our own coordinates.
     * Regardless, set the current point's basinX and basinY values with the lowest point that we've found recursively.
     * 
     * @returns an X/Y coordinate array for the basin low point
     */
    const processPoint = (x,y, point) => {
        let basinX = x, basinY = y
        
        let lower, lowerX, lowerY
        if (x !== 0) {
            if (heatmap[x-1][y].point < point) {
                lower = heatmap[x-1][y]
                lowerX = x-1; lowerY = y
            }
        }
        if (x !== (heatmap.length - 1)) {
            if (heatmap[x+1][y].point < point) {
                lower = heatmap[x+1][y]
                lowerX = x+1; lowerY = y
            }
        }
        if (y !== 0) {
            if (heatmap[x][y-1].point < point) {
                lower = heatmap[x][y-1]
                lowerX = x; lowerY = y-1
            }
        }
        if (y !== (heatmap[x].length - 1)) {
            if (heatmap[x][y+1].point < point) {
                lower = heatmap[x][y+1]
                lowerX = x; lowerY = y+1
            }
        }

        if (lower) { // We found a point that is lower
            if (lower.basinX !== undefined) { // We've already found the basin for the lower point
                basinX = lower.basinX
                basinY = lower.basinY
            } else { // We haven't found the basin for the lower point, so find it
                [basinX, basinY] = processPoint(lowerX, lowerY, lower.point)
            }
        }

        // Store the basin coordinates for the point we found
        heatmap[x][y] = {
            point, basinX, basinY
        }
        // increment the size count for the basin that we found
        const key = basinX.toString().padStart(2, '0') + basinY.toString().padStart(2, '0')
        basins[key] = ~~basins[key] + 1

        return [basinX, basinY]
    }

    heatmap.forEach(( row, x ) => {
        row.forEach(( {point, basinX}, y ) => {
            if (point === 9) return // We don't care abou 9s, they're not part of a basin

            if ( basinX !== undefined ) return // If we've already discovered the basin, so skip

            processPoint(x, y, point)
            
        })
    })

    console.log(basins)
    let sorted = Object.values(basins)
    sorted.sort((a,b) => b-a);
    let top3 = sorted.slice(0,3)
    
    let solution = top3.reduce((product, num) => product * num)
    console.log(solution)
}