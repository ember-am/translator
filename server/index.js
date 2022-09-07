const cors = require('cors');
const express = require('express');
const translate = require('@vitalets/google-translate-api');

const app = express();

app.use(cors());

app.get('/', function(req, res) {
    res.send("API is running..")
})

app.get("/api/translator?", async function(req, res) {
    const keywords = req.query.keywords // hello
    const input = req.query.input // en
    const output = req.query.output // it

    // if keywords input contains a space post trim(), then we have a multi-word input. 
    // In this case, we do the following:
    //      1 - append an exclamation point to the end of each word
    //      2 - on response, we place words into an array based on positions


    if (keywords && input && output) {
        console.log("calling API...")
        // translate text.. send call to open source translate API 
        // We know the request is being sent..
        const result = await translate(keywords, {from: input, to: output})

        console.log(result)
        if (result.text && result.text.length > 0)
            return res.status(200).json(result.text)
        else return res.status(401).json({ message: 'Server Error.'})
    }
});


app.listen(3000, function() {
    console.log('Express server is up and running on port 3000');
})