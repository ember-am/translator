console.log("Content script is running!", chrome);

// USER PARAMETERS -> SET THIS FOR YOURSEFL!!
let DIFFICULTY_FACTOR = 3;  // integers b/w 2 and 7.. lower = "harder" or simply more of learning language (think like ratio.. 1:3, learn:know)
let KNOWN_LANGUAGE    = "en" // must be iso language code (the language you already know)
let LEARNING_LANGUAGE = "it" // must be iso language code (the language you want to learn)



// Injecting a single method to handle onClick() and transition b/w pre/post trans
var injectedScript = document.createElement('script');
let injectedScriptURL = chrome.runtime.getURL('inject-script.js')
console.log("injectedScriptUrl", injectedScriptURL)

injectedScript.src = chrome.runtime.getURL('inject-script.js')
injectedScript.type = "text/javascript";
injectedScript.onload = function() {
  console.log("Loaded!");
};
(document.head || document.documentElement).appendChild(injectedScript);

// Get all paragraphs tagged text from the web-page
let htmls = document.querySelectorAll("p")


// Constants: 
let TAG_MARKER = "%$#?";
let SPACE = " ";
let SPACE_CHAR = ' ';
let ZERO_CHAR = '0';
let ONE_CHAR = '1';
let ERROR_MARKER = "%&#!";
let PERIOD = ".";
let EMPTY_STRING = "";
let EMPTY_CHAR = '';
let FORWARD_SLASH = '/';
let O_BRACKET_CHAR = '<';
let C_BRACKET_CHAR = '>';
let O_PAREN_CHAR = '(';
let C_PAREN_CHAR = ')';
let O_CURL_CHAR = '{';
let C_CURL_CHAR = '}';


// Processing <p/> sections one at a time
for (let n = 0; n < htmls.length; n++) {
  let html = htmls[n]
  console.log(html.innerHTML)

  // We get our HTMLElement to parse
  let string = html.innerHTML.toString()
  //console.log(string)
  let stack = [];
  let words = ""



  // Iterate over HTMLElement, identifying tags as we go, and tracking open/close brackets
  for (let i = 0; i < string.length; i++) {
    let tempTag = EMPTY_STRING
    if (string.charAt(i) == O_BRACKET_CHAR) {
      console.log("found tag")
      j = i + 1
      while (string.charAt(j) != C_BRACKET_CHAR && string.charAt(j) != SPACE_CHAR) {
        tempTag += `${string.charAt(j++)}` 
      }
      if (tempTag.includes(FORWARD_SLASH)) {console.log("replaced"); tempTag = tempTag.replace(FORWARD_SLASH, EMPTY_CHAR)}

      if (stack[stack.length - 1] == tempTag) {
        console.log(`closing current tag: <${tempTag}/>`)
        stack.pop()
        i = j
        words += TAG_MARKER
      } else { stack.push(tempTag) }

    } else {
      // If the content is not within an inner tag, add it to a string called "words"
      if (stack.length == 0) {
        words += string.charAt(i)
      }
      // if the stack is empty, add contents of HTMLElement to words string.
      // add to a string that we will split into all words.. ie. the innerText of the HTMLElement.
    }   
  }

// Split apart our words string and identify potential words for translation and replacement wih <link/>
let array = words.split(SPACE)

let count = 0;
let contexts = [];
let numberOfTranslatedWords = 0;
let processedword = "";

// A method that contains the following for loop, that takes a string of 'words' and returns and contexts[] array
async function getContexts(words) {
    for (let n = 0; n < array.length; n++) { 
      let word = array[n]
      
      if (word.length > 3 && (!word.includes(PERIOD) || !word.includes(TAG_MARKER) || !word.includes('-')
          || !word.includes(ONE_CHAR) || !word.includes(ZERO_CHAR) )) {
        count++;
        if (count % DIFFICULTY_FACTOR == 0) {
          // if translate, get context.. iterate forward and backward +/-2
          // if the context includes tag identifier, skip the word.. (easier than trying to mitigate)

          // Getting the context for a specific word: 
          let wMinus2 = array[n-2] ? array[n-2] : ERROR_MARKER;
          let wMinus1 = array[n-1] ? array[n-1] : ERROR_MARKER;
          let wPlus1  = array[n+1] ? array[n+1] : ERROR_MARKER;
          let wPlus2  = array[n+2] ? array[n+2] : ERROR_MARKER;

          // if we do not have a complete context, then we should not translate.. because there is potential
          //  for overlap.. our uniqueness while searching html is not guarunteed
          
          let context = wMinus2 + SPACE + 
                        wMinus1 + SPACE + 
                        word    + SPACE + 
                        wPlus1  + SPACE + 
                        wPlus2;

          // Avoid possible chars that could cause errors, dates, etc. (all dates will include, 1, 0 or will fail on length)
          if (context.includes(TAG_MARKER) || context.includes(ERROR_MARKER) || context.includes(O_CURL_CHAR) || 
              context.includes(O_PAREN_CHAR) || context.includes(C_CURL_CHAR) || context.includes(C_PAREN_CHAR)) { 
            console.log("don't translate: ", word)
          } else { 
            console.log("translate: ", word) 
            numberOfTranslatedWords++;

            let promise = translateWord(word) // These promises don't resolve for a while.
            promise.then((data) =>  {
              processedword = data; 

              let processedWordWithTags = `<button pre-translate="${word}" style="border:none;background:#95EDFF;border-radius:4px;" onclick="injectedScript(this);">${processedword}</button>`
              let newContext = context.replace(word, processedWordWithTags)

              console.log(`pushing entry for ${word} to contexts[]`)
              contexts.push([word, processedword, context, newContext])
              // console.log("length: ", contexts.length) // ***** THIS IS PRINTING OUT SUPER LATE... WHY?
            })

            // Create an object that holds everything.. defined in separate file, and then iterate through an 
            //  array of these objects, replacing as we go.. then search html for string and insert clickable link
            //  with clearly defined behavior.. and use default css for the page.. or make it an in-line button?

            // Test and see what works best from a usability perspective. 
            // We have the logic we need.. and best of all, we can iterate through an array 
            //  of values :)
            
          }

        } else {
          console.log("dont translate: ", word)  
        }
      } else if (word.includes(TAG_MARKER)) { console.log("tag found") 
      } else { console.log("just a word: ", word) }
    }
    // want to wait until all contexts are resolved before returning...
    return contexts
}


// Method to replace our english context strings with those including our translated  word
function replaceText(contexts) {
  for (var j = 0; j < contexts.length; j++) {
    console.log("running context for: ", contexts[j][1])
    html.innerHTML = html.innerHTML.replace(new RegExp(contexts[j][2], "g"), `${contexts[j][3]}`);
  }
 }

 // Method is waiting until we get all our responses back for a specific seciton PRIOR swapping the text for that section
 function checkConditionAndReplaceTexts() {
  if (numberOfTranslatedWords != contexts.length) {
    console.log("contexts[] not yet returned")
    setTimeout(checkConditionAndReplaceTexts, 50);
  } else {
    console.log("contexts", contexts, "length?: ", contexts.length) 
    console.log("contexts[] returned")
    replaceText(contexts)
  }
}

getContexts()
checkConditionAndReplaceTexts()
}


