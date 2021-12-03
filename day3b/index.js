const axios = require('axios');
require('dotenv').config()

axios.get(`https://adventofcode.com/2021/day/3/input`,{
    "headers": {
        Cookie: `session=${process.env.session}`
    }
})
.then(({data}) => {
    // Split on the new lines, remove any blank rows (the input ends with an empty row)
    const arr = data.split('\n').filter(r => r !== "")

    const bit_length = arr.reduce((max, current) => Math.max(max, current.length), 0)


    const count_bits = (input_arr) => {
        let bit_counts = new Array(bit_length).fill(0)
        input_arr.forEach(row => {
            // For each row, count the bits in the row
            bit_counts = bit_counts.map((bit, i) => {
                return bit + parseInt(row[i])
            })
        })
        return bit_counts
    }

    const generate_gamma = (input_arr) => {
        const bit_counts = count_bits(input_arr)
        return bit_counts.map((count) => count >= input_arr.length / 2 ? `1` : `0`)
    }

    const generate_epsilon = (input_arr) => {
        const bit_counts = count_bits(input_arr)
        return bit_counts.map((count) => count < input_arr.length / 2 ? `1` : `0`)
    }

    // Starting with O2. Filter out the arr rows that don't have our gamma bits in the correct index. Stop when there's only 1 left
    let o2_stats = arr
    for(let i = 0; i < bit_length && o2_stats.length > 1; i++) {
        let gamma_arr = generate_gamma(o2_stats)
        o2_stats = o2_stats.filter(row => row[i] === gamma_arr[i])
    }
    console.log(o2_stats)

    // Now for CO2. Filter out the arr rows that don't have our gamma bits in the correct index. Stop when there's only 1 left
    let co2_stats = arr
    for(let i = 0; i < bit_length && co2_stats.length > 1; i++) {
        let epsilon_arr = generate_epsilon(co2_stats)
        co2_stats = co2_stats.filter(row => row[i] === epsilon_arr[i])
    }
    console.log(co2_stats)

    const o2_rating = parseInt(o2_stats[0], '2')
    const co2_rating = parseInt(co2_stats[0], '2')

    const life_support_rating = o2_rating * co2_rating
    console.log(o2_rating, co2_rating, life_support_rating)
})