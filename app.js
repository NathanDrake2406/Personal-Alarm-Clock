// Sound file mappings
const SOUNDS = {
    radar: 'sounds/iPhone Radar AlarmRingtone Apple Sound - Sound Effect for Editin.mp3',
    dawn: 'sounds/Dawn Birds Deliberate V2 - The Calm by Stuart McFarlane.mp3',
    heavy: 'sounds/Alarm Clock For Heavy Sleepers Loud.mp3',
    danger: 'sounds/Danger Alarm Sound Effect.mp3',
    goggins: 'sounds/goggins-trimmed.mp3'
};

// Elements
const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');
const alarmTimeInput = document.getElementById('alarmTime');
const soundFileInput = document.getElementById('soundFile');
const fileLabel = document.getElementById('fileLabel');
const fileName = document.getElementById('fileName');
const customPreviewBtn = document.getElementById('customPreviewBtn');
const setAlarmBtn = document.getElementById('setAlarmBtn');
const buttonRow = document.getElementById('buttonRow');
const status = document.getElementById('status');
const statusText = document.getElementById('statusText');
const alarmCard = document.getElementById('alarmCard');
const alarmAudio = document.getElementById('alarmAudio');
const previewAudio = document.getElementById('previewAudio');

// State
let alarmSet = false;
let alarmTriggered = false;
let alarmTimeStr = null;
let selectedSound = 'radar';
let customAudioUrl = null;

// Format time
function formatTime(date) {
    return date.toLocaleTimeString('en-AU', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

function formatDate(date) {
    return date.toLocaleDateString('en-AU', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    currentTimeEl.textContent = formatTime(now);
    currentDateEl.textContent = formatDate(now);

    // Check alarm
    if (alarmSet && !alarmTriggered) {
        const currentTimeStr = formatTime(now);
        if (currentTimeStr === alarmTimeStr) {
            triggerAlarm();
        }
    }
}

// Stop preview
function stopPreview() {
    previewAudio.pause();
    previewAudio.currentTime = 0;
}

// Play preview sound
function playPreview(src) {
    stopPreview();
    previewAudio.src = src;
    previewAudio.currentTime = 0;
    previewAudio.play().catch(err => {
        console.error('Could not play preview:', err);
    });
}

// Sound option selection
document.querySelectorAll('.sound-option').forEach(option => {
    option.addEventListener('click', (e) => {
        if (e.target.classList.contains('preview-btn')) return;
        
        stopPreview();
        document.querySelectorAll('.sound-option').forEach(o => o.classList.remove('selected'));
        fileLabel.classList.remove('selected');
        option.classList.add('selected');
        option.querySelector('input').checked = true;
        selectedSound = option.dataset.sound;
    });
});

// Preview buttons for built-in sounds
document.querySelectorAll('.preview-btn[data-preview]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const soundKey = btn.dataset.preview;
        playPreview(SOUNDS[soundKey]);
    });
});

// Handle custom file selection
soundFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        stopPreview();
        fileName.textContent = file.name;
        fileLabel.classList.add('selected');
        customPreviewBtn.style.display = 'block';
        
        // Deselect built-in options
        document.querySelectorAll('.sound-option').forEach(o => {
            o.classList.remove('selected');
            o.querySelector('input').checked = false;
        });
        
        selectedSound = 'custom';
        
        // Create object URL for the audio
        if (customAudioUrl) {
            URL.revokeObjectURL(customAudioUrl);
        }
        customAudioUrl = URL.createObjectURL(file);
    }
});

// Custom file preview
customPreviewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (customAudioUrl) {
        playPreview(customAudioUrl);
    }
});

// Set alarm
function setAlarm() {
    stopPreview();
    alarmTimeStr = alarmTimeInput.value;
    alarmSet = true;
    alarmTriggered = false;

    // Update UI
    status.style.display = 'flex';
    status.className = 'status active';
    statusText.textContent = `Alarm set for ${alarmTimeStr}`;
    
    buttonRow.innerHTML = `
        <button class="btn btn-danger" id="cancelAlarmBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M15 9l-6 6"></path>
                <path d="M9 9l6 6"></path>
            </svg>
            Cancel Alarm
        </button>
    `;

    document.getElementById('cancelAlarmBtn').addEventListener('click', cancelAlarm);
    
    // Disable inputs
    alarmTimeInput.disabled = true;
    soundFileInput.disabled = true;
    document.querySelectorAll('.sound-option').forEach(o => o.style.pointerEvents = 'none');
    fileLabel.style.pointerEvents = 'none';
}

setAlarmBtn.addEventListener('click', setAlarm);

// Cancel alarm
function cancelAlarm() {
    alarmSet = false;
    alarmTriggered = false;
    alarmTimeStr = null;
    
    // Stop sounds
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    stopPreview();
    
    // Reset UI
    alarmCard.classList.remove('ringing');
    status.style.display = 'none';
    
    buttonRow.innerHTML = `
        <button class="btn btn-primary" id="setAlarmBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="13" r="8"></circle>
                <path d="M12 9v4l2 2"></path>
                <path d="M5 3L2 6"></path>
                <path d="M22 6l-3-3"></path>
            </svg>
            Set Alarm
        </button>
    `;

    document.getElementById('setAlarmBtn').addEventListener('click', setAlarm);
    
    // Re-enable inputs
    alarmTimeInput.disabled = false;
    soundFileInput.disabled = false;
    document.querySelectorAll('.sound-option').forEach(o => o.style.pointerEvents = 'auto');
    fileLabel.style.pointerEvents = 'auto';
}

// Trigger alarm
function triggerAlarm() {
    alarmTriggered = true;
    
    // Update UI
    alarmCard.classList.add('ringing');
    status.className = 'status ringing';
    statusText.textContent = 'WAKE UP!';
    
    buttonRow.innerHTML = `
        <button class="btn btn-danger" id="stopAlarmBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="6" width="12" height="12" rx="2"></rect>
            </svg>
            Stop Alarm
        </button>
    `;

    document.getElementById('stopAlarmBtn').addEventListener('click', cancelAlarm);
    
    // Play sound
    if (selectedSound === 'custom' && customAudioUrl) {
        alarmAudio.src = customAudioUrl;
    } else {
        alarmAudio.src = SOUNDS[selectedSound];
    }
    
    alarmAudio.currentTime = 0;
    alarmAudio.play().catch(err => {
        console.error('Could not play audio:', err);
        alert('Could not play alarm sound. Browser may have blocked autoplay.');
    });

    // Try notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Alarm!', { body: 'Time to wake up!' });
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize
updateCurrentTime();
setInterval(updateCurrentTime, 1000);

// Prevent sleep on mobile
let wakeLock = null;
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.log('Wake lock not supported or failed');
    }
}
requestWakeLock();
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        requestWakeLock();
    }
});
