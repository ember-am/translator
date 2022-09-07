Copyright 2022 Attila

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
   OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


Welcome and thanks for downloading 'translator', an omnious name at best. 

A few things to note. I built this to help myself learn Italian (from English, 
as you may have guessed). If you'd like to modify that, feel free to set a 
"known language" and "learning language" in the content script. Remember, to use
the API, you must provide the 'iso' codes for the languages. Google is helpful.

At the top of the content script, you will also see a place to enter a 'difficulty
factor'. This is effectively a number that describes the ratio of learning : known
words you would like to see on any given page.. roughly working out to be
one : difficulty factor. 

Lastly, since this uses an emulated version of the Google Translate API, you will need
to set up and run a local server while using the translator. API is courtesy of Matheus
Fernandes forked by Vitaliy Potapov (github.com/vitalets/google-translate-api). Extension 
is currently setup to run an express server, launched from the project's server file in
terminal using '$ yarn dev'. Yes that is on a Mac. No I don't know what it is on
Windows/Linux.

PS. Please know, the translation is currently pretty slow.. words are being translated 
using the API one-at-a-time. Yes, there is probably a way to do batch translate. Yes 
there are some forks that implement batch translation but I did not find them reliable.
If you'd like to greatly optimize the app for yourself, please feel MORE THAN free to 
add batch translation. Just ask that you kindly share it with the rest of us :)

That's all. Enjoy the app, and happy language learning. -A
