"use strict"

// BOOKS REDUCERS
export function booksReducers(state={books: []}, action) {
  switch(action.type) {
    case "GET_USERS":
    return {...state, books:[...action.payload]}
    case "POST_USER":
    return {...state,
        books: [...state.books, ...action.payload],
        msg: 'Saved! Click to continue',
        style: 'success',
        validation: 'success'}
    break;
    case "POST_USER_REJECTED":
    return {...state,
        msg:'Please try again',
        style:'danger',
        validation: 'error'}
    break;
    case "RESET_BUTTON":
    return {...state,
        msg: null,
        style: 'primary',
        validation: null};
    break;
    case "DELETE_USER":
    // Create a copy of the current array of books
    const currentBookToDelete = [...state.books];
    // Determine at which index in books array is
    // the book to be deleted
    const indexToDelete = currentBookToDelete.findIndex(
      function(book) {
        return book._id == action.payload;
      }
    )
    // use slice to remove the book at the specified index
    return {books: [...currentBookToDelete.slice(0, indexToDelete),
    ...currentBookToDelete.slice(indexToDelete + 1)]}
    break;

    case "UPDATE_USER":
    // Create a copy of the current array of books
    const currentBookToUpdate = [...state.books];
    // Determine at which index in books array is the book to be deleted
    const indexToUpdate = currentBookToUpdate.findIndex(
      function(book) {
        return book._id === action.payload._id;
      }
    )
    // create a new book object with the new values
    const newBook = {
      ...currentBookToUpdate[indexToUpdate],
      username: action.payload.username
    }
    console.log("what newBook is: ", newBook);
    return {books: [...currentBookToUpdate.slice(0, indexToUpdate),
    newBook, ...currentBookToUpdate.slice(indexToUpdate + 1)]}
    break;
  }

  return state
}
