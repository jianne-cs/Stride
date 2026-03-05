// ===== GLOBAL STATE =====
const appState = {
    user: {
        name: 'Marco',
        stressLevel: 3,
        energy: 82,
        monsters: [
            { id: 1, name: 'Thesis Panic', hp: 78, maxHp: 100, type: 'anxiety' },
            { id: 2, name: 'Social Anxiety', hp: 45, maxHp: 100, type: 'anxiety' },
            { id: 3, name: 'Procrastination', hp: 92, maxHp: 100, type: 'motivation' }
        ],
        squad: ['Alex', 'Jordan', 'Taylor']
    },
    currentBattle: null
};

// ===== STRESS INDICATOR =====
function updateStressIndicator(level) {
    const dots = document.querySelectorAll('.dot');
    if (!dots.length) return;
    
    dots.forEach((dot, index) => {
        if (index < level) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
    
    // Save to localStorage
    localStorage.setItem('stressLevel', level);
}

function initStressIndicator() {
    const savedLevel = localStorage.getItem('stressLevel');
    if (savedLevel) {
        appState.user.stressLevel = parseInt(savedLevel);
    }
    updateStressIndicator(appState.user.stressLevel);
}

// ===== QUICK ACTIONS =====
function openQuickAction(action) {
    switch(action) {
        case 'breathing':
            window.location.href = 'quickbreathing.html';
            break;
        case 'mood':
            window.location.href = 'quickmoodcheck.html';
            break;
        case 'grounding':
            window.location.href = 'quickgrounding.html';
            break;
        case 'journal':
            window.location.href = 'quickjournal.html';
            break;
    }
}

// ===== BATTLE SYSTEM =====
class BattleSystem {
    constructor(monsterId) {
        this.monster = appState.user.monsters.find(m => m.id === monsterId) || appState.user.monsters[0];
        this.monsterHp = this.monster.hp;
        this.userEnergy = appState.user.energy;
        this.maxHp = this.monster.maxHp;
        this.maxEnergy = 100;
        this.log = [];
    }
    
    useSkill(skill) {
        if (this.userEnergy < skill.cost) {
            this.addLog('Not enough energy!');
            return false;
        }
        
        // Apply damage
        this.monsterHp = Math.max(0, this.monsterHp - skill.damage);
        this.userEnergy -= skill.cost;
        
        // Add to log
        this.addLog(`You used ${skill.name}. Monster HP -${skill.damage}`);
        this.addLog(`Monster HP: ${this.monsterHp}/${this.maxHp}`);
        
        // Update UI
        this.updateUI();
        
        // Check victory
        if (this.monsterHp <= 0) {
            this.victory();
        }
        
        return true;
    }
    
    monsterAttack() {
        if (this.monsterHp <= 0) return;
        
        const damage = Math.floor(Math.random() * 8) + 3;
        this.userEnergy = Math.max(0, this.userEnergy - damage);
        this.addLog(`Monster attacks! Energy -${damage}`);
        this.updateUI();
        
        if (this.userEnergy <= 0) {
            this.defeat();
        }
    }
    
    addLog(message) {
        this.log.unshift(message);
        if (this.log.length > 5) this.log.pop();
        this.updateLog();
    }
    
    updateUI() {
        // Update HP bar
        const hpFill = document.getElementById('monsterHpFill');
        const hpText = document.getElementById('monsterHpText');
        if (hpFill) hpFill.style.width = (this.monsterHp / this.maxHp * 100) + '%';
        if (hpText) hpText.textContent = this.monsterHp + '/' + this.maxHp + ' HP';
        
        // Update energy
        const energyFill = document.getElementById('energyFill');
        const energyText = document.getElementById('energyText');
        if (energyFill) energyFill.style.width = (this.userEnergy / this.maxEnergy * 100) + '%';
        if (energyText) energyText.textContent = this.userEnergy + '/100';
    }
    
    updateLog() {
        const logContainer = document.getElementById('battleLog');
        if (!logContainer) return;
        
        logContainer.innerHTML = this.log.map(msg => 
            `<div class="log-entry">${msg}</div>`
        ).join('');
    }
    
    victory() {
        setTimeout(() => {
            alert('🎉 VICTORY! You defeated your monster!');
            window.location.href = 'home.html';
        }, 500);
    }
    
    defeat() {
        setTimeout(() => {
            alert('😔 You ran out of energy. The monster is still here.');
            window.location.href = 'home.html';
        }, 500);
    }
}

// ===== JOURNAL =====
function saveJournalEntry() {
    const entry = document.getElementById('journalEntry')?.value;
    if (!entry) return;
    
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    entries.unshift({
        text: entry,
        date: new Date().toLocaleString(),
        id: Date.now()
    });
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    
    alert('Journal entry saved!');
    window.location.href = 'home.html';
}

function loadJournalEntries() {
    const container = document.getElementById('journalEntries');
    if (!container) return;
    
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    container.innerHTML = entries.map(entry => `
        <div class="card">
            <div style="color: #9ca3af; font-size: 12px; margin-bottom: 5px;">${entry.date}</div>
            <div>${entry.text}</div>
        </div>
    `).join('');
}

// ===== MOOD TRACKING =====
function logMood(mood) {
    const moods = {
        'overwhelmed': { emoji: '😫', color: '#8b5cf6' },
        'irritable': { emoji: '😠', color: '#ef4444' },
        'anxious': { emoji: '😰', color: '#f59e0b' },
        'down': { emoji: '😔', color: '#3b82f6' },
        'exhausted': { emoji: '🥱', color: '#6b7280' },
        'numb': { emoji: '😐', color: '#9ca3af' }
    };
    
    const moodData = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    moodData.unshift({
        mood: mood,
        emoji: moods[mood].emoji,
        date: new Date().toLocaleString()
    });
    localStorage.setItem('moodHistory', JSON.stringify(moodData));
    
    alert(`Mood logged: ${mood}`);
    
    // Suggest next action
    const suggestions = {
        'overwhelmed': 'Try 5 minutes of breathing',
        'anxious': 'Try grounding exercise',
        'irritable': 'Try journaling'
    };
    
    if (suggestions[mood] && confirm(`${suggestions[mood]}?`)) {
        if (mood === 'overwhelmed') window.location.href = 'quickbreathing.html';
        else if (mood === 'anxious') window.location.href = 'quickgrounding.html';
        else if (mood === 'irritable') window.location.href = 'quickjournal.html';
    } else {
        window.location.href = 'home.html';
    }
}

// ===== GROUNDING EXERCISE =====
let groundingStep = 0;
const groundingSteps = [
    { sense: 'LOOK', instruction: 'Name 5 things you can see', completed: false },
    { sense: 'LISTEN', instruction: 'Name 4 things you can hear', completed: false },
    { sense: 'FEEL', instruction: 'Name 3 things you can physically feel', completed: false },
    { sense: 'SMELL', instruction: 'Name 2 things you can smell', completed: false },
    { sense: 'TASTE', instruction: 'Name 1 thing you can taste', completed: false }
];

function nextGroundingStep() {
    if (groundingStep < groundingSteps.length) {
        const step = groundingSteps[groundingStep];
        document.getElementById('groundingSense').textContent = step.sense;
        document.getElementById('groundingInstruction').textContent = step.instruction;
        groundingStep++;
    } else {
        alert('✨ Grounding complete! You are present.');
        window.location.href = 'home.html';
    }
}

// ===== BREATHING EXERCISE =====
let breathingInterval;
let breathingStep = 0;
const breathingSteps = ['Breathe IN...', 'Hold...', 'Breathe OUT...', 'Hold...'];

function startBreathing() {
    let count = 4;
    let stepIndex = 0;
    const instruction = document.getElementById('breathingInstruction');
    const timer = document.getElementById('breathingTimer');
    
    breathingInterval = setInterval(() => {
        if (count === 0) {
            stepIndex = (stepIndex + 1) % breathingSteps.length;
            instruction.textContent = breathingSteps[stepIndex];
            count = stepIndex % 2 === 0 ? 4 : 2; // In/hold: 4 sec, Out/hold: 2 sec
        }
        timer.textContent = count;
        count--;
    }, 1000);
}

function stopBreathing() {
    clearInterval(breathingInterval);
    window.location.href = 'home.html';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    initStressIndicator();
    
    // Load journal entries if on journal page
    if (window.location.pathname.includes('quickjournal')) {
        loadJournalEntries();
    }
    
    // Initialize battle if on battle page
    if (window.location.pathname.includes('battle')) {
        window.battle = new BattleSystem(1);
    }
});