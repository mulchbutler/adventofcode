const axios = require('axios');
require('dotenv').config()

axios.get(`https://adventofcode.com/2021/day/2/input`,{
    "headers": {
        Cookie: `session=${process.env.session}`
    }
})
.then(({data}) => {
    const arr = data.split('\n')

    let horizontal = 0
    let depth = 0
    let aim = 0

    arr.forEach(input => {
        if (input.trim() === '') return

        let [command, amount] = input.split(' ')
     
        amount = parseInt(amount)
        switch(command) {
            case 'forward': 
                horizontal += amount;
                depth += aim * amount; 
                break;
            case 'down': aim += amount; break;
            case 'up': aim -= amount; break;
        }
    })

    console.log(`horizontal: ${horizontal} depth: ${depth} mult: ${depth*horizontal}`)
})
.catch(function (error) {
    // handle error
    console.log(error);
})
