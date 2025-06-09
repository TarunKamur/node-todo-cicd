const express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    sanitizer = require('sanitizer'),
    app = express(),
    port = 8000

// Optional: Add allowed hosts check
const allowedHosts = [
    'localhost',
    '127.0.0.1',
    process.env.ALLOWED_HOST  // e.g. your ELB DNS
].filter(Boolean);

app.use((req, res, next) => {
    const host = req.hostname;
    if (allowedHosts.includes(host) || process.env.ALLOW_ALL_HOSTS === 'true') {
        return next();
    }
    return res.status(403).send(`Blocked request. This host (${host}) is not allowed.`);
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

let todolist = [];

app.get('/todo', function (req, res) {
    res.render('todo.ejs', {
        todolist,
        clickHandler: "func1();"
    });
})
.post('/todo/add/', function (req, res) {
    let newTodo = sanitizer.escape(req.body.newtodo);
    if (req.body.newtodo != '') {
        todolist.push(newTodo);
    }
    res.redirect('/todo');
})
.get('/todo/delete/:id', function (req, res) {
    if (req.params.id != '') {
        todolist.splice(req.params.id, 1);
    }
    res.redirect('/todo');
})
.get('/todo/:id', function (req, res) {
    let todoIdx = req.params.id;
    let todo = todolist[todoIdx];
    if (todo) {
        res.render('edititem.ejs', {
            todoIdx,
            todo,
            clickHandler: "func1();"
        });
    } else {
        res.redirect('/todo');
    }
})
.put('/todo/edit/:id', function (req, res) {
    let todoIdx = req.params.id;
    let editTodo = sanitizer.escape(req.body.editTodo);
    if (todoIdx != '' && editTodo != '') {
        todolist[todoIdx] = editTodo;
    }
    res.redirect('/todo');
})
.use(function (req, res, next) {
    res.redirect('/todo');
})
.listen(port, function () {
    console.log(`Todolist running on http://0.0.0.0:${port}`);
});

module.exports = app;
