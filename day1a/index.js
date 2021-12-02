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
    data.split('\n').forEach((d) => {
        if (parseInt(d) > last) {
            count++
        }
        last = parseInt(d)
    })
    console.log(count)
})
.catch(function (error) {
    // handle error
    console.log(error);
})
