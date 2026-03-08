const imageInput = document.getElementById('image-input');
const statusMsg = document.getElementById('status-message');
const resultCard = document.getElementById('result-card');

imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show Loading
    statusMsg.innerHTML = '<div class="loader"></div> Reading Label...';
    
    // Initialize OCR
    const worker = await Tesseract.createWorker('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    analyzeText(text);
});

function analyzeText(rawText) {
    // Clean the text: remove newlines and extra spaces
    const cleanText = rawText.toLowerCase().replace(/\s+/g, ' ');
    
    // DEBUG: This will show you exactly what the OCR read on your phone
    // alert("OCR Saw: " + cleanText.substring(0, 100) + "..."); 

    // Improved Regex: Looks for 'sugar' or 'saturates', ignores symbols, 
    // and grabs the first number it finds after the word.
    const sugarRegex = /(?:sugars?|of which sugars?)[^\d]*(\d+(?:[\.,]\d+)?)/;
    const fatRegex = /(?:saturates?|saturated fat)[^\d]*(\d+(?:[\.,]\d+)?)/;

    const sugarMatch = cleanText.match(sugarRegex);
    const fatMatch = cleanText.match(fatRegex);

    // Convert "1,6" to "1.6" if the OCR uses commas
    const sugar = sugarMatch ? parseFloat(sugarMatch[1].replace(',', '.')) : 0;
    const fat = fatMatch ? parseFloat(fatMatch[1].replace(',', '.')) : 0;

    // If we found 0 for everything, the OCR likely failed
    if (sugar === 0 && fat === 0) {
        statusMsg.innerHTML = "❌ Couldn't read clearly. Try a closer, flatter photo!";
        statusMsg.classList.remove('hidden');
    } else {
        displayResults(sugar, fat);
    }
}

function displayResults(sugar, fat) {
    statusMsg.classList.add('hidden');
    resultCard.classList.remove('hidden');

    const verdictText = document.getElementById('verdict-text');
    const verdictEmoji = document.getElementById('verdict-emoji');
    const summary = document.getElementById('summary-text');

    document.getElementById('val-sugar').innerText = sugar + "g";
    document.getElementById('val-fat').innerText = fat + "g";

    // --- YOUR CUSTOM LOGIC ENGINE ---
    if (sugar > 20 || fat > 5) {
        verdictText.innerText = "NOT GREAT";
        verdictText.style.color = "#e74c3c";
        verdictEmoji.innerText = "🚫";
        summary.innerText = "This product is high in sugar or saturated fat. High intake is linked to energy crashes.";
    } else if (sugar > 10 || fat > 2) {
        verdictText.innerText = "OKAYISH";
        verdictText.style.color = "#f1c40f";
        verdictEmoji.innerText = "⚠️";
        summary.innerText = "Moderate levels detected. Fine as an occasional snack, but watch your daily totals.";
    } else {
        verdictText.innerText = "GOOD CHOICE";
        verdictText.style.color = "#2ecc71";
        verdictEmoji.innerText = "✅";
        summary.innerText = "Low in sugar and saturated fat. This fits well within a balanced diet!";
    }
}