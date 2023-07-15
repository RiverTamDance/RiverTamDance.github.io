//storing the sudoku like this means sudoku[row][col] works as expected.

//I should use a map instead...
const sudoku_test = 
[
[0,0,3,0,2,0,6,0,0],
[9,0,0,3,0,5,0,0,1],
[0,0,1,8,0,6,4,0,0],
[0,0,8,1,0,2,9,0,0],
[7,0,0,0,0,0,0,0,8],
[0,0,6,7,0,8,2,0,0],
[0,0,2,6,0,9,5,0,0],
[8,0,0,2,0,3,0,0,9],
[0,0,5,0,1,0,3,0,0]
]

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

//I need to define square sections
let map_sudoku_test = new Map()
for (let i = 0; i <sudoku_test.length; i++){
    for(let j = 0; j<sudoku_test[i].length; j++){

        let coords = "" + i + "," + j
        map_sudoku_test.set(coords, [sudoku_test[i][j], new Set()]);

    }
}

const one_to_nine = new Set([1,2,3,4,5,6,7,8,9])


// This is my pass-by-reference or pass-by-value test suite
// // //
// console.log(sudoku_test[1][0])
// console.log(map_sudoku_test.get("1,0"))
// sudoku_test[1][0] = 5
// console.log(sudoku_test[1][0])
// console.log(map_sudoku_test.get("1,0"))

function taken_row_values(i){

    //we move along the columns for a given row
  let taken_values = new Set()
  for (j = 0; j<9; j++){
    let coords = "" + i + "," + j
    const val = map_sudoku_test.get(coords)[0]
    if (val != 0) {
      taken_values.add(val)
    }
  }

  return taken_values

}

function taken_col_values(j){

  let taken_values = new Set()
  for (i= 0; i<9; i++){
    let coords = "" + i + "," + j
    const val = map_sudoku_test.get(coords)[0]
    if (val != 0) {
      taken_values.add(val)
    }
  }

  return taken_values
}


let map_squares = new Map()
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

function taken_square_values(coords){

  let coords_split = coords.split(",")
  let i_adjusted = Math.floor(coords_split[0]/3)
  let j_adjusted = Math.floor(coords_split[1]/3)
  let coords_adjusted = "" + i_adjusted + "," + j_adjusted 
  let square_coords = map_squares.get(coords_adjusted)

  let taken_values = new Set()
  for (let a = 0; a < square_coords.length; a++){
    
    const val = map_sudoku_test.get(square_coords[a])[0]
    if (val != 0) {
      taken_values.add(val)
    }
  }

  return taken_values

}

//I would like each [row][col] entry of my sudoku object to be 2-length array, 
//that contains the values [actual, potential set].
for (let i = 0; i <9; i++){
    for(let j = 0; j<9; j++){
      let coords = "" + i +"," + j
      let actual_val = map_sudoku_test.get(coords)[0]
        
        if (actual_val == 0){
          // a potential set is informed by what...
            let row_set = taken_row_values(i)
            let col_set = taken_col_values(j)
            let square_set = taken_square_values(coords)

            // console.log(coords)
            // console.log(row_potential_set)
            // console.log(col_potential_set)
            // console.log(square_potential_set)

            big_union = union(union(row_set, col_set), square_set)
            
            // console.log(big_union)
            // console.log("******")

            potential_set = difference(one_to_nine, big_union)
            map_sudoku_test.set(coords, [0, potential_set])
        
        } 
    }
}

function update_sudoku(coords, val){

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
      map_sudoku_test.get(col_change)[1].delete(val)

      let row_change = ""+row_coord+","+i 
      map_sudoku_test.get(row_change)[1].delete(val)

      map_sudoku_test.get(square_coords[i])[1].delete(val)

  }  

}


function simplify(map_sudoku_test){
  let change = true
  while (change == true){
    change = false
    for (let i = 0; i<9; i++){
      for (let j=0; j<9; j++){
        
        let coords = ""+i+","+j
        // console.log(coords)
        // console.log(map_sudoku_test.get(coords))
        
        if (map_sudoku_test.get(coords)[0] == 0){

          let potential_set = map_sudoku_test.get(coords)[1]

          if (potential_set.size == 1){
            change = true
            const val = potential_set.values().next().value
            map_sudoku_test.set(coords, [val, new Set()])
            update_sudoku(coords, val)

          } else {

            // row potential set union & difference
            var row_potential_sets = new Set()
            for (let c = 0; c<9; c++){
              if (c != j){
                let temp_coords = ""+i+","+c
                row_potential_sets = union(row_potential_sets, map_sudoku_test.get(temp_coords)[1])
              }
            }

            // column potential set union & difference
            var column_potential_sets = new Set()
            for (let r = 0; r<9; r++){
              if (r != i){
                let temp_coords = ""+r+","+j
                column_potential_sets = union(column_potential_sets, map_sudoku_test.get(temp_coords)[1])
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
                square_potential_sets = union(square_potential_sets, map_sudoku_test.get(s)[1])
              }
            }

            let row_potential_difference = difference(potential_set, row_potential_sets)
            let column_potential_difference = difference(potential_set, column_potential_sets)
            let square_potential_difference = difference(potential_set, square_potential_sets)
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
        let no_zeros_bool = false;
      }
    
    }
  }
  return(no_zeros_bool)
}

function solve(map_sudoku_test){

  let guess_stack = [];
  guess_stack.push(map_sudoku_test);

  let solved = false;
  while (solved == false){
    var current_guess = guess_stack.pop();
    simplify(current_guess)
    solved = no_zeros(current_guess)

    if (solved == false){

      console.log("hello, false it is :)")

    }
  }

  return(current_guess)

}

map_sudoku_test = solve(map_sudoku_test);



let str1 = ""
for ( let i = 0; i<9; i++){
  for ( let j = 0; j<9; j++){

    let coords = "" + i + "," + j
    str1 += map_sudoku_test.get(coords)[0] + ","

  }
  str1 += "\n"
}


console.log(str1)
