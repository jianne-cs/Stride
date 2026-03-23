// ===== GLOBAL STATE =====
const appState = {
    user: {
        name: 'Marco',
        stressLevel: 3,
        energy: 82,
        monsters: [],
        squad: ['Alex', 'Jordan', 'Taylor']
    },
    currentBattle: null
};

function startBattle(monsterId) {
    console.log("Battle button clicked! Monster ID:", monsterId);
    window.location.href = `battle.html?monster=${monsterId}`;
}

// ===== INITIALIZATION =====
function initializeApp() {
    loadMonsters();
    initStressIndicator();
    loadUserData();
}

function loadUserData() {
    // Load user name
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        appState.user.name = savedName;
    }
    
    // Load stress level
    const savedStress = localStorage.getItem('stressLevel');
    if (savedStress) {
        appState.user.stressLevel = parseInt(savedStress);
    }
    
    // Load energy
    const savedEnergy = localStorage.getItem('userEnergy');
    if (savedEnergy) {
        appState.user.energy = parseInt(savedEnergy);
    }
}

// ===== MONSTER MANAGEMENT =====
function loadMonsters() {
    const saved = localStorage.getItem('monsters');
    if (saved) {
        appState.user.monsters = JSON.parse(saved);
    } else {
        // Initialize with sample monsters
        initializeSampleMonsters();
    }
    return appState.user.monsters;
}

function initializeSampleMonsters() {
    const sampleMonsters = [
        {
            id: 1,
            name: 'Thesis Panic Monster',
            shape: 'horned',
            eyeStyle: 'wide',
            pupilSize: 'dilated',
            features: ['teeth', 'eyes', 'fog'],
            color: '#ef4444',
            triggers: ['opening laptop', 'deadlines', 'sunday evenings'],
            hp: 78,
            maxHp: 100,
            type: 'anxiety'
        },
        {
            id: 2,
            name: 'Social Anxiety Specter',
            shape: 'blob',
            eyeStyle: 'sad',
            pupilSize: 'pinpoint',
            features: ['eyes', 'shadowForm'],
            color: '#8b5cf6',
            triggers: ['social media', 'crowds', 'phone calls'],
            hp: 65,
            maxHp: 100,
            type: 'anxiety'
        },
        {
            id: 3,
            name: 'Procrastination Demon',
            shape: 'spiky',
            eyeStyle: 'angry',
            pupilSize: 'cat',
            features: ['chains', 'claws'],
            color: '#f59e0b',
            triggers: ['deadlines', 'monday mornings'],
            hp: 92,
            maxHp: 100,
            type: 'motivation'
        },
        {
            id: 4,
            name: 'Imposter Syndrome',
            shape: 'star',
            eyeStyle: 'slanted',
            pupilSize: 'dilated',
            features: ['eyes', 'fog'],
            color: '#10b981',
            triggers: ['work meetings', 'public speaking'],
            hp: 82,
            maxHp: 100,
            type: 'anxiety'
        }
    ];
    localStorage.setItem('monsters', JSON.stringify(sampleMonsters));
    appState.user.monsters = sampleMonsters;
}

function saveMonster(monster) {
    const monsters = appState.user.monsters;
    const existing = monsters.findIndex(m => m.id === monster.id);
    
    if (existing >= 0) {
        monsters[existing] = monster;
    } else {
        monster.id = Date.now();
        monsters.push(monster);
    }
    
    localStorage.setItem('monsters', JSON.stringify(monsters));
}

function deleteMonster(monsterId) {
    appState.user.monsters = appState.user.monsters.filter(m => m.id != monsterId);
    localStorage.setItem('monsters', JSON.stringify(appState.user.monsters));
}

function getMonsterById(monsterId) {
    return appState.user.monsters.find(m => m.id == monsterId);
}

