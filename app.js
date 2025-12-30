/**
 * Year Progress PWA - Main Application
 * Expertly crafted for a beautiful, joyful experience.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gridContainer = document.getElementById('grid-container');
    const yearTitle = document.getElementById('year-title');
    const progressDisplay = document.getElementById('progress-display');
    const popupOverlay = document.getElementById('marker-popup-overlay');
    const popupDate = document.getElementById('popup-date');
    const colorOptionsContainer = document.getElementById('color-options');
    const emojiOptionsContainer = document.getElementById('emoji-options');
    const clearMarkerBtn = document.getElementById('clear-marker');
    const closePopupBtn = document.getElementById('close-popup');
    const addNoteBtn = document.getElementById('add-note');
    const noteDisplay = document.getElementById('note-display');

    const noteOverlay = document.getElementById('note-overlay');
    const noteDate = document.getElementById('note-date');
    const noteInput = document.getElementById('note-input');
    const saveNoteBtn = document.getElementById('save-note');
    const cancelNoteBtn = document.getElementById('cancel-note');

    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const settingsOverlay = document.getElementById('settings-overlay');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const importInput = document.getElementById('import-input');
    const themePicker = document.getElementById('theme-picker');

    const emojiSettingsList = document.getElementById('emoji-settings-list');
    const newEmojiInput = document.getElementById('new-emoji-input');
    const addEmojiBtn = document.getElementById('add-emoji-btn');

    const emptyStateMessage = document.getElementById('empty-state-message');
    const errorMessage = document.getElementById('error-message');

    // --- Constants ---
    const DEFAULT_EMOJIS = ['❤️', '😊', '⭐', '🎉', '😢', '🌟', '💪', '🌸', '☀️', '🌙'];
    const COLORS = ['#FFB7C5', '#98E4C9', '#C9B1FF', '#FFCCB3', '#FFF2C9', '#C5E8F7'];
    const THEMES = {
        'sakura': { name: 'Sakura', color: '#FFB7C5' },
        'mint-dream': { name: 'Mint Dream', color: '#98E4C9' },
        'lavender-haze': { name: 'Lavender Haze', color: '#C9B1FF' },
        'honey-morning': { name: 'Honey Morning', color: '#FFCCB3' }
    };

    // --- State ---
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear(currentYear) ? 366 : 365;
    const daysLeft = daysInYear - dayOfYear;

    let selectedDayIndex = null;
    let dayData = {}; // Format: { "1": { color: "#...", emoji: "...", note: "..." } }
    let currentTheme = 'sakura';
    let emojiList = [...DEFAULT_EMOJIS];

    // --- Initialization ---
    const init = () => {
        loadData();
        setupUI();
        renderGrid();
        renderThemes();
        renderEmojiOptions();
        renderEmojiSettings();
        updateProgress();
        updateEmptyState();
        setTheme(currentTheme);
    };

    // --- Data Management ---
    const loadData = () => {
        try {
            const saved = localStorage.getItem('yearProgressData');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.year === currentYear) {
                    dayData = parsed.days || {};
                    currentTheme = parsed.theme || 'sakura';
                    emojiList = parsed.emojis || [...DEFAULT_EMOJIS];
                }
            }
        } catch (e) {
            console.error("Load error", e);
            showUserMessage("Could not load your saved data.", false);
        }
    };

    const saveData = () => {
        try {
            const data = {
                year: currentYear,
                days: dayData,
                theme: currentTheme,
                emojis: emojiList,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('yearProgressData', JSON.stringify(data));
        } catch (e) {
            console.error("Save error", e);
            showUserMessage("Device storage might be full. Changes not saved.", false);
        }
    };

    // --- UI Rendering ---
    const setupUI = () => {
        yearTitle.textContent = currentYear;
        
        // Setup static color options
        colorOptionsContainer.innerHTML = '';
        COLORS.forEach(color => {
            const opt = document.createElement('div');
            opt.className = 'color-option';
            opt.style.backgroundColor = color;
            opt.dataset.color = color;
            colorOptionsContainer.appendChild(opt);
        });
    };

    const renderGrid = () => {
        gridContainer.innerHTML = '';
        
        // Day offset for start of year
        const offset = startOfYear.getDay();
        for (let i = 0; i < offset; i++) {
            gridContainer.appendChild(document.createElement('div'));
        }

        for (let i = 1; i <= daysInYear; i++) {
            const dot = document.createElement('div');
            dot.className = 'day-dot';
            dot.dataset.dayIndex = i;
            
            // Accessibility
            const date = new Date(currentYear, 0, i);
            dot.setAttribute('aria-label', date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
            
            gridContainer.appendChild(dot);
            updateDot(i);
        }
    };

    const updateDot = (dayIndex) => {
        const dot = gridContainer.querySelector(`[data-day-index='${dayIndex}']`);
        if (!dot) return;

        const data = dayData[dayIndex];
        const dayNum = parseInt(dayIndex);

        // Reset
        dot.className = 'day-dot';
        dot.style.background = ''; // Clear custom background
        dot.style.backgroundColor = '';
        dot.innerHTML = '';

        // Base Classes
        if (dayNum < dayOfYear) {
            dot.classList.add('past');
        } else if (dayNum === dayOfYear) {
            dot.classList.add('today', 'past');
        } else {
            dot.classList.add('future');
        }

        // Apply Customizations
        if (data) {
            dot.classList.add('marked');
            
            // If there's a custom color, use it (this overrides theme gradients)
            if (data.color) {
                dot.style.background = data.color;
                dot.style.backgroundColor = data.color;
            }

            if (data.emoji) {
                const span = document.createElement('span');
                span.className = 'emoji-container';
                span.textContent = data.emoji;
                dot.appendChild(span);
            }
            if (data.note) dot.classList.add('has-note');
        }
    };

    const renderThemes = () => {
        themePicker.innerHTML = '';
        for (const id in THEMES) {
            const opt = document.createElement('div');
            opt.className = 'theme-option';
            opt.dataset.theme = id;
            opt.style.backgroundColor = THEMES[id].color;
            opt.title = THEMES[id].name;
            themePicker.appendChild(opt);
        }
    };

    const renderEmojiOptions = () => {
        emojiOptionsContainer.innerHTML = '';
        emojiList.forEach(emoji => {
            const opt = document.createElement('div');
            opt.className = 'emoji-option';
            opt.textContent = emoji;
            opt.dataset.emoji = emoji;
            emojiOptionsContainer.appendChild(opt);
        });
    };

    const renderEmojiSettings = () => {
        emojiSettingsList.innerHTML = '';
        emojiList.forEach((emoji, idx) => {
            const item = document.createElement('div');
            item.className = 'emoji-setting-item';
            item.innerHTML = `<span>${emoji}</span><button class="remove-emoji-btn" data-index="${idx}">✕</button>`;
            emojiSettingsList.appendChild(item);
        });
    };

    const updateProgress = () => {
        const perc = ((dayOfYear / daysInYear) * 100).toFixed(1);
        progressDisplay.textContent = `${daysLeft} days left · ${perc}%`;
    };

    const updateEmptyState = () => {
        const hasMarks = Object.keys(dayData).length > 0;
        let msg = '';
        if (!hasMarks) {
            msg = (dayOfYear < 10) ? "A fresh year awaits! ✨" : "Tap any day to mark a memory or mood.";
        } else if (daysLeft < 10) {
            msg = "What a journey! Don't forget to backup your memories. 🎉";
        }
        
        if (msg) {
            emptyStateMessage.textContent = msg;
            emptyStateMessage.classList.remove('hidden');
        } else {
            emptyStateMessage.classList.add('hidden');
        }
    };

    // --- Actions ---
    const setTheme = (name) => {
        if (!THEMES[name]) return;
        currentTheme = name;
        document.body.dataset.theme = name;
        
        // Update browser theme color
        const bg = getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
        document.querySelector('meta[name="theme-color"]').setAttribute('content', bg);
        
        // Update selection UI
        document.querySelectorAll('.theme-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.theme === name);
        });
        saveData();
    };

    const showUserMessage = (text, isSuccess) => {
        errorMessage.textContent = text;
        errorMessage.className = isSuccess ? 'success' : '';
        errorMessage.classList.remove('hidden');
        setTimeout(() => errorMessage.classList.add('hidden'), 5000);
    };

    const refreshPopupSelections = () => {
        if (!selectedDayIndex) return;
        const data = dayData[selectedDayIndex] || {};
        document.querySelectorAll('.color-option, .emoji-option').forEach(el => el.classList.remove('selected'));
        if (data.color) {
            const el = colorOptionsContainer.querySelector(`[data-color='${data.color}']`);
            if (el) el.classList.add('selected');
        }
        if (data.emoji) {
            const el = emojiOptionsContainer.querySelector(`[data-emoji='${data.emoji}']`);
            if (el) el.classList.add('selected');
        }
    };

    const openPopup = (dayIndex) => {
        selectedDayIndex = dayIndex;
        const data = dayData[dayIndex] || {};
        const date = new Date(currentYear, 0, dayIndex);
        
        popupDate.textContent = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        
        // Note preview
        if (data.note) {
            noteDisplay.textContent = data.note;
            noteDisplay.classList.remove('hidden');
            addNoteBtn.textContent = 'Edit Note';
        } else {
            noteDisplay.classList.add('hidden');
            addNoteBtn.textContent = 'Add Note';
        }

        refreshPopupSelections();

        popupOverlay.classList.remove('hidden');
    };

    const closeAllOverlays = () => {
        popupOverlay.classList.add('hidden');
        noteOverlay.classList.add('hidden');
        settingsOverlay.classList.add('hidden');
        selectedDayIndex = null;
    };

    // --- Event Listeners ---
    
    // Grid
    gridContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.day-dot');
        if (dot) {
            dot.style.transform = 'scale(1.2)';
            setTimeout(() => dot.style.transform = 'scale(1)', 150);
            openPopup(dot.dataset.dayIndex);
        }
    });

    // Popups
    closePopupBtn.addEventListener('click', closeAllOverlays);
    popupOverlay.addEventListener('click', (e) => { if (e.target === popupOverlay) closeAllOverlays(); });

    colorOptionsContainer.addEventListener('click', (e) => {
        const opt = e.target.closest('.color-option');
        if (!opt || !selectedDayIndex) return;

        const color = opt.dataset.color;
        if (!dayData[selectedDayIndex]) dayData[selectedDayIndex] = {};

        if (dayData[selectedDayIndex].color === color) {
            delete dayData[selectedDayIndex].color;
        } else {
            dayData[selectedDayIndex].color = color;
            dayData[selectedDayIndex].emoji = null; // Colors clear emoji
        }

        if (Object.keys(dayData[selectedDayIndex]).length === 0) delete dayData[selectedDayIndex];
        
        updateDot(selectedDayIndex);
        saveData();
        updateEmptyState();
        refreshPopupSelections(); // Updated: Refresh highlights instead of closing
    });

    emojiOptionsContainer.addEventListener('click', (e) => {
        const opt = e.target.closest('.emoji-option');
        if (!opt || !selectedDayIndex) return;

        const emoji = opt.dataset.emoji;
        if (!dayData[selectedDayIndex]) dayData[selectedDayIndex] = {};

        if (dayData[selectedDayIndex].emoji === emoji) {
            delete dayData[selectedDayIndex].emoji;
        } else {
            dayData[selectedDayIndex].emoji = emoji;
        }

        if (Object.keys(dayData[selectedDayIndex]).length === 0) delete dayData[selectedDayIndex];

        updateDot(selectedDayIndex);
        saveData();
        updateEmptyState();
        refreshPopupSelections(); // Updated: Refresh highlights instead of closing
    });

    clearMarkerBtn.addEventListener('click', () => {
        if (selectedDayIndex) {
            delete dayData[selectedDayIndex];
            updateDot(selectedDayIndex);
            saveData();
            updateEmptyState();
            refreshPopupSelections();
        }
    });

    // Notes
    addNoteBtn.addEventListener('click', () => {
        const data = dayData[selectedDayIndex] || {};
        noteInput.value = data.note || '';
        const date = new Date(currentYear, 0, selectedDayIndex);
        noteDate.textContent = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        noteOverlay.classList.remove('hidden');
        popupOverlay.classList.add('hidden');
    });

    cancelNoteBtn.addEventListener('click', closeAllOverlays);
    noteOverlay.addEventListener('click', (e) => { if (e.target === noteOverlay) closeAllOverlays(); });
    
    saveNoteBtn.addEventListener('click', () => {
        const txt = noteInput.value.trim();
        if (!dayData[selectedDayIndex]) dayData[selectedDayIndex] = {};
        
        if (txt) {
            dayData[selectedDayIndex].note = txt;
        } else {
            delete dayData[selectedDayIndex].note;
        }

        if (Object.keys(dayData[selectedDayIndex]).length === 0) delete dayData[selectedDayIndex];
        
        updateDot(selectedDayIndex);
        saveData();
        closeAllOverlays();
    });

    // Settings
    settingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.remove('hidden');
    });
    closeSettingsBtn.addEventListener('click', closeAllOverlays);
    settingsOverlay.addEventListener('click', (e) => { if (e.target === settingsOverlay) closeAllOverlays(); });

    themePicker.addEventListener('click', (e) => {
        const opt = e.target.closest('.theme-option');
        if (opt) setTheme(opt.dataset.theme);
    });

    addEmojiBtn.addEventListener('click', () => {
        const val = newEmojiInput.value.trim();
        if (val && !emojiList.includes(val)) {
            emojiList.push(val);
            saveData();
            renderEmojiOptions();
            renderEmojiSettings();
            newEmojiInput.value = '';
        }
    });

    emojiSettingsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-emoji-btn');
        if (btn) {
            emojiList.splice(parseInt(btn.dataset.index), 1);
            saveData();
            renderEmojiOptions();
            renderEmojiSettings();
        }
    });

    // Backup / Restore
    exportBtn.addEventListener('click', () => {
        const data = JSON.stringify(JSON.parse(localStorage.getItem('yearProgressData')), null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `year-progress-backup-${currentYear}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        closeAllOverlays();
    });

    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target.result);
                if (confirm('Overwrite current data?')) {
                    if (imported.year === currentYear) {
                        dayData = imported.days || {};
                        emojiList = imported.emojis || [...DEFAULT_EMOJIS];
                        if (imported.theme) setTheme(imported.theme);
                        
                        saveData();
                        renderGrid();
                        renderEmojiOptions();
                        renderEmojiSettings();
                        updateEmptyState();
                        closeAllOverlays();
                        showUserMessage('Restored!', true);
                    } else {
                        showUserMessage('Wrong year in backup.', false);
                    }
                }
            } catch (err) {
                showUserMessage('Backup corrupted.', false);
            }
            importInput.value = '';
        };
        reader.readAsText(file);
    });

    // Run!
    init();
});