// This code is left in from previous method of click and translate/define approach. It is not ideal but gives context for methods chosen. 
//    (It is unused in the extension.)
async function wordSelected() {
  let selection = window.getSelection().toString().trim();

  if (selection.length > 3) { // words four+ chars only
    console.log("selected: ");
    console.log(selection)

    // OR, we put multi-word selections in an array, like this, loop through, and display result array
    // It's slow, but accurate, especially for multi-part words, with no capitalization errors

    // Next -> ingest words in page and change 18% of them to Italian as a trial 
    //            (beginner: 18, intermediate: 54, advanced: 81)
    // We get all the text on the page with a <p> tag, get the translation for a percentage of the words, 
    // and then replace them in position, with the appropriate translated word object! in a bold font, 
    // which enables quick finding of translated words, and will run a wordnik api call for the definition
    // upon selection and display it (either in location on page OR in the popup.)

    
    if (selection.includes(' ')) {
      console.log("multi-word selection")
      let selected = selection + ""
      let words = selected.split(" ")
      console.log(words)
      let translatedWords = []
      for (var i = 0; i < words.length; i++) {
        console.log("word: " + words[i])
        let translatedWord = await fetch(`http://localhost:3000/api/translator?keywords=${words[i]}&input=${KNOWN_LANGUAGE}&output=${LEARNING_LANGUAGE}`)
        let translated = await translatedWord.json();
        console.log(translated)
        translatedWords.push(translated)
      }
      console.log(translatedWords)
    }
    else {
      translation = await fetch(`http://localhost:3000/api/translator?keywords=${selection}&input=${KNOWN_LANGUAGE}&output=${LEARNING_LANGUAGE}`)
      console.log("translated: ")
      console.log(await translation.json())
    }
  }
}

// E perfetto.. adesso possiamo usare questo logico :)

//             It is because console is TRYING to be helpful by populating the array after the fact. It is empty at print.

// HERE WE ARE TRYING TO WAIT UNTIL TRANSLATED WORDS ARE ALL PRESENT IN CONTEXTS ARRAY..

  // we want to wait to proceed.. process all words, get all contexts in array, THEN render with <a/> replacements
  // so we should put the above into a method and await.. but how do we know when finished reading? 
 // perfetto. Now we iterate over this array
                                    // replacing words one by one using contect :) 

// NEXT -> we need to figure out a way to wait until we have all our contexts for a given chunk of text, BEFORE,
//          calling our code that begins replacing each context with newContext. (probably async, await, and then...)
//          BUT, we want all our contexts back BEFORE.. so maybe checking contexts to see if full or not..
//          could use setTimeout @10ms to check length of contexts == numberOfTranslatedWords...

// THEN -> After that, it is simply opening up our html inject to achieve desired funcitonality (definition in popup?)
//          and having the tag have some meta property to store the necessary data for swap back
// THEN -> Creating the logic to swap back text to english for a set period of time (3 seconds)
// THEN -> Expanding from one paragraph of translation and swaps to the entire page.. and testing testing testing!
                  