// ===== STRESS INDICATOR =====
function updateStressIndicator(level) {
    const dots = document.querySelectorAll('.dot');
    if (!dots.length) return;
    
    const stressLevel = level !== undefined ? level : appState.user.stressLevel;
    
    dots.forEach((dot, index) => {
        if (index < stressLevel) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
    
    appState.user.stressLevel = stressLevel;
    localStorage.setItem('stressLevel', stressLevel);
}

function initStressIndicator() {
    const savedLevel = localStorage.getItem('stressLevel');
    if (savedLevel) {
        appState.user.stressLevel = parseInt(savedLevel);
    }
    updateStressIndicator();
}

// ===== QUICK ACTIONS =====
function openQuickAction(action) {
    const actionUrls = {
        'breathing': 'quickbreathing.html',
        'mood': 'quickmoodcheck.html',
        'grounding': 'quickgrounding.html',
        'journal': 'quickjournal.html',
        'distract': 'distract.html',
        'calm': 'calmdown.html'
    };
    
    if (actionUrls[action]) {
        window.location.href = actionUrls[action];
    }
}

// ===== BATTLE SYSTEM =====
class BattleSystem {
    constructor(monsterId) {
        this.monster = getMonsterById(monsterId) || appState.user.monsters[0];
        this.monsterHp = this.monster?.hp || 78;
        this.monsterMaxHp = this.monster?.maxHp || 100;
        this.userEnergy = appState.user.energy;
        this.userMaxEnergy = 100;
        this.log = [];
        this.inProgress = false;
    }
    
    useSkill(skill) {
        if (this.inProgress) {
            this.addLog('Complete current skill first!');
            return false;
        }
        
        if (this.userEnergy < skill.cost) {
            this.addLog(`❌ Not enough energy! Need ${skill.cost} energy`);
            return false;
        }
        
        if (this.monsterHp <= 0) {
            this.addLog('Monster already defeated!');
            return false;
        }
        
        this.inProgress = true;
        this.disableButtons(true);
        
        // Calculate damage (with some randomness)
        const damage = Math.floor(skill.damage * (0.9 + Math.random() * 0.2));
        
        // Apply effects
        this.monsterHp = Math.max(0, this.monsterHp - damage);
        this.userEnergy = Math.max(0, this.userEnergy - skill.cost);
        
        this.addLog(`✅ You used ${skill.name}! -${damage} HP`);
        
        this.updateUI();
        
        // Save energy
        localStorage.setItem('userEnergy', this.userEnergy);
        
        if (this.monsterHp <= 0) {
            this.victory();
        } else {
            setTimeout(() => this.monsterAttack(), 800);
        }
        
        return true;
    }
    
    monsterAttack() {
        const damage = Math.floor(Math.random() * 8) + 3;
        this.userEnergy = Math.max(0, this.userEnergy - damage);
        
        this.addLog(`👾 Monster attacks! Your energy -${damage}`);
        this.updateUI();
        
        localStorage.setItem('userEnergy', this.userEnergy);
        
        this.inProgress = false;
        this.disableButtons(false);
        
        if (this.userEnergy <= 0) {
            this.defeat();
        }
    }
    
    addLog(message) {
        this.log.unshift(message);
        if (this.log.length > 8) this.log.pop();
        this.updateLog();
    }
    
    updateUI() {
        // Update HP bar
        const hpFill = document.getElementById('monsterHpFill');
        const hpText = document.getElementById('monsterHpText');
        if (hpFill) {
            const percent = (this.monsterHp / this.monsterMaxHp) * 100;
            hpFill.style.width = percent + '%';
        }
        if (hpText) hpText.innerHTML = this.monsterHp + '/' + this.monsterMaxHp + ' HP';
        
        // Update energy
        const energyFill = document.getElementById('energyFill');
        const energyText = document.getElementById('energyText');
        if (energyFill) {
            const percent = (this.userEnergy / this.userMaxEnergy) * 100;
            energyFill.style.width = percent + '%';
        }
        if (energyText) energyText.textContent = this.userEnergy + '/100';
    }
    
    updateLog() {
        const logContainer = document.getElementById('battleLog');
        if (!logContainer) return;
        
        logContainer.innerHTML = this.log.map(msg => 
            `<div class="log-entry">${msg}</div>`
        ).join('');
    }
    
    disableButtons(disabled) {
        const buttons = document.querySelectorAll('.battle-skill-card, .skill-btn');
        buttons.forEach(btn => btn.disabled = disabled);
    }
    
    victory() {
        this.addLog('🎉 VICTORY! You defeated the monster!');
        this.disableButtons(true);
        
        // Update monster HP in storage
        if (this.monster) {
            this.monster.hp = this.monsterHp;
            saveMonster(this.monster);
        }
        
        setTimeout(() => {
            alert('🎉 Victory! You defeated ' + this.monster.name + '!');
            window.location.href = 'home.html';
        }, 1500);
    }
    
    defeat() {
        this.addLog('😔 You ran out of energy...');
        this.disableButtons(true);
        
        setTimeout(() => {
            alert('You ran out of energy. The monster is still here.');
            window.location.href = 'home.html';
        }, 1500);
    }
}

// ===== JOURNAL =====
function saveJournalEntry() {
    const entry = document.getElementById('journalEntry')?.value;
    if (!entry || entry.trim() === '') {
        alert('Please write something before saving.');
        return;
    }
    
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    entries.unshift({
        text: entry.trim(),
        date: new Date().toLocaleString(),
        mood: getSelectedMood(),
        id: Date.now()
    });
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    
    // Clear the entry
    document.getElementById('journalEntry').value = '';
    
    alert('✨ Journal entry saved!');
    loadJournalEntries();
}

function getSelectedMood() {
    const selected = document.querySelector('.mood-option.selected .mood-emoji');
    return selected ? selected.textContent : '📝';
}

function loadJournalEntries() {
    const container = document.getElementById('entriesContainer');
    if (!container) return;
    
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-entries">
                <div class="empty-entries-emoji">📝</div>
                <p>No journal entries yet. Write your first one above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = entries.map(entry => `
        <div class="entry-card">
            <div class="entry-header">
                <span class="entry-date">${entry.date}</span>
                <span class="entry-mood">${entry.mood || '📝'}</span>
            </div>
            <div class="entry-text">${entry.text}</div>
            <div class="entry-footer">
                <div class="entry-tags">
                    <span class="entry-tag">journal</span>
                </div>
                <span class="delete-entry" onclick="deleteJournalEntry(${entry.id})">🗑️</span>
            </div>
        </div>
    `).join('');
}

function deleteJournalEntry(id) {
    if (confirm('Delete this entry?')) {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const filtered = entries.filter(e => e.id !== id);
        localStorage.setItem('journalEntries', JSON.stringify(filtered));
        loadJournalEntries();
    }
}

function exportJournal() {
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    if (entries.length === 0) {
        alert('No entries to export.');
        return;
    }
    
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `stride-journal-${new Date().toISOString().split('T')[0]}.json`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', exportName);
    link.click();
    
    alert('📤 Journal entries exported!');
}

// ===== MOOD TRACKING =====
function selectMood(mood, element) {
    document.querySelectorAll('.mood-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    appState.user.currentMood = mood;
}

function logMood(mood) {
    const moods = {
        'overwhelmed': { emoji: '😫', color: '#8b5cf6', tip: 'Try 5 minutes of breathing' },
        'irritable': { emoji: '😠', color: '#ef4444', tip: 'Try journaling' },
        'anxious': { emoji: '😰', color: '#f59e0b', tip: 'Try grounding exercise' },
        'down': { emoji: '😔', color: '#3b82f6', tip: 'Talk to your squad' },
        'exhausted': { emoji: '🥱', color: '#6b7280', tip: 'Rest and recharge' },
        'numb': { emoji: '😐', color: '#9ca3af', tip: 'Try sensory grounding' }
    };
    
    const moodData = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    moodData.unshift({
        mood: mood,
        emoji: moods[mood].emoji,
        date: new Date().toLocaleString()
    });
    localStorage.setItem('moodHistory', JSON.stringify(moodData));
    
    // Update stress indicator based on mood
    const stressMap = {
        'overwhelmed': 5,
        'irritable': 4,
        'anxious': 4,
        'down': 3,
        'exhausted': 3,
        'numb': 2
    };
    updateStressIndicator(stressMap[mood] || 3);
    
    alert(`✅ Mood logged: ${mood}`);
    
    // Suggest next action
    if (confirm(`💡 ${moods[mood].tip}?`)) {
        const actionMap = {
            'overwhelmed': 'quickbreathing.html',
            'anxious': 'quickgrounding.html',
            'irritable': 'quickjournal.html',
            'numb': 'quickgrounding.html'
        };
        if (actionMap[mood]) {
            window.location.href = actionMap[mood];
        } else {
            window.location.href = 'home.html';
        }
    } else {
        window.location.href = 'home.html';
    }
}

// ===== GROUNDING EXERCISE =====
let groundingStep = 0;
const groundingSteps = [
    { sense: 'SEE', instruction: 'Name 5 things you can see', count: 5 },
    { sense: 'TOUCH', instruction: 'Name 4 things you can feel', count: 4 },
    { sense: 'HEAR', instruction: 'Name 3 things you can hear', count: 3 },
    { sense: 'SMELL', instruction: 'Name 2 things you can smell', count: 2 },
    { sense: 'TASTE', instruction: 'Name 1 thing you can taste', count: 1 }
];

function initGrounding() {
    groundingStep = 0;
    updateGroundingStep();
}

function updateGroundingStep() {
    const senseEl = document.getElementById('groundingSense');
    const instructionEl = document.getElementById('groundingInstruction');
    const countEl = document.getElementById('groundingCount');
    
    if (groundingStep < groundingSteps.length) {
        const step = groundingSteps[groundingStep];
        if (senseEl) senseEl.textContent = step.sense;
        if (instructionEl) instructionEl.textContent = step.instruction;
        if (countEl) countEl.textContent = '0/' + step.count;
    } else {
        completeGrounding();
    }
}

function nextGroundingStep() {
    if (groundingStep < groundingSteps.length) {
        groundingStep++;
        updateGroundingStep();
    } else {
        completeGrounding();
    }
}

function completeGrounding() {
    alert('✨ Grounding complete! You are present.');
    window.location.href = 'home.html';
}

// ===== BREATHING EXERCISE =====
let breathingInterval;
let breathingActive = false;
const breathingSteps = [
    { phase: 'Inhale', duration: 4, emoji: '🌬️' },
    { phase: 'Hold', duration: 4, emoji: '⏸️' },
    { phase: 'Exhale', duration: 4, emoji: '💨' },
    { phase: 'Hold', duration: 4, emoji: '⏸️' }
];

function startBreathing() {
    if (breathingActive) return;
    
    let stepIndex = 0;
    let timeLeft = breathingSteps[0].duration;
    breathingActive = true;
    
    const instruction = document.getElementById('breathingInstruction');
    const timer = document.getElementById('breathingTimer');
    const emoji = document.getElementById('breathingEmoji');
    const circle = document.getElementById('breathCircle');
    
    if (circle) {
        circle.classList.add('inhale');
    }
    
    breathingInterval = setInterval(() => {
        if (timeLeft === 0) {
            stepIndex = (stepIndex + 1) % breathingSteps.length;
            const step = breathingSteps[stepIndex];
            timeLeft = step.duration;
            
            if (instruction) instruction.textContent = step.phase;
            if (emoji) emoji.textContent = step.emoji;
            
            if (circle) {
                if (step.phase === 'Inhale') {
                    circle.classList.add('inhale');
                    circle.classList.remove('exhale');
                } else if (step.phase === 'Exhale') {
                    circle.classList.add('exhale');
                    circle.classList.remove('inhale');
                } else {
                    circle.classList.remove('inhale', 'exhale');
                }
            }
        }
        
        if (timer) timer.textContent = timeLeft;
        timeLeft--;
    }, 1000);
}

function stopBreathing() {
    clearInterval(breathingInterval);
    breathingActive = false;
    window.location.href = 'home.html';
}

function resetBreathing() {
    clearInterval(breathingInterval);
    breathingActive = false;
    startBreathing();
}

// ===== DISTRACTIONS =====
const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "What do you call a fake noodle? An impasta!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why don't eggs tell jokes? They'd crack each other up!"
];

const funFacts = [
    "Octopuses have three hearts!",
    "Bananas are berries, but strawberries aren't!",
    "A day on Venus is longer than a year on Venus!",
    "Honey never spoils! Archaeologists found 3000-year-old honey still edible.",
    "Your brain is 60% fat!"
];

function showJoke() {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    document.getElementById('distractContent').innerHTML = `
        <div class="content-emoji">😂</div>
        <div class="content-text">${joke}</div>
        <button class="next-btn" onclick="showJoke()">Another Joke →</button>
    `;
}

function showFunFact() {
    const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
    document.getElementById('distractContent').innerHTML = `
        <div class="content-emoji">🦒</div>
        <div class="content-text">${fact}</div>
        <button class="next-btn" onclick="showFunFact()">Another Fact →</button>
    `;
}

// ===== UTILITY FUNCTIONS =====
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(12, 74, 110, 0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 40px;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Page-specific initialization
    const path = window.location.pathname;
    
    if (path.includes('quickjournal')) {
        loadJournalEntries();
    }
    
    if (path.includes('battle')) {
        const params = new URLSearchParams(window.location.search);
        const monsterId = params.get('monster');
        if (monsterId) {
            window.battle = new BattleSystem(monsterId);
        }
    }
    
    if (path.includes('quickgrounding')) {
        initGrounding();
    }
    
    if (path.includes('distract')) {
        // Initialize distraction page
    }
});