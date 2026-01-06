document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const fileMsg = document.querySelector('.file-msg');
    const generateBtn = document.getElementById('generateBtn');
    
    const languageSelect = document.getElementById('language');
    const modelSelect = document.getElementById('model');
    
    const resultSection = document.getElementById('resultSection');
    const loading = document.getElementById('loading');
    const outputContainer = document.getElementById('outputContainer');
    const promptResult = document.getElementById('promptResult');
    const copyBtn = document.getElementById('copyBtn');

    let currentFile = null;

    // Handle File Selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            currentFile = file;
            const reader = new FileReader();
            
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                fileMsg.style.display = 'none';
                generateBtn.disabled = false;
            }
            
            reader.readAsDataURL(file);
        }
    });

    // Handle Generate Button
    generateBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        // UI Updates
        generateBtn.disabled = true;
        resultSection.style.display = 'block';
        loading.style.display = 'block';
        outputContainer.style.display = 'none';

        try {
            // Convert file to Base64
            const base64 = await toBase64(currentFile);

            // Call Backend API
            const response = await fetch('/api/index', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageBase64: base64,
                    language: languageSelect.value,
                    model: modelSelect.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal memproses gambar');
            }

            // Show Result
            promptResult.value = data.prompt;
            outputContainer.style.display = 'block';

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            loading.style.display = 'none';
            generateBtn.disabled = false;
        }
    });

    // Helper: File to Base64
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        promptResult.select();
        document.execCommand('copy');
        copyBtn.innerText = 'Tersalin!';
        setTimeout(() => copyBtn.innerText = 'Salin Teks', 2000);
    });
});
