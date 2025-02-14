var express = require('express');
var router = express.Router();

//holds the amount of books to view per page
//const pagination = 6;

//book model
const Book = require('../models').Book;
const SqlOp = require('sequelize').Op;

//creating a new book!
router.get('/books/new', (req, res, next) => {
	res.render('new-book', { book: Book.build(), title: 'New Book' });
});

//saving new book to database!
router.post('/books/new', (req, res) => {

  //creating the book promise
  Book.create(req.body)
    //redirect to books if no errors detected :)
		.then(() => {res.redirect('/books')})
    //catch errors
		.catch((err) => {

			//determine if error is a validation error
      if (err.name === "SequelizeValidationError") {
        //create new temporary book
        var tempBook = Book.build(req.body);
			  tempBook.id = req.params.id
        //re-render the new book page with errors!
        res.render('new-book', { book: tempBook, title: 'New Book', errors: err.errors });
    	} else {
        //all other errors, render the error page
		    res.render('error', { error:err });
    	}

  });
});


//get the book details for updating
router.get('/books/:id', (req, res, next) => {
  //find by primary key!
	Book.findByPk(req.params.id).then((book) => {
		if (book) {
    	return res.render('update-book', { book: book, title: book.title });
    } else {
      //book was not defined, piss off to 404
      next();
  	}
  });
});


//deleting books, use with caution!
router.post('/books/:id/delete', (req, res) => {
	Book.findByPk(req.params.id)

		.then((book) => {
			if (book) {
        //book found; fire at will
				book.destroy();
			} else {
        //undefined book? render error page
				res.render('error', { error:err });
			}
    })

    //redirect back home
		.then(() => { res.redirect('/books') })
    //error catcher just in case
		.catch((err) => { res.render('error', { error:err })});
});


//updating an existing book!
router.post('/books/:id', (req, res) => {
	Book.findByPk(req.params.id)
		.then((book) => { return book.update(req.body) })
		.then((book) => {
      //redirect if book is valid
			if (book) {
				res.redirect('/books');
			} else {
        //render error page
				res.render('error', { error:err });
			}
    })

		.catch((err) => {
			//determine (again) if error is a validation error
    	if (err.name === "SequelizeValidationError") {
        //create new temporary book
        var tempBook = Book.build(req.body);
			  tempBook.id = req.params.id
        //re-render the new book page with errors!
        res.render('update-book',	{ book: tempBook, title: tempBook.title, errors: err.errors });
    	} else {
        //all other errors, render the error page
				res.render('error', { error:err });
    	}
    }
  );
});

router.get('/books', (req, res) => {
	// Grab the page param, default to 1 if not specified
	let page = parseInt(req.query.page);
	if (isNaN(page)) { page = 1 }
  
	// Grab the resultsPerPage from the query string
	// Default to 6 if not present
	let pagination = parseInt(req.query.resultsPerPage);
	if (isNaN(pagination) || pagination < 1) {
	  pagination = 5;
	}
  
	// Grab any search param
	let search = req.query.search;
  
	let findOptions = {};
  
	// If user typed something in the search bar, apply a WHERE clause
	if (search) {
	  findOptions.where = {
		[SqlOp.or]: [
		  { title:  { [SqlOp.like]: `%${search}%` } },
		  { author: { [SqlOp.like]: `%${search}%` } },
		  { genre:  { [SqlOp.like]: `%${search}%` } },
		  { year:   { [SqlOp.like]: `%${search}%` } }
		]
	  }
	}
  
	// Now find the total results for pagination math
	Book.findAll(findOptions).then((books) => {
	  let numberOfResults = books.length;
	  let buttonsNeeded   = Math.ceil(numberOfResults / pagination);
  
	  // Build your pagination buttons
	  let pageButtons = [];
  
	  // Add previous button (default disabled if page=1)
	  pageButtons.push({
		display: "<",
		destination: page - 1,
		disabled: page <= 1
	  });
  
	  // Create numbered page buttons
	  for (let i = 1; i <= buttonsNeeded; i++) {
		pageButtons.push({
		  display: i.toString(),
		  destination: i,
		  disabled: i === page
		});
	  }
  
	  // Add next button (default disabled if at last page)
	  pageButtons.push({
		display: ">",
		destination: page + 1,
		disabled: page >= buttonsNeeded
	  });
  
	  // Update findOptions for offset & limit
	  findOptions.offset = (page - 1) * pagination;
	  findOptions.limit  = pagination;
  
	  // Fetch the 'paged' records
	  Book.findAll(findOptions).then((books) => {
		res.render('index', {
		  title: 'Books',
		  books,             // your paged data
		  search: search || '', 
		  paginationButtons: pageButtons,
		  numberOfResults,
		  pagination // might want to pass the chosen page size to the template if you want to highlight it in your <select>
		});
	  });
	});
  });
  


// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
