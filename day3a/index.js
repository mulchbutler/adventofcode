const axios = require('axios');
require('dotenv').config()

axios.get(`https://adventofcode.com/2021/day/3/input`,{
    "headers": {
        Cookie: `session=${process.env.session}`
    }
})
.then(({data}) => {
    const power_consumptio2  = 
    data
    .trim()
    .split('\n')
    .reduce((b,r,i,a)=>[...r].map((v,j)=>~~b[j]+~~v-(!i&&a.length/2)),[])
    .reduce(([g,e],c)=>([g+(+(c>=0)),e+(+(c<0))]),['',''])
    .reduce((p,n)=>p*+('0b'+n),1)
    console.log(power_consumptio2)
    


    // Split on the new lines, remove any blank rows (the input ends with an empty row)
    const arr = data.split('\n').filter(r => r !== "")

    // Figure out the lengths of the binary numbers. Hopefully they're all the same....
    const bit_length = arr.reduce((max, current) => Math.max(max, current.length), 0)

    // The array that we'll aggregate the count of 1s
    let bit_counts = new Array(bit_length).fill(0)

    arr.forEach(row => {
        // For each row, count the bits in the row
        bit_counts = bit_counts.map((bit, i) => {
            return bit + parseInt(row[i])
        })
    })
    console.log(bit_counts)
    
    // For each position, if the count of 1s is >= half the array length, then 1 is the most common so we append 1 to the string
    // Otherwise we append a 0, since that's the most common
    const gamma_string = bit_counts.reduce((final, count) => count >= arr.length / 2 ? `${final}1` : `${final}0`, '')
    console.log(gamma_string)

    // The epsilon number is the inverse of the gamma calculation
    const epsilon_string = bit_counts.reduce((final, count) => count < arr.length / 2 ? `${final}1` : `${final}0`, '')
    console.log(epsilon_string)

    // Parse both strings into ints, knowing that they're base 2 numbers, and multiply them
    const power_consumption = parseInt(gamma_string, '2') * parseInt(epsilon_string, '2')
    console.log(power_consumption)
})