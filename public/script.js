const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const generateBtn = document.getElementById('generateBtn');
const resultArea = document.getElementById('resultArea');
const promptOutput = document.getElementById('promptOutput');
const copyBtn = document.getElementById('copyBtn');

let currentFileBase64 = null;

// Handle klik area upload
dropZone.addEventListener('click', () => fileInput.click());

// Handle file input change
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Convert file ke Base64 untuk dikirim ke API
function processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        currentFileBase64 = e.target.result; // Format: data:image/jpeg;base64,...
        preview.src = currentFileBase64;
        preview.classList.add('active');
        dropZone.classList.add('has-image');
        generateBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// Handle Generate Button
generateBtn.addEventListener('click', async () => {
    if (!currentFileBase64) return;

    // UI Loading state
    const originalText = generateBtn.innerText;
    generateBtn.innerText = 'Memproses...';
    generateBtn.disabled = true;
    resultArea.classList.add('hidden');

    const language = document.getElementById('language').value;
    const model = document.getElementById('model').value;

    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageBase64: currentFileBase64,
                language: language,
                model: model
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan');

        promptOutput.value = data.prompt;
        resultArea.classList.remove('hidden');

    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        generateBtn.innerText = originalText;
        generateBtn.disabled = false;
    }
});

// Copy to clipboard
copyBtn.addEventListener('click', () => {
    promptOutput.select();
    document.execCommand('copy'); // Fallback support
    navigator.clipboard.writeText(promptOutput.value).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Tersalin!';
        setTimeout(() => copyBtn.innerText = originalText, 2000);
    });
});
