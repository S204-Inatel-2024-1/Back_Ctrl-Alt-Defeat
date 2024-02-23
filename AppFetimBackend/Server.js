const express = require('express')

const app = express()

app.get("/", (request, response) => {
    console.log("Here")
    response.status(500).send("yoooo")
})


app.listen(3000)