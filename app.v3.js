document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const yearTitle = document.getElementById('year-title');
    const progressDisplay = document.getElementById('progress-display');
    const popupOverlay = document.getElementById('marker-popup-overlay');
    const popup = document.getElementById('marker-popup');
    const popupDate = document.getElementById('popup-date');
    const colorOptionsContainer = document.getElementById('color-options');
    const emojiOptionsContainer = document.getElementById('emoji-options');
    const clearMarkerBtn = document.getElementById('clear-marker');
    const closePopupBtn = document.getElementById('close-popup');
    const addNoteBtn = document.getElementById('add-note');

    const noteOverlay = document.getElementById('note-overlay');
    const noteEditor = document.getElementById('note-editor');
    const noteDate = document.getElementById('note-date');
    const noteInput = document.getElementById('note-input');
    const saveNoteBtn = document.getElementById('save-note');
    const cancelNoteBtn = document.getElementById('cancel-note');
    const noteDisplay = document.getElementById('note-display');

    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const settingsOverlay = document.getElementById('settings-overlay');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const importInput = document.getElementById('import-input');
    const themePicker = document.getElementById('theme-picker');

    const progressDisplay = document.getElementById('progress-display');
    const emptyStateMessage = document.getElementById('empty-state-message');
    const errorMessage = document.getElementById('error-message');

    let selectedDayIndex = null;
    let dayData = {}; // { "1": { color: "#...", emoji: "..." } }
    let currentTheme = 'sakura';

    const showMessage = (message, isSuccess = false) => {
        const messageEl = document.getElementById('error-message'); // Explicitly get the element here to be safe
        messageEl.textContent = message;
        messageEl.classList.toggle('success', isSuccess);
        messageEl.classList.remove('hidden');
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000); // Hide after 5 seconds
    };
    
    const themes = {
        'sakura': { name: 'Sakura', color: '#FFB7C5' },
        'mint-dream': { name: 'Mint Dream', color: '#98E4C9' },
        'lavender-haze': { name: 'Lavender Haze', color: '#C9B1FF' },
        'honey-morning': { name: 'Honey Morning', color: '#FFCCB3' }
    };

    const saveData = () => {
        const dataToSave = {
            year: currentYear,
            days: dayData,
            theme: currentTheme,
            lastUpdated: new Date().toISOString()
        };
        try {
            localStorage.setItem('yearProgressData', JSON.stringify(dataToSave));
        } catch (e) {
            console.error("Failed to save data to localStorage", e);
            showMessage("Could not save your changes. Your device storage might be full.");
        }
    };

    const loadData = () => {
        try {
            const savedData = localStorage.getItem('yearProgressData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Basic validation
                if (parsedData.year === currentYear && parsedData.days) {
                    dayData = parsedData.days;
                    if (parsedData.theme && themes[parsedData.theme]) {
                        currentTheme = parsedData.theme;
                    }
                } else {
                    // Data is for a different year, or malformed. Start fresh.
                    console.log("Saved data is for a different year or malformed. Starting fresh.");
                }
            }
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
            showMessage("Could not load your saved data. It might be corrupted.");
        }
    };

    const setTheme = (themeName) => {
        if (!themes[themeName]) return;
        currentTheme = themeName;
        document.body.dataset.theme = themeName;
        
        // Update the theme-color meta tag
        const themeColor = getComputedStyle(document.body).getPropertyValue('--bg-color');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor.trim());

        // Update selected state in picker
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.theme === themeName);
        });

        saveData();
    };


    const colors = ['#FFB7C5', '#98E4C9', '#C9B1FF', '#FFCCB3', '#FFF2C9', '#C5E8F7'];
    const emojis = ['❤️', '😊', '⭐', '🎉', '😢', '🌟', '💪', '🌸', '☀️', '🌙'];

    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear(currentYear) ? 366 : 365;
    
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

    // Set header and footer
    yearTitle.textContent = currentYear;
    const daysLeft = daysInYear - dayOfYear;
    const percentageComplete = ((dayOfYear / daysInYear) * 100).toFixed(1);
    progressDisplay.textContent = `${daysLeft} days left · ${percentageComplete}%`;

    // Offset for the first day of the year
    const firstDayOfWeek = startOfYear.getDay(); // 0 = Sunday, 1 = Monday, ...
    for (let i = 0; i < firstDayOfWeek; i++) {
        const offsetter = document.createElement('div');
        gridContainer.appendChild(offsetter);
    }

    // --- Functions ---
    loadData();
    setTheme(currentTheme); // Set initial theme after loading data

    // Populate Theme Picker
    for (const themeId in themes) {
        const theme = themes[themeId];
        const option = document.createElement('div');
        option.classList.add('theme-option');
        option.dataset.theme = themeId;
        option.style.backgroundColor = theme.color;
        option.title = theme.name;
        themePicker.appendChild(option);
    }
    
    // Set selected state for initial theme
    const initialThemeOption = themePicker.querySelector(`[data-theme='${currentTheme}']`);
    if(initialThemeOption) initialThemeOption.classList.add('selected');


    const redrawAllDots = () => {
        for (let i = 1; i <= daysInYear; i++) {
            redrawDot(i);
        }
    };

    const redrawDot = (dayIndex) => {
        const dot = gridContainer.querySelector(`[data-day-index='${dayIndex}']`);
        if (!dot) return;

        const data = dayData[dayIndex];
        const dayIndexNum = parseInt(dayIndex, 10);
        
        // Reset classes and styles
        dot.style.backgroundColor = '';
        dot.innerHTML = '';
        dot.classList.remove('past', 'future', 'today', 'marked', 'has-note');

        // Add base classes
        if (dayIndexNum < dayOfYear) {
            dot.classList.add('past');
        } else if (dayIndexNum === dayOfYear) {
            dot.classList.add('today', 'past');
        } else {
            dot.classList.add('future');
        }

        if (data) {
            dot.classList.add('marked');
            if (data.color) {
                dot.style.backgroundColor = data.color;
            }
            if (data.emoji) {
                const emojiSpan = document.createElement('span');
                emojiSpan.textContent = data.emoji;
                dot.appendChild(emojiSpan);
            }
            if (data.note) {
                dot.classList.add('has-note');
            }
        }
    };
    
    const updateEmptyStateMessage = () => {
        const hasMarks = Object.keys(dayData).length > 0;
        let message = '';

        if (!hasMarks) {
            if (dayOfYear < 10) {
                message = "A fresh year awaits! Tap any day to begin your journey.";
            } else {
                message = "Tap any day to mark a memory or a mood.";
            }
        } else {
            if (daysLeft < 10) {
                message = "What a year it's been! Don't forget to create a backup.";
            }
        }

        if (message) {
            emptyStateMessage.textContent = message;
            emptyStateMessage.classList.remove('hidden');
        } else {
            emptyStateMessage.classList.add('hidden');
        }
    };
    
    // Initial render
    for (let i = 1; i <= daysInYear; i++) {
        const dot = document.createElement('div');
        dot.classList.add('day-dot');
        dot.dataset.dayIndex = i;
        gridContainer.appendChild(dot);
    }
    redrawAllDots();
    updateEmptyStateMessage();


    // Populate options
    colors.forEach(color => {
        const option = document.createElement('div');
        option.classList.add('color-option');
        option.style.backgroundColor = color;
        option.dataset.color = color;
        colorOptionsContainer.appendChild(option);
    });

    emojis.forEach(emoji => {
        const option = document.createElement('div');
        option.classList.add('emoji-option');
        option.textContent = emoji;
        option.dataset.emoji = emoji;
        emojiOptionsContainer.appendChild(option);
    });

    const hidePopup = () => popupOverlay.classList.add('hidden');
    const hideNoteEditor = () => noteOverlay.classList.add('hidden');
    const endInteraction = () => {
        selectedDayIndex = null;
    }

    const showPopup = (dayIndex) => {
        selectedDayIndex = dayIndex;
        const data = dayData[dayIndex] || {};
        
        // Date
        const date = new Date(currentYear, 0, dayIndex);
        popupDate.textContent = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

        // Note
        if (data.note) {
            noteDisplay.textContent = data.note;
            noteDisplay.classList.remove('hidden');
            addNoteBtn.textContent = 'Edit Note';
        } else {
            noteDisplay.classList.add('hidden');
            addNoteBtn.textContent = 'Add Note';
        }
        
        // Highlight selected options
        document.querySelectorAll('.color-option, .emoji-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        if (data.color) {
            const colorOption = colorOptionsContainer.querySelector(`[data-color='${data.color}']`);
            if (colorOption) colorOption.classList.add('selected');
        }
        if (data.emoji) {
            const emojiOption = emojiOptionsContainer.querySelector(`[data-emoji='${data.emoji}']`);
            if (emojiOption) emojiOption.classList.add('selected');
        }

        popupOverlay.classList.remove('hidden');
    };

    const showNoteEditor = () => {
        const data = dayData[selectedDayIndex] || {};
        noteInput.value = data.note || '';
        const date = new Date(currentYear, 0, selectedDayIndex);
        noteDate.textContent = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        noteOverlay.classList.remove('hidden');
        hidePopup(); // Just hides the UI, doesn't end interaction
    };


    // --- Event Listeners ---
    gridContainer.addEventListener('click', (event) => {
        const dot = event.target.closest('.day-dot');
        if (dot) {
            // Add a simple bounce effect for feedback
            dot.style.transform = 'scale(1.2)';
            setTimeout(() => {
                dot.style.transform = 'scale(1)';
            }, 150);

            const dayIndex = dot.dataset.dayIndex;
            showPopup(dayIndex);
        }
    });

    closePopupBtn.addEventListener('click', () => {
        hidePopup();
        endInteraction();
    });
    popupOverlay.addEventListener('click', (event) => {
        if (event.target === popupOverlay) {
            hidePopup();
            endInteraction();
        }
    });

    colorOptionsContainer.addEventListener('click', (event) => {
        const colorOption = event.target.closest('.color-option');
        if (colorOption) {
            const color = colorOption.dataset.color;
            if (!dayData[selectedDayIndex]) dayData[selectedDayIndex] = {};
            dayData[selectedDayIndex].color = color;
            dayData[selectedDayIndex].emoji = null; // Setting color removes emoji
            redrawDot(selectedDayIndex);
            saveData();
            updateEmptyStateMessage();
            hidePopup();
            endInteraction();
        }
    });

    emojiOptionsContainer.addEventListener('click', (event) => {
        const emojiOption = event.target.closest('.emoji-option');
        if (emojiOption) {
            const emoji = emojiOption.dataset.emoji;
            if (!dayData[selectedDayIndex]) dayData[selectedDayIndex] = {};
            dayData[selectedDayIndex].emoji = emoji;
            // If no color is set, let's give it the default filled color
            if (!dayData[selectedDayIndex].color) {
                 const rootStyle = getComputedStyle(document.documentElement);
                 dayData[selectedDayIndex].color = rootStyle.getPropertyValue('--dot-filled').trim();
            }
            redrawDot(selectedDayIndex);
            saveData();
            updateEmptyStateMessage();
            hidePopup();
            endInteraction();
        }
    });

    clearMarkerBtn.addEventListener('click', () => {
        delete dayData[selectedDayIndex];
        redrawDot(selectedDayIndex);
        saveData();
        updateEmptyStateMessage();
        hidePopup();
        endInteraction();
    });

    addNoteBtn.addEventListener('click', showNoteEditor);

    cancelNoteBtn.addEventListener('click', () => {
        hideNoteEditor();
        endInteraction();
    });

    saveNoteBtn.addEventListener('click', () => {
        const noteText = noteInput.value.trim();
        if (!dayData[selectedDayIndex]) {
            dayData[selectedDayIndex] = {};
        }
        dayData[selectedDayIndex].note = noteText;

        // If note is empty, remove it from data
        if (noteText === '') {
            delete dayData[selectedDayIndex].note;
        }

        redrawDot(selectedDayIndex);
        saveData();
        hideNoteEditor();
        endInteraction();
    });

    // --- Settings ---
    const showSettings = () => {
        settingsMenu.classList.remove('hidden');
        settingsOverlay.classList.remove('hidden');
    };

    const hideSettings = () => {
        settingsMenu.classList.add('hidden');
        settingsOverlay.classList.add('hidden');
    };

    const exportData = () => {
        const dataString = JSON.stringify(JSON.parse(localStorage.getItem('yearProgressData')), null, 2);
        const blob = new Blob([dataString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `year-progress-backup-${currentYear}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        hideSettings();
    };

    settingsBtn.addEventListener('click', showSettings);
    closeSettingsBtn.addEventListener('click', hideSettings);
    settingsOverlay.addEventListener('click', hideSettings);
    exportBtn.addEventListener('click', exportData);

    const importData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (confirm('This will overwrite all current data. Are you sure?')) {
                    if (importedData.year === currentYear && importedData.days) {
                        dayData = importedData.days;
                        if (importedData.theme && themes[importedData.theme]) {
                            setTheme(importedData.theme);
                        }
                        saveData();
                        redrawAllDots();
                        updateEmptyStateMessage();
                        hideSettings();
                        showMessage('Data restored successfully!', true);
                    } else {
                        showMessage('Invalid backup file or data is for a different year.');
                    }
                }
            } catch (err) {
                showMessage('Could not read the backup file. It may be corrupted.');
                console.error("Failed to parse imported file", err);
            } finally {
                // Reset the input so the same file can be selected again
                importInput.value = '';
            }
        };
        reader.readAsText(file);
    };

    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', importData);

    themePicker.addEventListener('click', (event) => {
        const themeOption = event.target.closest('.theme-option');
        if (themeOption) {
            const themeName = themeOption.dataset.theme;
            setTheme(themeName);
        }
    });
});
