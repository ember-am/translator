console.log("Running background script..")


chrome.runtime.onMessage.addListener(receiver);

window.word = "";

function receiver(request, sender, sendResponse) {
  console.log(request);
  word = request.text;

  // translate word here and send back to 

};