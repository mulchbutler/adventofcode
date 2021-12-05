const axios = require('axios');
require('dotenv').config()

axios.get(`https://adventofcode.com/2021/day/5/input`,{
    "headers": {
        Cookie: `session=${process.env.session}`
    }
})
.then(({data}) => {    
    /**
     * input data should be line coordinates like this:
     * 1,2 -> 3,4
     * 5,6 -> 7,8
     */
    const stg = data.trim().split('\n')
    .map(pair => // For each pair of line endpoints
        pair.split(' -> ') // Split the two coordinates into different strings
        .map(end => // and for each set of coordinate endpoints
            end.split(',') // split them on the comma
            .map(num => parseInt(num)) // and parse the resulting coordinate number strings into ints
        )
    ) 
    /**
     * stg should now be an array of array pairs
     * Ex:
     * [ // All the lines
     *   [ // A line pair
     *     [1, 2], // A line end coordinate
     *     [1, 3]
     *   ],
     *   [
     *     [4, 5],
     *     [6, 5]
     *   ] ,
     *   [
     *     [7, 7],
     *     [8, 8]
     *   ]
     * ]
     */

    // We'll create an object to store which points are touched by the line 
    let points = {}

    // Now we loop through each line and calculate which points are touched
    stg.forEach(([[x1,y1], [x2,y2]]) => {
        /**
         * We'll keep our easy process for vertical/horizontal lines and add special processing for our diagonal lines
         * Y will be changing for vertical lines, and X for horizontal
         * 
         * So we figure out which coordinate is changing, grab the start and end, then store the static coordinate
         */

        const vertical = x1 === x2
        const straight = vertical || y1 === y2
        let dynamic_start = 0
        let dynamic_end = 0
        let static = 0
        

        if (vertical) {
            dynamic_start = Math.min(y1, y2)
            dynamic_end = Math.max(y1, y2)
            static = x1.toString().padStart(3, '0') // We're just going to use static for the points key, so go ahead and format it
        } else { 
            dynamic_start = Math.min(x1, x2)
            dynamic_end = Math.max(x1, x2)
            static = y1.toString().padStart(3, '0')
        }

        if (straight) {
            // now we loop along our line and mark each point
            for(let i = dynamic_start; i <= dynamic_end; i++) {
                const dynamic_str = i.toString().padStart(3, '0')
                const key = vertical ? static+dynamic_str : dynamic_str+static

                // The first time we hit a point, it will be undefined. The double bitwise NOT will convert undefined to 0 and leave defined values alone
                points[key] = ~~points[key] + 1 
            }
        } else {
            // Now to handle our diaganol lines. First, find the mode of the line
            const mode = ( y1 - y2 ) / ( x1 - x2 ) // Since all lines are 45 degrees, mode is either 1 or -1
            // y = mx + b; y - mx = mx + b - mx === b; so b = y - mx
            const b = y1 - mode * x1

            // so we have our formula for y now. So starting with the min x, we just iterate through all the points
            for(let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                const y = mode*x + b
                const key = `${x}`.padStart(3,'0')+`${y}`.padStart(3,'0')
                points[key] = ~~points[key] + 1 
            }
        }
    })

    // Points should now have a large number of entries, each with a key of xxxyyy and a value of the lines that cross it

    // To finish out the challenge, figure out how many points have 2+ lines covering it    
    const two_plus_cover = Object.values(points).filter(v => v > 1)
    console.log(two_plus_cover.length)

})