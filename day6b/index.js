// lmao

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
     * Who needs to track the individual fish. Just keep track of the days and how many fish there are.
     * What we can even do is use a straight array where the index is the days left, and the value is the number of fish.
     * We don't even have to really keep track of things. Just use shift and push to move the numbers around.
     * As long as we initialize the array with 8 indexes and balance our shift/pushes, we should always have the 8 days represented
     */

    let days = new Array(9).fill(0) // The 8 days, including the day 0 birthing day
    stg.forEach(fish => { // Loop through our starting fish and get the days setup
        days[fish] += 1
    })

    for(let day = 0; day < 256; day++) {
        let births = days.shift() // How many fish are giving birth today?
        days.push(births) // Push the new babies to the end of the list
        days[6] += births // Add the new parents to the day 6 index
    }
    let total = days.reduce((sum, day) => sum + day, 0)
    console.log(total)
})