

//-------------------------------------------------------------------------------

// function lines(text) {  
//   return text.split('\n')
// }

// function chars(text) {  
//   return text.split('')
// }

// function extract_sudokus(text) {
//   var sudokus = []
//   for (s=0; s<50; s++){
//     var sudoku = []
//     for (l=1; l<10; l++){
//       var row = chars(text[s*10+l])
//       var new_row = []
//       for (c of row){
//         new_row.push(parseInt(c))
//       }
//       sudoku.push(new_row)
//     }
//     sudokus.push(sudoku)
//   }
//   return(sudokus)
// }

function union(setA, setB) {
    const _union = new Set(setA);
    for (const elem of setB) {
      _union.add(elem);
    }
    return _union;
  }

function difference(setA, setB) {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

function taken_row_values(i, sudoku){

    //we move along the columns for a given row
  let taken_values = new Set()
  for (j = 0; j<9; j++){
    let coords = "" + i + "," + j
    const val = sudoku.get(coords)[0]
    if (val != 0) {
      taken_values.add(val)
    }
  }

  return taken_values

}

function taken_col_values(j, sudoku){

  let taken_values = new Set()
  for (i= 0; i<9; i++){
    let coords = "" + i + "," + j
    const val = sudoku.get(coords)[0]
    if (val != 0) {
      taken_values.add(val)
    }
  }

  return taken_values
}

function taken_square_values(coords, sudoku){

  let coords_split = coords.split(",")
  let i_adjusted = Math.floor(coords_split[0]/3)
  let j_adjusted = Math.floor(coords_split[1]/3)
  let coords_adjusted = "" + i_adjusted + "," + j_adjusted 
  let square_coords = map_squares.get(coords_adjusted)

  let taken_values = new Set()
  for (let a = 0; a < square_coords.length; a++){
    
    const val = sudoku.get(square_coords[a])[0]
    if (val != 0) {
      taken_values.add(val)
    }
  }

  return taken_values

}

function prep_sudoku(sudoku){

  let map_sudoku = new Map()
  for (let i = 0; i <sudoku.length; i++){
    for(let j = 0; j<sudoku[i].length; j++){

        let coords = "" + i + "," + j
        map_sudoku.set(coords, [sudoku[i][j], new Set()]);
    }
  }
  //I would like each [row][col] entry of my sudoku object to be 2-length array, 
  //that contains the values [actual, potential set].
  for (let i = 0; i<9; i++){
    for(let j = 0; j<9; j++){
      let coords = "" + i +"," + j
      let actual_val = map_sudoku.get(coords)[0]
        
      if (actual_val == 0){
      // a potential set is informed by what...
        let row_set = taken_row_values(i, map_sudoku)
        let col_set = taken_col_values(j, map_sudoku)
        let square_set = taken_square_values(coords, map_sudoku)

        // console.log(coords)
        // console.log(row_potential_set)
        // console.log(col_potential_set)
        // console.log(square_potential_set)

        big_union = union(union(row_set, col_set), square_set)
        
        // console.log(big_union)
        // console.log("******")

        potential_set = difference(one_to_nine, big_union)
        map_sudoku.set(coords, [0, potential_set])
      
      } 
    }
  }

  return(map_sudoku)

}


function update_sudoku(coords, val, sudoku){

  coords_split = coords.split(",")
  row_coord = coords_split[0]
  col_coord = coords_split[1]

  let row_coord_adjusted = Math.floor(row_coord/3)
  let col_coord_adjusted = Math.floor(col_coord/3)
  let coords_adjusted = "" + row_coord_adjusted + "," + col_coord_adjusted

  //there could be issues here, I'm not sure if I'm allowed to use "let" this way
  let square_coords = map_squares.get(coords_adjusted)

  for (let i = 0; i <9; i++){
      let col_change = ""+i+","+col_coord
      sudoku.get(col_change)[1].delete(val)

      let row_change = ""+row_coord+","+i 
      sudoku.get(row_change)[1].delete(val)

      sudoku.get(square_coords[i])[1].delete(val)

  }

}


function simplify(sudoku){
  let change = true
  while (change == true){
    change = false
    for (let i=0; i<9; i++){
      for (let j=0; j<9; j++){
        
        let coords = ""+i+","+j

        if (sudoku.get(coords)[0] == 0){

          let potential_set = sudoku.get(coords)[1]

          if (potential_set.size == 1){
            change = true
            const val = potential_set.values().next().value
            sudoku.set(coords, [val, new Set()])
            update_sudoku(coords, val, sudoku)

          } else {

            // row potential set union & difference
            var row_potential_sets = new Set()
            for (let c = 0; c<9; c++){
              if (c != j){
                let temp_coords = ""+i+","+c
                row_potential_sets = union(row_potential_sets, sudoku.get(temp_coords)[1])
              }
            }

            // column potential set union & difference
            var column_potential_sets = new Set()
            for (let r = 0; r<9; r++){
              if (r != i){
                let temp_coords = ""+r+","+j
                column_potential_sets = union(column_potential_sets, sudoku.get(temp_coords)[1])
              }
            }

            // square potential set union & difference

            let i_adjusted = Math.floor(i/3)
            let j_adjusted = Math.floor(j/3)
            let coords_adjusted = "" + i_adjusted + "," + j_adjusted 
            let square_coords = map_squares.get(coords_adjusted)
            var square_coords_length = square_coords.length;

            var square_potential_sets = new Set()
        
            for (let k = 0; k < square_coords_length; k++){
              let s = square_coords[k]
              if (s != coords){
                square_potential_sets = union(square_potential_sets, sudoku.get(s)[1])
              }
            }
            //20230924
            //Right now I need to get the potential set logic set-up
            let row_potential_difference = difference(potential_set, row_potential_sets)
            let column_potential_difference = difference(potential_set, column_potential_sets)
            let square_potential_difference = difference(potential_set, square_potential_sets)
            
            if (row_potential_difference.size == 1){
              change = true;
              const val = row_potential_difference.values().next().value;
              sudoku.set(coords, [val, new Set()]);
              update_sudoku(coords, val, sudoku);
            } else if (column_potential_difference.size == 1) {
              change = true
              const val = column_potential_difference.values().next().value
              sudoku.set(coords, [val, new Set()])
              update_sudoku(coords, val, sudoku)
            } else if (square_potential_difference.size == 1) {
              change = true
              const val = square_potential_difference.values().next().value
              sudoku.set(coords, [val, new Set()])
              update_sudoku(coords, val, sudoku)
            }
          }
        }
      }
    }
  }
}


function no_zeros(sudoku){

  let no_zeros_bool = true;

  for (let i = 0; i<9; i++){
    for (let j = 0; j<9; j++){

      let coords = ""+i+","+j;

      if (sudoku.get(coords)[0] == 0){
        no_zeros_bool = false;
      }
    
    }
  }
  return(no_zeros_bool)
}

function update_value(sudoku, coords, guess){

  sudoku.set(coords, [guess, new Set()])

}

// Below are the constants that the rest of the program uses

const one_to_nine = new Set([1,2,3,4,5,6,7,8,9])

const map_squares = new Map()
for (let i = 0; i < 9; i++){
  for (let j = 0; j<9; j++){
    
    let coords = "" + i + "," + j
    i_adjusted = Math.floor(i/3)
    j_adjusted = Math.floor(j/3)
    // I haven't really thought about local vs global naming and this may ruin things
    // somehting to look out for here.
    let coords_adjusted = "" + i_adjusted + "," + j_adjusted;
    
    // looks like: "1,1" gets ["3,3" "3,4", "3,5",...,"5,5"] 
    let square_entry = map_squares.get(coords_adjusted);
      if (square_entry == undefined) {
        // console.log(k)
        // console.log(undefined)
        map_squares.set(coords_adjusted, [coords])
      } else {
        square_entry.push(coords);
      }
  }
}

function solve(sudoku){

  sudoku = prep_sudoku(sudoku)

  let guess_stack = [];
  guess_stack.push(sudoku);

  let solved = false;
  while (solved == false){
    var sudoku = guess_stack.pop();

    // if (sudoku_old = sudoku){
    //   console.log("no change")
    // }
    simplify(sudoku)
    solved = no_zeros(sudoku)

    if (solved == false){

      // kill a branch if we end up with an impossible scenario
      var alive_branch = true
      for (let [k,v] of sudoku){
        if (v[0] == 0 && v[1].size == 0){
          //coods = k
          alive_branch = false
        }
      }
      if (alive_branch == true){
        
        // get a "list" of all unsovled cells
        let best = 10
        for (let [k,v] of sudoku){
          if (v[0] == 0 && v[1].size < best){
            // get a cell that has the least possible options for our guess and check
            best = v[1].size
            var best_coords = k

            
          }

        }

        for (let guess of sudoku.get(best_coords)[1]){
          // for each potential value in our cell, add a guess to the stack
          const sudoku_new = structuredClone(sudoku)
          update_value(sudoku_new, best_coords, guess)
          update_sudoku(best_coords, guess, sudoku_new)
          // sudoku = update_sudoku(best_coords, guess, sudoku)
          guess_stack.push(sudoku_new)
        }
      }

    }

  }

  return(sudoku)

}