const axios = require('axios');
require('dotenv').config()

axios.get(`https://adventofcode.com/2021/day/1/input`,{
    "headers": {
        Cookie: `session=${process.env.session}`
    }
})
.then(({data}) => {
    let last = 999999999
    let count = 0
    const arr = data.split('\n')

    arr.some((d, i) => {
        if (i+2 >= arr.length) return false
        
        let comp = parseInt(d) + parseInt(arr[i+1]) + parseInt(arr[i+2])

        if (comp > last) {
            count++
        }
        last = comp
    })
    console.log(count)
})
.catch(function (error) {
    // handle error
    console.log(error);
})
