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
    const text = rawText.toLowerCase();
    console.log("Scanned Text:", text); // Debugging

    // Logic: Look for the number immediately after the keyword
    const sugarMatch = text.match(/sugars?\s*(\d+(\.\d+)?)/);
    const fatMatch = text.match(/saturates?\s*(\d+(\.\d+)?)/);

    const sugar = sugarMatch ? parseFloat(sugarMatch[1]) : 0;
    const fat = fatMatch ? parseFloat(fatMatch[1]) : 0;

    displayResults(sugar, fat);
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