/* ==========================================================================
   ESCAPE ROOM EXPERIENCE - MASTER JAVASCRIPT LOGIC
   Includes easily editable configuration arrays for Puzzles 1 & 2.
   ========================================================================== */

/* --------------------------------------------------------------------------
   PUZZLE 1 CONFIGURATION
   Edit riddles, correct answers, green numbers, and red wrong numbers here.
   -------------------------------------------------------------------------- */
const puzzles = [
  {
    id: 1,
    title: "RIDDLE 01",
    question: "من هو الخال الوحيد لأولاد عمتك؟",
    correctAnswers: ["والدك", "ابوك", "أبوك", "بابا", "والدى", "والدي", "ابوي", "أبوي"],
    correctNumber: "1",
    wrongNumbers: ["4", "7", "9"]
  },
  {
    id: 2,
    title: "RIDDLE 02",
    question: "ما هو الشيء الذي يمكنه إختراق الزجاج دون أن يكسره؟",
    correctAnswers: ["الضوء", "النور", "ضوء", "نور"],
    correctNumber: "8",
    wrongNumbers: ["3", "5", "6"]
  },
  {
    id: 3,
    title: "RIDDLE 03",
    question: "ما هو الشيء الذي أمامك باستمرار ولا تراه؟",
    correctAnswers: ["المستقبل", "مستقبل"],
    correctNumber: "2",
    wrongNumbers: ["0", "9", "5"]
  },
  {
    id: 4,
    title: "RIDDLE 04",
    question: "ما هو الشيء الذي يجب عليك كسره لكي تستخدمه؟",
    correctAnswers: ["البيض", "البيضة", "بيض", "بيضة"],
    correctNumber: "4",
    wrongNumbers: ["1", "6", "8"]
  }
];

/* --------------------------------------------------------------------------
   PUZZLE 2 CONFIGURATION
   Edit access code password and secret reveal text here.
   -------------------------------------------------------------------------- */
const puzzle2Config = {
  // Change the unlock password here (e.g. "1182")
  accessCode: "1182",

  // Milliseconds per character typed in terminal reveal
  typingSpeedMs: 25,

  // The secret script revealed ONLY after entering correct password
  secretScript: `تم فك التشفير بنجاح...

جاري تحميل التسجيل الصوتي والرسالة المسترجعة...

> حالة الملف: تم العثور عليه في غرفة المكتب
> مصدر الرسالة: ضحية السفاح الأوروبي

--------------------------------------------------
نص الرسالة المسترجعة:

"انا لقيت ورق و ادله بتقول مين الي قتل بتاع اسمه سفاح اروربي ده زباله قتل جوزي و عيال و جي الدور عليا و انا قررت اني اعرف الحقيقه الحاجه الي وصلتلها كانت فظيفه و مرعبه خلت الدم يمشي من جسمي و لما قرب لقيته في اوضه المكتب الي انتوا فيها دي ورق عنه و عن الي بيساعده و لقيت حاجه غربيه ورقه زواج و احنا منعرفش عنها حاجه و لما قربت الراجل جيه موتني و انا كتبت دي قبل ما اموت علشان انتوا تكملوا ورايا و لو عايزين تعرفوا انا لقيت اي تعالوا القاعه"

--------------------------------------------------
[STATUS: END OF TRANSMISSION]
[المهمة الحالية: التوجه فوراً إلى القاعة]`
};


/* --------------------------------------------------------------------------
   WEB AUDIO API SOUND SYNTHESIZER (No external audio files needed!)
   -------------------------------------------------------------------------- */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTypeClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) { /* ignore sound errors */ }
  }

  playSuccessBeep() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) { /* ignore */ }
  }

  playErrorBuzz() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) { /* ignore */ }
  }
}

const sounds = new SoundEngine();


/* --------------------------------------------------------------------------
   COMMON UI INITIALIZATION (AUDIO TOGGLE)
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const audioBtn = document.getElementById('audioToggleBtn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      sounds.init();
      sounds.enabled = !sounds.enabled;
      if (sounds.enabled) {
        audioBtn.classList.add('active');
        audioBtn.innerHTML = '🔊 SOUND ON';
        sounds.playTypeClick();
      } else {
        audioBtn.classList.remove('active');
        audioBtn.innerHTML = '🔇 SOUND OFF';
      }
    });
  }

  // Enable audio on first user click anywhere
  document.body.addEventListener('click', () => sounds.init(), { once: true });

  // Initialize page-specific logic
  if (document.getElementById('riddlesContainer')) {
    initPuzzle1();
  }
  if (document.getElementById('passInput')) {
    initPuzzle2();
  }
});


/* --------------------------------------------------------------------------
   PUZZLE 1 ENGINE: FOUR RIDDLES & GREEN/RED CODES
   -------------------------------------------------------------------------- */
