
function injectedScript(button) {
    console.log("Button HTML: ", button);
    console.log("Button innerText: ", button.innerText);

    // Swap the hidden with the visible text..
    let originalContent = button.innerText;
    let tempContent = button.getAttribute('pre-translate');
    console.log("originalContent", originalContent)
    console.log("tempContent ", tempContent);

    let swapper = false
    swapAndSwapBack()

    function swapAndSwapBack() {
        if (swapper == false) { swapper = true}
        else if (swapper == true) { swapper = false}
        
        if (swapper) {
            button.innerText = tempContent
            button.style = "border:none;background:#84FF79;border-radius:4px;"
            console.log("waiting for timeout...")
            setTimeout(swapAndSwapBack, 2000);
        } else {
            button.innerText = originalContent
            button.style = "border:none;background:#95EDFF;border-radius:4px;"
            console.log("resetting text for button...")
        }
    }
    
    // This works! Now we can parse the inner HTML
}
