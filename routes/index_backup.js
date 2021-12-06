var express = require('express');
var router = express.Router();

//holds the amount of books to view per page
const pagination = 6;

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


//home route - also displays search results!!
router.get('/books', (req, res) => {

  //get current page and search from parameters
	var page = parseInt(req.query.page);
	var search = req.query.search;

  //default page to 1 if not provided
	if (isNaN(page)) { page = 1 }

  //findOptions will hold the options for FindAll later!
  var findOptions = {};

  //offset the results based on which page you are currently on
	findOptions.offset = (page-1) * pagination;
  //limit the results per page
	findOptions.limit = pagination;

	//search options!
	if (search != undefined) {
    //add %'s can be anywhere within the string
    //search = `%${search}%`; <-- creates a bug in the search bar

    //apply the WHERE clause
		findOptions.where = {
			[SqlOp.or]: [
				{ title:   {[SqlOp.like]: `%${search}%`}},
				{ author:  {[SqlOp.like]: `%${search}%`}},
				{ genre:   {[SqlOp.like]: `%${search}%`}},
				{ year:    {[SqlOp.like]: `%${search}%`}}
			]
    }
	 }

	//find all books within the find options!!
	Book.findAll(findOptions).then((books) => {

		var renderOptions = { books: books, title: 'Books' }

    //enter a blank search if empty
		renderOptions.search = search || ''

    //render the previous button if beyond page 1
		if (page > 1) { renderOptions.previousPage = page - 1 }

    //only show next button when results match pagination
		if (books.length == pagination) { renderOptions.nextPage = page + 1 }

    //render the page with the render options!
  	res.render('index', renderOptions);
	});
});

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