function initPuzzle1() {
  const container = document.getElementById('riddlesContainer');
  const finalSummary = document.getElementById('finalSummaryPanel');
  const codeSlotsContainer = document.getElementById('codeSlotsContainer');
  
  // Track status for each riddle: null (unanswered), true (green), false (red)
  const state = {};
  puzzles.forEach(p => state[p.id] = { isCorrect: false, code: null });

  // Render riddle cards dynamically
  container.innerHTML = '';
  puzzles.forEach(p => {
    const card = document.createElement('div');
    card.className = 'panel riddle-card';
    card.id = `riddle-card-${p.id}`;

    card.innerHTML = `
      <div>
        <div class="riddle-header">
          <span class="riddle-num">${p.title}</span>
          <div class="riddle-status-icon" id="status-icon-${p.id}"></div>
        </div>
        <div class="riddle-question">${p.question}</div>
      </div>
      <div>
        <form class="answer-form" id="form-riddle-${p.id}" autocomplete="off">
          <input type="text" class="input-field" id="input-riddle-${p.id}" placeholder="Enter answer..." required />
          <button type="submit" class="btn-submit">SUBMIT</button>
        </form>
        <div class="code-result" id="code-result-${p.id}"></div>
      </div>
    `;

    container.appendChild(card);

    // Form submit listener
    const form = card.querySelector(`#form-riddle-${p.id}`);
    const input = card.querySelector(`#input-riddle-${p.id}`);
    const resultBox = card.querySelector(`#code-result-${p.id}`);
    const statusIcon = card.querySelector(`#status-icon-${p.id}`);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sounds.init();

      function normalizeStr(str) {
        return str
          .trim()
          .toLowerCase()
          .replace(/[أإآ]/g, 'ا')
          .replace(/ة/g, 'ه')
          .replace(/ى/g, 'ي')
          .replace(/[ًٌٍَُِّْ]/g, '');
      }

      const userAns = normalizeStr(input.value);
      if (!userAns) return;

      const isCorrect = p.correctAnswers.some(ans => normalizeStr(ans) === userAns);

      if (isCorrect) {
        sounds.playSuccessBeep();
        resultBox.textContent = `CODE: ${p.correctNumber}`;
        resultBox.className = 'code-result show green';
        card.classList.add('solved');
        card.classList.remove('failed');
        state[p.id] = { isCorrect: true, number: p.correctNumber };
      } else {
        sounds.playErrorBuzz();
        // Deterministic wrong number selection based on string hash
        const hash = Array.from(userAns).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const wrongNum = p.wrongNumbers[hash % p.wrongNumbers.length];
        
        resultBox.textContent = `CODE: ${wrongNum}`;
        resultBox.className = 'code-result show red';
        card.classList.remove('solved');
        card.classList.add('failed');
        state[p.id] = { isCorrect: false, number: wrongNum };
      }

      checkPuzzle1Completion();
    });
  });

  function checkPuzzle1Completion() {
    const allSolved = puzzles.every(p => state[p.id] && state[p.id].isCorrect);
    
    if (allSolved) {
      finalSummary.classList.add('active');
      codeSlotsContainer.innerHTML = '';

      puzzles.forEach((p, idx) => {
        const slot = document.createElement('div');
        slot.className = 'code-slot';
        slot.innerHTML = `<span class="code-slot-icon">🟩</span> ${p.correctNumber}`;
        codeSlotsContainer.appendChild(slot);

        if (idx < puzzles.length - 1) {
          const sep = document.createElement('div');
          sep.className = 'code-separator';
          sep.textContent = '—';
          codeSlotsContainer.appendChild(sep);
        }
      });

      // Scroll smoothly to summary box
      finalSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}


/* --------------------------------------------------------------------------
   PUZZLE 2 ENGINE: PASSWORD AUTH & TYPEWRITER REVEAL
   -------------------------------------------------------------------------- */
function initPuzzle2() {
  const passForm = document.getElementById('passForm');
  const passInput = document.getElementById('passInput');
  const passCard = document.getElementById('passwordCard');
  const errorMsg = document.getElementById('errorMsg');
  
  const terminalScreen = document.getElementById('terminalScreen');
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const terminalBody = document.getElementById('terminalBody');
  const terminalText = document.getElementById('terminalText');

  passForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sounds.init();

    const val = passInput.value.trim();

    if (val === puzzle2Config.accessCode) {
      sounds.playSuccessBeep();
      errorMsg.classList.remove('visible');

      // Hide password panel
      passCard.style.display = 'none';

      // Show terminal screen & start initialization sequence
      terminalScreen.classList.add('active');
      startTerminalInitialization();
    } else {
      sounds.playErrorBuzz();
      errorMsg.classList.add('visible');
      errorMsg.textContent = 'ACCESS DENIED: INVALID ACCESS CODE';
      
      // Trigger card shake animation
      passCard.classList.remove('shake');
      void passCard.offsetWidth; // trigger reflow
      passCard.classList.add('shake');

      passInput.value = '';
      passInput.focus();
    }
  });

  function startTerminalInitialization() {
    let progress = 0;
    progressContainer.style.display = 'block';

    const interval = setInterval(() => {
      progress += 5;
      progressFill.style.width = `${progress}%`;
      sounds.playTypeClick();

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          progressContainer.style.display = 'none';
          startTypewriterReveal();
        }, 400);
      }
    }, 45);
  }

  function startTypewriterReveal() {
    const textToType = puzzle2Config.secretScript;
    let index = 0;

    terminalBody.style.display = 'block';
    terminalText.textContent = '';

    const timer = setInterval(() => {
      if (index < textToType.length) {
        const char = textToType.charAt(index);
        terminalText.textContent += char;
        index++;

        if (index % 2 === 0) {
          sounds.playTypeClick();
        }

        // Auto-scroll to bottom of terminal box
        terminalBody.scrollTop = terminalBody.scrollHeight;
      } else {
        clearInterval(timer);
      }
    }, puzzle2Config.typingSpeedMs);
  }
}
