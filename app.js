const express = require('express');
const request = require("request");
const app = express();
const firebase = require('firebase');

firebase.initializeApp({
    databaseURL: 'https://quiz-8cfbc.firebaseio.com',
});

app.set("view engine", "ejs");
app.use(express.static("public"));

var questions;
var incorrectOptions;

var correctAnswers;
var options = [];

const fetchQuestions = (req, res, next) => {
    const url='easy/'+req.params.subject;

    incorrectOptions = [];
    correctAnswers = [];
    questions = [];
    var leadsRef = firebase.database().ref(url);
    leadsRef.on('value', ((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            questions.push(childSnapshot.val().question);
            incorrectOptions.push(childSnapshot.val().incorrect_answers);
            correctAnswers.push(childSnapshot.val().correct_answer);
        })
        // console.log(correctAnswers);
        // console.log("subject");
        next();
    }))
}

app.get("/", (req, res) => {
    res.render("homePage");
});

app.get("/easy/:subject", fetchQuestions, (req, res, next) => {
    var subject = req.params.subject;
    res.redirect("/easy/"+subject+"/0");
    console.log("easy start");
})

app.get("/easy/:subject/:num", (req, res) => {
    var num = req.params.num;
    if (num > 9) {
        res.redirect("/easy/"+req.params.subject+"/0");
    }
    else if (correctAnswers && questions && incorrectOptions) {
        console.log(correctAnswers);
        var options = [...incorrectOptions[num]].concat(correctAnswers[num]);

        var random = Math.floor(Math.random() * 4);
        var temp = options[random];
        options[random] = correctAnswers[num]
        options[3] = temp;
        var next = (parseInt(num) + 1);

        res.render("quizStart", { questions: questions[num],subject:req.params.subject , next: next, options: options, correctAnswer: correctAnswers[num] });
    } else {
        res.redirect("/");
    }
})

app.get("/questions", (req, res) => {
    res.send(1);
})

// API used for getting questions and storing it in the database
// var url="https://opentdb.com/api.php?amount=10&category=23&difficulty=easy&type=multiple"
// request(url,(error,response,body)=>{
// if(!error && response.statusCode==200)
// {
//     var parsedData=JSON.parse(body);
//     for(var i=0 ;i<=9;i++)
//     firebase.database().ref('/easy/history').push(parsedData.results[i]);
// }
// else console.log(error);
// });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));