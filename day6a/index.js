const axios = require('axios');
require('dotenv').config()

axios.get(`https://adventofcode.com/2021/day/6/input`,{
    "headers": {
        Cookie: `session=${process.env.session}`
    }
})
.then(({data}) => {    
    const stg = data.trim().split(',').map(n => parseInt(n))

    /**
     * EZ PZ, just loop through the fish and increment births for all our 0 fish and reset them to 6.
     * Then decrement all the other fish.
     * Once we're done, push all the births to the array with their 8 day wait
     */
    let fish = stg.slice()
    for(let day = 0; day < 80; day++) {
        let births = 0
        fish = fish.map(f => {
            if (f === 0) {
                births++
                return 6
            }
            return f - 1
        })
        const babies = new Array(births).fill(8)
        fish.push(...babies)
    }

    console.log(fish.length)
    // I'm sure this will work cleanly with part 2
})