// Replace words with strings..?! -> this is causing the connection to google translate to crash.. why? makes no sense?

 
// Method that makes API calls to local host and translates words.. one at a time. Want to Optimize? Implement batch translation!!!
  async function translateWord(word) {
    response = await fetch(`http://localhost:3000/api/translator?keywords=${word}&input=${KNOWN_LANGUAGE}&output=${LEARNING_LANGUAGE}`)
    const translated = await response.json()
    return translated
  }

// What would be required.. well, we would need to exclusively work with the html element.. OR, we could search
// for the phrase surrounding the text.. which would greatly decrease our possibility for error.. two characters
// befor and two words behind? Or better yet, only the two words before..

// So, first we get our array of splitTextBlocks that match our conditions
// Then, we translate words and keep track of the original and two proceeding words (of 4+ chars) (custom object?)
// Then, we get the inner html for the same block, search for the word, and replace it with an html link
//     that will change the text for 3 seconds back to the original word. 


// S T A R T  H E R E !!! -> 
// How do we accurately and predictibly find the word to be changed AND insert an htmlElement in its place? 
// -> We could search for all the characters between the last three four letters words. Now, if there exist
//    any htmlElements between our words, the search will fail...

// -> We could use React... b/c it supports JSX, don't know how well that will work with yarn.. and express server
//          and we would need a compiler to translate back to React. Navigating those build changes, the app
//          insertion will be significantly easier, plus we can input react elements onto the page and 
//          make the overall UX more beautiful. I think React it is :) At least we're going to try to get 
//          all the functionality up an running in this build, into a React app.



// console.log(textArray)

// We get our textArray, and store it safely. Then we iterate through it by index, for each index
// that gives a modulus zero based on your difficultly multiple, we call .replace().. but this replaces all 
// instances AND, it does so in the array, not mutating our page text.. thus we must manipulate the page 
// text directly somehow, and each replace() method must contain the data of the original word. In this way, 
// we can iterate over the string by " ", translating and replacing as we go. Slow, but it should work.. No?
// We give this a try next time -> NEXT: Iterate over string, replacing as we go (by block
// Bolding text is easy.. as simple as <b></b> tag around word that was replaced. 
//      BUT, how will we keep track of.. we can insert hyperlinks... or a button... with no border/background..
//      Could even display the word def from wordnik in popup on click...? CAN'T DO THIS! EVER! 
//      WE COULD, create hyperlinks or some sort of link with storage the script can read?! and track on click
//      and open in position.

// We replace by text block, processing them one at a time. For each text block, we iterate through, finding 
// every nth word, adding it to an array. We batch translate this array using our multi-word selection logic, 
// then we. Search for the original words in the text block, and swap them with the comma separated values in 
// the translated text. Then we take the entire block and swap it for the original. 

// Could we do this same process for the entire block at once (the concatenated textBlockS).. 
// This works great for getting the text to partially Italian state. BUT, we cannot actively change the 
// the text blocks level of translation (eg. cannot revert back to English).. unless we store the original
// word in the text. What could be interesting is generating a hyperlink that we use to retrieve the original word..
// (eg. th1s1sTh3W0rd.c0/myWord), and inserting this inline in the text.. then, onclick, we can parse the 
// hyperlink to get the word, send a request to the wordNik API and display the definition in the popup.. or 
// better yet, respond to the onclick event, on a word with a hyperlink and display an in-context popup with the 
// definition.. OR even better, replace the word with the english word?!

// The ideal experience for the user would be reverting the word to English for three seconds, and then returning back
// to the original Italian. This process all happens a result of the original click, and additional clicks are 
// blocked during this reversion period.



  // so this guy gets the range for the selected text on the page using the 
  // words node..

  // then gets "bounding client rect" (position of node on page). 
  // These steps help display popup in position on page, rel. to clicked node

  // He also adds a condition to ensure seleciton is not null
  // And then adds a render function.. by creating a div element (tooltip)..
  //    and we append it to the DOM... we create an icon as svg and import
  //    and finally, on mouse click, we render the toolTip..

  // Then we create a new method to get the range of selected text..
  //    and we pass it the render method.. using it to position tooltip.
  //    Want to position top + left corner and render from there, so we 
  //    get properties from selectedTextRange method. Note; dims in pixels.

  // Then we can set the stype props of the tooltip to be absolute and values
  //    to be the above determined values. Create board, set background, etc.

  // Then, add a WHOLE bunch of html in rendered tooltip.. I'd make it simple
  //    and not pretty. Its the functionality that is most important.

  // Then, we create a timeout method so that render object will remove from
  //    DOM after a period of time..? by wrapping in disappearing <div>

  // Then, create a server folder with an index.js file... then go to 
  //    server file in bash, run > yarn init -y. 
  //    Then > yarn add express. Should add package.json and yarn.lock
  //    and node_modules files_folders

  // Then we create an express server in index.js.. and...


  // LONG STORY SHORT, HE DID IT BY USING A 3RD PARTY FREE TRANSLATE API
  // ON GITHUB, THANKS TO MATHEUSS :) EASY PEASY NOW.
