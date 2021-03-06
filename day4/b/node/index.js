const axios = require('axios');
require('dotenv').config()

var Jetty = require("jetty");
var jetty = new Jetty(process.stdout);
jetty.clear();

/**
 * A function that takes a card and a number, and toggles the called flag for each instance of the number in the card
 * @param {[][]Object} card 
 * @param {int} number 
 */
const mark_number = (card, number) => {
    return card.map(row => 
        row.map(({num, marked, winner}) => ({num, marked: marked || num === number, winner}))
    )
}

/**
 * Check the cards for a win. First check each row, then check each column
 * @param {[][]Object} card 
 */
const check_for_win = (card) => {
    let win = false

    // Check each row for a win first
    let row = 0
    for(; row < 5 && !win; row ++) {
        // Loop through each number in a row and && the marked value. If all values are true, the output should be true and we found a winner.
        win = card[row].reduce((row_win, {marked}) => row_win && marked, true)
        if (win) break
    }

    if (win) {
        card[row] = card[row].map(({num, marked}) =>({num, marked, winner: true}))
        return true
    }

    // Now check each column for a win
    let column = 0
    for(; column < 5 && !win; column ++) {
        // Loop through each row and check the current column being checked. If all values are true, the output should be true and we found a winner.
        win = card.reduce((col_win, row) => col_win && row[column].marked, true)
        if (win) break
    }
    if (win) {
        card = card.map(row => {
            let operating = row[column]
            operating.winner = true
            row[column] = operating
        })
        return true
    }
}

/**
 * Loop through all numbers in the card and sum the unmarked numbers
 * @param {[][]Object} card 
 */
const get_card_score = (card) => {
    return card.reduce((card_sum, row) => card_sum + row.reduce((row_sum, {num, marked}) => row_sum + (!marked && num) ,0),0)
}


/**
 * A function to pretty print a collection of bingo cards for fun
 * @param {*} bingo_cards 
 */
const pretty_print_boards = (bingo_cards, bingo_numbers, number_index) => {
    
    let final = bingo_numbers.reduce((str, num, i) => {
        let zxc = `${str}`
        if (i === Math.floor(bingo_numbers.length / 2) + 1) {
            zxc += '\n'
        }
        if (i < number_index) {
            zxc += ` \x1b[2m${num}\x1b[0m`
        } else if (i === number_index) {
            zxc += ` \x1b[32m${num}\x1b[0m`
        } else if (i > number_index) {
            zxc += ` \x1b[1m${num}\x1b[0m`
        }
        return zxc
    }, '')

    final += '\n'
    let current_num = bingo_numbers[number_index]

    for(let row_i = 0; row_i < 35; row_i++) {
        if (row_i % 5 === 0) {
            final += '\n'
        }
        for(let col_j = 0; col_j < 75; col_j++) {
            if(col_j % 5 === 0) {
                final += '  '
            }

            let bingo_index = (~~(row_i/5) * 15) + ~~(col_j / 5)
            if (bingo_index >= bingo_cards.length) {
                continue
            }
            let operating_card = bingo_cards[bingo_index]
            let {num, marked, winner} = operating_card[row_i%5][col_j%5]
            let num_str = `${num} `.padStart(3, ' ')
            if (check_for_win(operating_card)) {
                if (marked) {
                    if(winner) {
                        final += `\x1b[31m${num_str}\x1b[0m`
                    } else {
                        final += `\x1b[2m${num_str}\x1b[0m`
                    }
                } else {
                    final += `\x1b[30m${num_str}\x1b[0m`
                }
            } else {
                if (num === current_num) {
                    final += `\x1b[32m${num_str}\x1b[0m`
                } else if (marked) {
                    final += `\x1b[1m${num_str}\x1b[0m`
                } else {
                    final += `\x1b[2m${num_str}\x1b[0m`
                }
                loseflag = false
            }
        }
        final += '\n'
    }
    final += '\r'
    if (loseflag) return
    jetty.moveTo([0,0]).text(final)
}



(async function() {
    const {data} = await axios.get(`https://adventofcode.com/2021/day/4/input`,{
        "headers": {
            Cookie: `session=${process.env.session}`
        }
    })
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
        .map(num => ({num: parseInt(num), marked: false, winner: false})))) // Parse each number and turn it into an object with the called boolean
        
    let printing_cards = bingo_cards.slice()
    // Now we process everything. We want to loop through the bingo numbers until we find a winning card
    let winning_cards
    let winning_num = 0
    for(let i = 0; i < bingo_numbers.length; i++) {
        const called_number = bingo_numbers[i]
        bingo_cards = bingo_cards.map(card => mark_number(card, called_number))
        printing_cards = printing_cards.map(card => {
            if (check_for_win(card)) {
                return card
            }
            return mark_number(card, called_number)
        })
        pretty_print_boards(printing_cards, bingo_numbers, i)

        // In part 2, we actually want to remove winning cards until we're left with only a single winner
        let round_wins = bingo_cards.filter(card => check_for_win(card))
        if (round_wins.length !== 0) {
            // If we have some winners, remove them from the list
            bingo_cards = bingo_cards.filter(card => !check_for_win(card))
            if(bingo_cards.length === 0){
                // If we've run out of cards, then that means this round's winner is our solution
                winning_cards = round_wins
                winning_num = called_number
                break
            }
        }
        await new Promise(r => setTimeout(r, 500));
    }

    // winning_cards.forEach(winning_card => {
    //     console.log(
    //         winning_card.reduce((st,row) => 
    //             st+row.reduce((s,{marked}) => s+(marked?'+ ':'. '),'\n')
    //         ,'')+'\n'
    //     )

    //     const winning_score = get_card_score(winning_card)
    //     // console.log(winning_num, '*', winning_score, '=', winning_num*winning_score)
    // })
}())