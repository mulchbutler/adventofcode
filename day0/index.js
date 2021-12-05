const axios = require('axios');
require('dotenv').config()

axios.get(`https://adventofcode.com/2021/day/1/input`,{
    "headers": {
        Cookie: `session=${process.env.session}`
    }
})
.then(({data}) => {    
    const stg = data.trim().split('\n')

})