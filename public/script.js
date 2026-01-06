document.addEventListener('DOMContentLoaded', () => {
    // === Elements Selection ===
    const fileInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const dropArea = document.getElementById('dropArea');
    const iconBox = document.querySelector('.icon-box');
    const fileMsg = document.querySelector('.file-msg');
    const generateBtn = document.getElementById('generateBtn');
    
    const languageSelect = document.getElementById('language');
    const modelSelect = document.getElementById('model');
    
    const resultSection = document.getElementById('resultSection');
    const loading = document.getElementById('loading');
    const outputContainer = document.getElementById('outputContainer');
    const promptResult = document.getElementById('promptResult');
    const copyBtn = document.getElementById('copyBtn');

    // Sidebar/Menu Elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebarMenu = document.getElementById('sidebarMenu');
    let isMenuOpen = false;

    // === UI Interactions ===

    // 1. Sidebar Toggle (Titik 3)
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        if(isMenuOpen) {
            sidebarMenu.classList.add('active');
        } else {
            sidebarMenu.classList.remove('active');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !sidebarMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebarMenu.classList.remove('active');
            isMenuOpen = false;
        }
    });

    // 2. File Handling
    fileInput.addEventListener('change', handleFile);

    function handleFile(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                // Hide default upload UI
                iconBox.style.display = 'none';
                fileMsg.style.display = 'none';
                // Enable Button
                generateBtn.disabled = false;
                // Add active border style
                dropArea.style.borderColor = 'var(--primary)';
            }
            reader.readAsDataURL(file);
        }
    }

    // 3. Generate Logic
    generateBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        // UI Updates: Loading state
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<div class="loader" style="width:20px;height:20px;border-width:2px;margin:0;"></div> Processing...';
        
        resultSection.style.display = 'block';
        loading.style.display = 'block';
        outputContainer.style.display = 'none';
        
        // Scroll to result smoothly
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        try {
            const base64 = await toBase64(file);

            const response = await fetch('/api/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: base64,
                    language: languageSelect.value,
                    model: modelSelect.value
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Gagal memproses gambar');

            // Success
            promptResult.value = data.prompt;
            loading.style.display = 'none';
            outputContainer.style.display = 'block';

        } catch (error) {
            alert('SANN404 Error: ' + error.message);
            loading.style.display = 'none';
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span class="btn-text">Generate Prompt</span><span class="btn-icon"><i class="ri-sparkling-fill"></i></span>';
        }
    });

    // Helper: Base64
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // 4. Copy Feature
    copyBtn.addEventListener('click', () => {
        promptResult.select();
        document.execCommand('copy'); // Fallback support
        
        // Modern approach
        if (navigator.clipboard) {
            navigator.clipboard.writeText(promptResult.value);
        }

        // Change Text temporarily
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="ri-check-line"></i> Tersalin!';
        copyBtn.style.background = '#dcfce7';
        copyBtn.style.color = '#166534';
        copyBtn.style.borderColor = '#dcfce7';

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
            copyBtn.style.borderColor = '';
        }, 2000);
    });
});
