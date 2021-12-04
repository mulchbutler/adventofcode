const axios = require('axios');
require('dotenv').config()

class Card {
    constructor(number) {
      this.number = number;
    }
  }
  

/**
 * A function that takes a card and a number, and toggles the called flag for each instance of the number in the card
 * @param {[][]Object} card 
 * @param {int} number 
 */
const mark_number = (card, number) => {
    return card.map(row => 
        row.map(({num, marked}) => ({num, marked: marked || num === number}))
    )
}

/**
 * Check the cards for a win. First check each row, then check each column, then check the two diagnols
 * @param {[][]Object} card 
 */
const check_for_win = (card) => {
    let win = false

    // Check each row for a win first
    for(let row = 0; row < 5 && !win; row ++) {
        // Loop through each number in a row and && the marked value. If all values are true, the output should be true and we found a winner.
        win = card[row].reduce((row_win, {marked}) => row_win && marked, true)
    }
    if (win) return true

    // Now check each column for a win
    for(let column = 0; column < 5 && !win; column ++) {
        // Loop through each row and check the current column being checked. If all values are true, the output should be true and we found a winner.
        win = card.reduce((col_win, row) => col_win && row[column].marked, true)
    }
    if (win) return true
}

/**
 * Loop through all numbers in the card and sum the unmarked numbers
 * @param {[][]Object} card 
 */
const get_card_score = (card) => {
    return card.reduce((card_sum, row) => card_sum + row.reduce((row_sum, {num, marked}) => row_sum + (!marked && num) ,0),0)
}


axios.get(`https://adventofcode.com/2021/day/4/input`,{
    "headers": {
        Cookie: `session=${process.env.session}`
    }
})
.then(({data}) => {
    const testRowWin = "0\n\n0 0 0 0 0\n1 1 1 1 1\n1 1 1 1 1\n1 1 1 1 1\n1 1 1 1 1"
    const testColumnWin = "0\n\n1 0 1 1 1\n1 0 1 1 1\n1 0 1 1 1\n1 0 1 1 1\n1 0 1 1 1"
    const testAllLose = "0\n\n1 1 1 1 1\n1 1 1 1 1\n1 1 1 1 1\n1 1 1 1 1\n1 1 1 1 1"

    // The data has an extra row at the end that we want to trim, and each board is seperated by an empty line, so we split on that line
    let stg = data.trim().split('\n\n')

    // The first row is the bingo numbers to be called in a comma seperated list
    const bingo_numbers = stg[0].split(',').map(num => parseInt(num))

    
    // We're going to process each card into a matrix, with each number being an object to track if it's been called yet
    let bingo_cards = stg
        .slice(1) // The remaining rows are the bingo cards
        .map(card => card.split('\n') // The rows of each card are seperated by a new line
        .map(row => row.split(' ') // The columns of each card are by a space
        .filter(num=> num !== '') // There are extra spaces that made it look pretty, so strip out those entries
        .map(num => ({num: parseInt(num), marked: false})))) // Parse each number and turn it into an object with the called boolean
        
    // Now we process everything. We want to loop through the bingo numbers until we find a winning card
    let winning_card
    let winning_num = 0
    bingo_numbers.some(called_number => {
        bingo_cards = bingo_cards.map(card => mark_number(card, called_number))
        
        let round_wins = bingo_cards.filter(card => check_for_win(card))
        if (round_wins.length !== 0) {
            winning_card = round_wins[0]
            winning_num = called_number
        }
        return winning_card
    })

    console.log(
        
        winning_card.reduce((st,row) => 
            st+row.reduce((s,{marked}) => s+(marked?'+':'.'),'\n')
        ,'')+'\n'
    )
    console.log(winning_card)

    const winning_score = get_card_score(winning_card)
    console.log(winning_num, '*', winning_score, '=', winning_num*winning_score)
})