/**
 * DHURANDHAR: THE COLD ARCHIVE
 * Cinematic Scrollytelling Engine & Interactive Espionage Terminal
 * Film Directed by Aditya Dhar
 */

(function () {
  'use strict';

  // --- AUDIO SOUNDSCAPE ENGINE (Web Audio API Synthesizer) ---
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.droneOsc = null;
      this.droneGain = null;
      this.filter = null;
      this.noiseNode = null;
      this.noiseGain = null;
      this.pulseTimer = null;
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    startAtmosphere() {
      this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.isPlaying) return;

      const now = this.ctx.currentTime;

      // 1. Deep Sub Bass Espionage Drone (55Hz Reese-style)
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(55, now); // A1 note

      // Lowpass filter with subtle modulation
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(140, now);
      this.filter.Q.setValueAtTime(4, now);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.06, now + 3);

      // Connect drone chain
      this.droneOsc.connect(this.filter);
      this.filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);
      this.droneOsc.start();

      // 2. Analog Tape Hiss / Radio Noise Buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.Q.setValueAtTime(1.5, now);

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(0.001, now);
      this.noiseGain.gain.exponentialRampToValueAtTime(0.015, now + 2);

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.ctx.destination);
      this.noiseNode.start();

      // 3. Periodic Sub-Radar Ping
      this.pulseTimer = setInterval(() => {
        if (!this.isPlaying) return;
        this.playSonarPing();
      }, 5000);

      this.isPlaying = true;
      document.body.classList.add('audio-playing');
      const toggleBtn = document.getElementById('audio-toggle-btn');
      if (toggleBtn) {
        toggleBtn.classList.add('bg-amber-500/20', 'border-amber-500');
        const text = toggleBtn.querySelector('.audio-status-text');
        if (text) text.innerText = 'AUDIO: TRANSMITTING';
      }
    }

    stopAtmosphere() {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      if (this.droneGain) {
        this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 1);
        setTimeout(() => {
          if (this.droneOsc) {
            try { this.droneOsc.stop(); } catch (e) {}
            this.droneOsc.disconnect();
          }
        }, 1100);
      }
      if (this.noiseGain) {
        this.noiseGain.gain.linearRampToValueAtTime(0.0001, now + 1);
        setTimeout(() => {
          if (this.noiseNode) {
            try { this.noiseNode.stop(); } catch (e) {}
            this.noiseNode.disconnect();
          }
        }, 1100);
      }
      if (this.pulseTimer) clearInterval(this.pulseTimer);

      this.isPlaying = false;
      document.body.classList.remove('audio-playing');
      const toggleBtn = document.getElementById('audio-toggle-btn');
      if (toggleBtn) {
        toggleBtn.classList.remove('bg-amber-500/20', 'border-amber-500');
        const text = toggleBtn.querySelector('.audio-status-text');
        if (text) text.innerText = 'AUDIO: MUTED';
      }
    }

    toggle() {
      if (this.isPlaying) {
        this.stopAtmosphere();
      } else {
        this.startAtmosphere();
      }
    }

    playBeep(freq = 700, duration = 0.08, type = 'sine', gainVal = 0.05) {
      if (!this.ctx) this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    }

    playSonarPing() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1);
    }

    playDeclassifyStamp() {
      this.playBeep(180, 0.25, 'triangle', 0.12);
      setTimeout(() => this.playBeep(450, 0.1, 'sine', 0.08), 80);
    }
  }

  const audio = new AudioEngine();
  window.audioEngine = audio;

  // --- SCROLL ENGINE & TELEMETRY ---
  const progressBar = document.getElementById('scroll-progress-bar');
  const hudCoordText = document.getElementById('hud-coordinates');
  const hudChapterText = document.getElementById('hud-chapter');
  const hudTimecode = document.getElementById('hud-timecode');

  const coordinatesMap = {
    'stage-catalyst-1': { coord: '31°37\'44"N 65°44\'24"E', loc: 'KANDAHAR AIRFIELD, AFGHANISTAN', chapter: 'CH.01: THE CATALYST' },
    'stage-catalyst-2': { coord: '28°37\'02"N 77°12\'30"E', loc: 'PARLIAMENT HOUSE, NEW DELHI', chapter: 'CH.01: THE CATALYST' },
    'stage-catalyst-3': { coord: '28°36\'50"N 77°12\'18"E', loc: 'NORTH BLOCK WAR ROOM, DELHI', chapter: 'CH.01: THE BLUEPRINT' },
    'stage-erasure-1': { coord: '31°06\'12"N 77°10\'20"E', loc: 'BLACK SITE ACADEMY, CHAKRATA', chapter: 'CH.02: IDENTITY SCRUB' },
    'stage-erasure-2': { coord: '27°02\'15"N 70°54\'40"E', loc: 'THAR DESERT BORDER CORRIDOR', chapter: 'CH.02: ZERO FOOTPRINT' },
    'stage-lyari-1': { coord: '24°51\'40"N 66°59\'50"E', loc: 'CHAKIWARA, LYARI, KARACHI', chapter: 'CH.03: GANGS OF LYARI' },
    'stage-lyari-2': { coord: '24°48\'20"N 66°58\'10"E', loc: 'KEMARI DOCKS & WEAPONS DEPOT', chapter: 'CH.03: ARMS CONDUIT' },
    'stage-triad-1': { coord: '24°52\'10"N 67°01\'30"E', loc: 'SINDH POLICE ENCOUNTER ZONE', chapter: 'CH.04: CHOUDHARY ASLAM' },
    'stage-shadow-1': { coord: '33°43\'12"N 73°04\'18"E', loc: 'ISI COVERT OPERATIONS CELL', chapter: 'CH.05: MAJOR IQBAL' },
    'stage-climax-1': { coord: '24°49\'10"N 66°57\'25"E', loc: 'KARACHI HARBOR CARGO BERTH 14', chapter: 'CH.06: OPERATION DHURANDHAR' },
    'stage-climax-2': { coord: '24°50\'05"N 66°59\'00"E', loc: 'SAFEHOUSE ZERO / EXTRACTION HOT', chapter: 'CH.06: EXTRACTION' }
  };

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = Math.min(100, Math.max(0, (scrollTop / (scrollHeight || 1)) * 100));

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Update real-time clock telemetry
    if (hudTimecode) {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      const ms = String(Math.floor(now.getUTCMilliseconds() / 10)).padStart(2, '0');
      hudTimecode.textContent = `UTC ${hours}:${mins}:${secs}.${ms}Z`;
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  setInterval(updateScrollProgress, 250);

  // --- INTERSECTION OBSERVER FOR SCROLLYTELLING STEPS ---
  const stepCards = document.querySelectorAll('.step-card');

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0.1
  };

  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Remove active class from sibling cards in same section
        const parent = entry.target.closest('.scrolly-steps');
        if (parent) {
          parent.querySelectorAll('.step-card').forEach(c => c.classList.remove('active-step'));
        }
        entry.target.classList.add('active-step');

        const stepId = entry.target.dataset.stepId;
        if (stepId) {
          handleStepTransition(stepId, entry.target);
        }
      }
    });
  }, observerOptions);

  stepCards.forEach(card => stepObserver.observe(card));

  function handleStepTransition(stepId, cardElem) {
    // 1. Update Telemetry HUD
    if (coordinatesMap[stepId]) {
      const info = coordinatesMap[stepId];
      if (hudCoordText) hudCoordText.textContent = `${info.coord} [${info.loc}]`;
      if (hudChapterText) hudChapterText.textContent = info.chapter;
    }

    // 2. Audio feedback on step switch
    if (audio.isPlaying) {
      audio.playBeep(520, 0.04, 'sine', 0.03);
    }

    // 3. Stage 1: The Catalyst & The Cold Blueprint
    if (stepId === 'stage-catalyst-1') {
      updateCatalystMonitor('IC-814 KANDAHAR CRISIS', 'CRITICAL AIRSPACE BREACH', 'Dec 1999: Indian Airlines Flight IC-814 hijacked. 176 souls held hostage in Taliban-controlled Kandahar tarmac. India forced to release 3 dreaded militants. The scars ignite a vow of permanent retaliation.', [31.62, 65.73]);
    } else if (stepId === 'stage-catalyst-2') {
      updateCatalystMonitor('PARLIAMENT SIEGE 2001', 'HEART OF DEMOCRACY ATTACKED', 'Dec 13, 2001: Five heavily armed terrorists breach Parliament complex. Security forces neutralize attackers, saving top leadership. The message in South Block: Diplomatic defense is no longer enough.', [28.61, 77.20]);
    } else if (stepId === 'stage-catalyst-3') {
      updateCatalystMonitor('PROJECT DHURANDHAR AUTHORIZED', 'BLACK BUDGET DIRECTIVE 09', 'Director Ajay Sanyal (R. Madhavan) tables the ultra-classified proposal: Plant a sleeper asset in the deepest criminal artery of Pakistan. The target is not the soldiers—it is the puppeteers.', [28.61, 77.21]);
    }

    // 4. Stage 2: The Erasure (Biometric Dissolution)
    if (stepId === 'stage-erasure-1') {
      setErasurePersona('jaskirat');
    } else if (stepId === 'stage-erasure-2') {
      setErasurePersona('hamza');
    }

    // 5. Stage 3: Lyari Underworld Map
    if (stepId === 'stage-lyari-1') {
      focusKarachiDistrict('lyari-core');
    } else if (stepId === 'stage-lyari-2') {
      focusKarachiDistrict('kemari-docks');
    }

    // 6. Stage 4: Triad Standoff
    if (stepId === 'stage-triad-1') {
      highlightTriadStandoff();
    }

    // 7. Stage 5: Shadow Master Intercept
    if (stepId === 'stage-shadow-1') {
      startSignalDecryption();
    }

    // 8. Stage 6: Climax Extraction
    if (stepId === 'stage-climax-1') {
      triggerOperationStatus('BREACH_INITIATED', 'red');
    } else if (stepId === 'stage-climax-2') {
      triggerOperationStatus('EXTRACTION_UNDERWAY', 'amber');
    }
  }

  // --- STAGE VISUAL UPDATERS ---

  // Monitor in Section 1
  function updateCatalystMonitor(headline, tag, description, coords) {
    const headEl = document.getElementById('catalyst-headline');
    const tagEl = document.getElementById('catalyst-tag');
    const descEl = document.getElementById('catalyst-desc');
    const coordEl = document.getElementById('catalyst-coords');
    const mapPing = document.getElementById('catalyst-map-ping');

    if (headEl) headEl.textContent = headline;
    if (tagEl) tagEl.textContent = tag;
    if (descEl) descEl.textContent = description;
    if (coordEl) coordEl.textContent = `LAT: ${coords[0].toFixed(2)}°N | LON: ${coords[1].toFixed(2)}°E`;

    if (mapPing) {
      if (headline.includes('KANDAHAR')) {
        mapPing.style.top = '36%';
        mapPing.style.left = '32%';
      } else if (headline.includes('PARLIAMENT')) {
        mapPing.style.top = '52%';
        mapPing.style.left = '68%';
      } else {
        mapPing.style.top = '50%';
        mapPing.style.left = '64%';
      }
    }
  }

  // Identity Erasure in Section 2
  function setErasurePersona(type) {
    const cardJaskirat = document.getElementById('persona-jaskirat');
    const cardHamza = document.getElementById('persona-hamza');
    const statusText = document.getElementById('erasure-status-indicator');

    if (type === 'jaskirat') {
      if (cardJaskirat) {
        cardJaskirat.style.opacity = '1';
        cardJaskirat.style.transform = 'scale(1)';
        cardJaskirat.style.filter = 'grayscale(0%)';
      }
      if (cardHamza) {
        cardHamza.style.opacity = '0.3';
        cardHamza.style.transform = 'scale(0.95)';
        cardHamza.style.filter = 'grayscale(80%)';
      }
      if (statusText) {
        statusText.innerHTML = '<span class="text-cyan-400">ORIGINAL IDENTITY:</span> CAPTAIN JASKIRAT SINGH RANGI (ACTIVE RAW FILE)';
      }
    } else {
      if (cardJaskirat) {
        cardJaskirat.style.opacity = '0.25';
        cardJaskirat.style.transform = 'scale(0.95)';
        cardJaskirat.style.filter = 'grayscale(100%)';
      }
      if (cardHamza) {
        cardHamza.style.opacity = '1';
        cardHamza.style.transform = 'scale(1.02)';
        cardHamza.style.filter = 'grayscale(0%)';
      }
      if (statusText) {
        statusText.innerHTML = '<span class="text-amber-400 font-bold">ERASURE COMPLETE:</span> HAMZA ALI MAZARI (BALOCH SMUGGLER & ENFORCER)';
      }
    }
  }

  // Karachi Gangland Map in Section 3
  function focusKarachiDistrict(district) {
    const pingLyari = document.getElementById('ping-lyari');
    const pingDocks = document.getElementById('ping-docks');
    const labelLyari = document.getElementById('label-lyari');
    const labelDocks = document.getElementById('label-docks');
    const tacticalLog = document.getElementById('lyari-tactical-log');

    if (district === 'lyari-core') {
      if (pingLyari) pingLyari.classList.add('scale-125');
      if (pingDocks) pingDocks.classList.remove('scale-125');
      if (labelLyari) labelLyari.classList.add('text-amber-400', 'font-bold');
      if (labelDocks) labelDocks.classList.remove('text-amber-400', 'font-bold');
      if (tacticalLog) {
        tacticalLog.textContent = '[SURVEILLANCE FEED]: Rehman Dakait compound identified in Chakiwara. Armed sentries spotted on rooftops. Hamza Mazari granted entry.';
      }
    } else {
      if (pingDocks) pingDocks.classList.add('scale-125');
      if (pingLyari) pingLyari.classList.remove('scale-125');
      if (labelDocks) labelDocks.classList.add('text-cyan-400', 'font-bold');
      if (labelLyari) labelLyari.classList.remove('text-amber-400', 'font-bold');
      if (tacticalLog) {
        tacticalLog.textContent = '[INTERCEPT ALERT]: Docks shipping container #204 carrying heavy Russian munitions & satellite gear. Intercepted by Mazari.';
      }
    }
  }

  // Triad Standoff in Section 4
  function highlightTriadStandoff() {
    const standoffGraph = document.getElementById('standoff-graph');
    if (standoffGraph) {
      standoffGraph.classList.add('animate-pulse');
      setTimeout(() => standoffGraph.classList.remove('animate-pulse'), 1500);
    }
  }

  // Signal Decryption in Section 5
  let decrypting = false;
  function startSignalDecryption() {
    if (decrypting) return;
    decrypting = true;
    const targetText = "INTERCEPT RAW/ISI-409: OPERATION TARGET METROPOLITAN FINANCIAL CAPITAL. SHIPMENT CLEARED BY IQBAL.";
    const cipherDisplay = document.getElementById('cipher-text-display');
    const cipherStatus = document.getElementById('cipher-status-badge');
    if (!cipherDisplay) return;

    if (cipherStatus) {
      cipherStatus.textContent = 'DECRYPTING 256-BIT ROTATING KEY...';
      cipherStatus.className = 'text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono';
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#@*&!$/";
    let iterations = 0;
    const maxIterations = targetText.length;

    const interval = setInterval(() => {
      cipherDisplay.textContent = targetText
        .split("")
        .map((char, index) => {
          if (index < iterations) {
            return targetText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      if (iterations >= maxIterations) {
        clearInterval(interval);
        decrypting = false;
        if (cipherStatus) {
          cipherStatus.textContent = 'TRANSMISSION DECRYPTED // VERIFIED';
          cipherStatus.className = 'text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono';
        }
      }
      iterations += 1;
    }, 40);
  }

  // Climax Section 6
  function triggerOperationStatus(status, theme) {
    const badge = document.getElementById('op-status-badge');
    const timerElem = document.getElementById('op-countdown-timer');
    if (badge) {
      badge.textContent = status.replace('_', ' ');
      if (theme === 'red') {
        badge.className = 'px-3 py-1 bg-red-600/30 border border-red-500 text-red-400 text-xs font-mono font-bold tracking-widest uppercase rounded';
      } else {
        badge.className = 'px-3 py-1 bg-amber-600/30 border border-amber-500 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase rounded';
      }
    }
  }

  // --- REDACTED TEXT REVEAL ON CLICK ---
  document.querySelectorAll('.redacted').forEach((elem) => {
    elem.addEventListener('click', () => {
      elem.classList.toggle('revealed');
      audio.playDeclassifyStamp();
    });
  });

  // --- AUDIO TOGGLE BUTTON ---
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audio.toggle();
    });
  }

  // --- CRT SCANLINES TOGGLE ---
  const crtToggleBtn = document.getElementById('crt-toggle-btn');
  if (crtToggleBtn) {
    crtToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('crt-disabled');
      const isDisabled = document.body.classList.contains('crt-disabled');
      const crtStatus = crtToggleBtn.querySelector('.crt-status');
      if (crtStatus) {
        crtStatus.textContent = isDisabled ? 'CRT: OFF' : 'CRT: ON';
      }
      audio.playBeep(800, 0.05, 'square', 0.04);
    });
  }

  // --- CHARACTER DOSSIER MODAL ---
  const characterDossiers = {
    ranveer: {
      name: "HAMZA ALI MAZARI / CAPT. JASKIRAT SINGH RANGI",
      actor: "Ranveer Singh",
      codename: "PHANTOM-9",
      role: "Deep Cover Indian Intelligence Infiltrator",
      affiliation: "Research & Analysis Wing (RAW) // Lyari Syndicate",
      threatLevel: "EXTREME (LEVEL 5)",
      bio: "A disciplined Indian commando stripped of his legal identity to penetrate the blood-soaked criminal veins of Karachi. As Hamza Ali Mazari, he balances the brutal underworld politics of Rehman Dakait with the high-stakes tactical mission to uncover Pakistani state-sponsored terror blueprints.",
      specialty: "Close Quarters Combat, Covert Extraction, Urban Guerrilla Warfare, Identity Camouflage",
      quote: "A soldier dies for his flag. An undercover spy dies in the dark, forgotten by his own country. I made my peace with that long ago."
    },
    akshaye: {
      name: "REHMAN DAKAIT",
      actor: "Akshaye Khanna",
      codename: "WARLORD-KARACHI",
      role: "Lyari Gangland Kingpin & Underworld Syndicate Boss",
      affiliation: "Lyari Criminal Network // Arms Logistics",
      threatLevel: "LETHAL",
      bio: "The de-facto ruler of Lyari's sprawling slum networks. Cold, calculating, and ruthless, Rehman wields political muscle and automatic weaponry with chilling precision. He senses Hamza's exceptional skill and welcomes him into his inner circle—unaware of the catastrophic reckoning Hamza carries.",
      specialty: "Syndicate Logistics, Shadow Finance, Assassinations, Street Warfare",
      quote: "In Karachi, the police hold the badge, but the street holds the trigger. And in Lyari, the street belongs to Rehman."
    },
    sanjay: {
      name: "S.P. CHOUDHARY ASLAM",
      actor: "Sanjay Dutt",
      codename: "ENCOUNTER BULLET",
      role: "Senior Superintendent of Sindh Police",
      affiliation: "Sindh Police Anti-Extremism Unit // Rogue Enforcer",
      threatLevel: "SEVERE",
      bio: "A feared, swaggering lawman notorious for extra-judicial encounters and explosive shootouts. Wearing aviator sunglasses and holding a cigar amidst bullet smoke, Aslam operates in the gray zone where legal policing dissolves into personal vengeance. His paths cross violently with Hamza.",
      specialty: "Counter-Terrorism Raids, Tactical Interrogation, Heavy Weapons Handling",
      quote: "I don't waste time filing chargesheets. The morgue is the only courtroom with an immediate verdict."
    },
    madhavan: {
      name: "AJAY SANYAL",
      actor: "R. Madhavan",
      codename: "ARCHITECT-01",
      role: "Director of Intelligence Bureau (India)",
      affiliation: "National Security Council // New Delhi",
      threatLevel: "STRATEGIC ASSET",
      bio: "The mastermind who conceived 'Project Dhurandhar' following the trauma of the 1999 Kandahar hijacking and 2001 Parliament attack. Sanyal is a grandmaster playing three-dimensional geopolitical chess against hostile intelligence agencies. Cold, brilliant, and completely devoted to India's defense.",
      specialty: "Geopolitical Strategy, Cyber Wiretaps, Psychological Warfare, Sleeper Cell Management",
      quote: "When a neighbor sets your house on fire, you do not put a lock on the door. You dismantle the hand that struck the match."
    },
    arjun: {
      name: "MAJOR IQBAL",
      actor: "Arjun Rampal",
      codename: "SHADOW-CHIEF",
      role: "Covert Directorate Handler (ISI)",
      affiliation: "Inter-Services Intelligence // External Operations",
      threatLevel: "MASTERMIND (OMEGA)",
      bio: "A sharp, charismatic military intelligence officer who channels state resources through criminal pipelines to finance cross-border strikes. Major Iqbal operates behind bulletproof glass and diplomatic immunity, coordinating proxies while maintaining plausible deniability.",
      specialty: "Asymmetric Warfare, Terror Financing, Cross-Border Logistics, Cryptography",
      quote: "Wars are no longer fought with tanks on open plains. They are won through a hundred tiny papercuts until the giant bleeds out."
    },
    sara: {
      name: "YALINA JAMALI",
      actor: "Sara Arjun",
      codename: "CANARY-9",
      role: "Karachi Local Asset & Safehouse Guardian",
      affiliation: "Karachi Civil Informant Network",
      threatLevel: "CRUCIAL INTEL ASSET",
      bio: "Living in the heart of Karachi, Yalina navigates the high-wire act of surviving in a gang-dominated neighborhood while serving as the vital communication bridge and safe harbor for Hamza during his most dangerous operational hours.",
      specialty: "Dead-drop Relays, Covert Surveillance, Local Linguistics",
      quote: "Trust is a luxury no one in Karachi can afford. Not even with family."
    }
  };

  const dossierModal = document.getElementById('dossier-modal');
  const modalContent = document.getElementById('dossier-modal-content');
  const modalCloseBtn = document.getElementById('dossier-modal-close');

  function openDossier(characterKey) {
    const data = characterDossiers[characterKey];
    if (!data) return;

    audio.playDeclassifyStamp();

    document.getElementById('modal-char-name').textContent = data.name;
    document.getElementById('modal-char-actor').textContent = `PORTRAYED BY: ${data.actor}`;
    document.getElementById('modal-char-codename').textContent = data.codename;
    document.getElementById('modal-char-role').textContent = data.role;
    document.getElementById('modal-char-affiliation').textContent = data.affiliation;
    document.getElementById('modal-char-threat').textContent = data.threatLevel;
    document.getElementById('modal-char-bio').textContent = data.bio;
    document.getElementById('modal-char-specialty').textContent = data.specialty;
    document.getElementById('modal-char-quote').textContent = `"${data.quote}"`;

    dossierModal.classList.remove('hidden');
    dossierModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeDossier() {
    if (!dossierModal) return;
    dossierModal.classList.add('hidden');
    dossierModal.classList.remove('flex');
    document.body.style.overflow = '';
    audio.playBeep(400, 0.05, 'sine', 0.03);
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeDossier);
  }
  if (dossierModal) {
    dossierModal.addEventListener('click', (e) => {
      if (e.target === dossierModal) closeDossier();
    });
  }

  document.querySelectorAll('[data-open-dossier]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const charKey = btn.dataset.openDossier;
      openDossier(charKey);
    });
  });

  // --- INTERACTIVE COMMAND TERMINAL ---
  const terminalInput = document.getElementById('terminal-command-input');
  const terminalOutput = document.getElementById('terminal-command-output');
  const terminalForm = document.getElementById('terminal-form');

  const terminalCommands = {
    help: () => `
COMMANDS AVAILABLE:
  status     - Show current operational status of Operation Dhurandhar
  cast       - Enumerate prime cast & character designations
  intel      - Display declassified intelligence briefing
  director   - Show file on Director Aditya Dhar & franchise roadmap
  part2      - Intel on the sequel: "Dhurandhar: The Revenge" (March 2026)
  audio      - Toggle ambient surveillance soundscape
  clear      - Wipe terminal display
  decrypt    - Execute brute-force cryptographic deciphering
    `,
    status: () => `
[STATUS]: OPERATION DHURANDHAR // ACTIVE LEVEL 9
  - INFILTRATOR: Jaskirat Singh Rangi (Codename: Hamza Mazari)
  - CURRENT LOCATION: Karachi Harbour Berths, Sindh
  - SYNDICATE TARGET: Rehman Dakait (Lyari)
  - ADVERSARY INTEL: Major Iqbal (ISI External Ops)
  - PROTOCOL: Zero State Acknowledgment. If compromised, asset is disavowed.
    `,
    cast: () => `
PRIME OPERATIONAL DOSSIERS:
  1. Ranveer Singh       -> Hamza Ali Mazari / Jaskirat Singh Rangi
  2. Akshaye Khanna      -> Rehman Dakait
  3. Sanjay Dutt         -> S.P. Choudhary Aslam
  4. Arjun Rampal        -> Major Iqbal
  5. R. Madhavan         -> Ajay Sanyal (IB Director)
  6. Sara Arjun          -> Yalina Jamali
  7. Rakesh Bedi         -> Jameel Jamali
  8. Danish Pandor       -> Uzair Baloch
    `,
    intel: () => `
DEEP CLASSIFIED SUMMARY:
  Spanning from the 1999 Kandahar hijacking and 2001 Parliament attack, 
  India's Intelligence Bureau authorizes an unprecedented black-ops doctrine. 
  An operative is injected into the gang wars of Lyari, Karachi, dismantling 
  the syndicate funding state-backed terrorism against Indian cities.
    `,
    director: () => `
VISIONARY FILE: ADITYA DHAR
  - Previous Acclaimed Work: Uri: The Surgical Strike (National Award Winner)
  - Philosophy: Grounded geopolitical realism, visceral tactical combat, unvarnished espionage tension.
  - Scale: Multi-part cinematic universe spanning South Asia's real covert operations.
    `,
    part2: () => `
SEQUEL INTELLIGENCE REPORT:
  - Title: "Dhurandhar: The Revenge"
  - Release Window: March 2026 (Following Part 1's Dec 5, 2025 release)
  - Narrative Arc: Targeted extractions, border neutralization, and final retribution for historical security breaches.
    `,
    audio: () => {
      audio.toggle();
      return `Audio transmitter state toggled: ${audio.isPlaying ? 'TRANSMITTING' : 'SILENCED'}`;
    },
    decrypt: () => {
      startSignalDecryption();
      return `Triggering 256-bit cypher deciphering protocol... Check Section 5 visualizer.`;
    },
    clear: () => {
      if (terminalOutput) terminalOutput.innerHTML = '';
      return null;
    }
  };

  function appendTerminalLine(text, isCommand = false) {
    if (!terminalOutput) return;
    const line = document.createElement('div');
    line.className = isCommand ? 'text-amber-400 font-bold mt-2' : 'text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed';
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  if (terminalForm) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawCmd = terminalInput.value.trim().toLowerCase();
      if (!rawCmd) return;
      terminalInput.value = '';

      appendTerminalLine(`root@raw-node-04:~$ ${rawCmd}`, true);
      audio.playBeep(650, 0.05, 'sine', 0.03);

      if (terminalCommands[rawCmd]) {
        const response = terminalCommands[rawCmd]();
        if (response) appendTerminalLine(response);
      } else {
        appendTerminalLine(`Command not recognized: '${rawCmd}'. Type 'help' for authorized commands.`);
      }
    });
  }

  // Quick terminal helper buttons
  document.querySelectorAll('[data-terminal-cmd]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.terminalCmd;
      if (terminalInput) {
        terminalInput.value = cmd;
        terminalForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  // --- BACKGROUND RADAR CANVAS PARTICLES ---
  const canvas = document.getElementById('radar-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.offsetWidth || 500;
    let height = canvas.height = canvas.parentElement.offsetHeight || 500;

    window.addEventListener('resize', () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth || 500;
      height = canvas.height = canvas.parentElement.offsetHeight || 500;
    });

    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    let sweepAngle = 0;

    function renderRadar() {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(cx, cy) - 20;

      // Draw Range Rings
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius / 4) * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Draw Rotating Sweep Beam
      sweepAngle += 0.02;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, sweepAngle - 0.35, sweepAngle);
      ctx.closePath();
      const sweepGradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
      sweepGradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
      sweepGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();

      // Draw Tactical Blips / Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      requestAnimationFrame(renderRadar);
    }
    renderRadar();
  }

  // --- INTERCEPTED AUDIO WAVEFORM VISUALIZER ---
  const waveCanvas = document.getElementById('waveform-canvas');
  if (waveCanvas) {
    const wCtx = waveCanvas.getContext('2d');
    let wWidth = waveCanvas.width = waveCanvas.parentElement.offsetWidth || 300;
    let wHeight = waveCanvas.height = 60;

    let wavePhase = 0;
    function renderWaveform() {
      wCtx.clearRect(0, 0, wWidth, wHeight);

      wCtx.strokeStyle = '#06b6d4';
      wCtx.lineWidth = 1.8;
      wCtx.shadowBlur = 8;
      wCtx.shadowColor = '#06b6d4';
      wCtx.beginPath();

      const midY = wHeight / 2;
      for (let x = 0; x < wWidth; x++) {
        const freq1 = Math.sin((x * 0.05) + wavePhase);
        const freq2 = Math.sin((x * 0.12) - (wavePhase * 1.5));
        const noise = (Math.random() - 0.5) * 4;
        const y = midY + (freq1 * 12) + (freq2 * 6) + noise;

        if (x === 0) {
          wCtx.moveTo(x, y);
        } else {
          wCtx.lineTo(x, y);
        }
      }
      wCtx.stroke();
      wCtx.shadowBlur = 0;

      wavePhase += 0.08;
      requestAnimationFrame(renderWaveform);
    }
    renderWaveform();
  }

  // Initial greeting
  console.log("%c DHURANDHAR: THE COLD ARCHIVE INITIATED %c", "background:#f59e0b; color:#000; font-weight:bold; padding:4px 8px;", "color:#06b6d4; font-weight:bold;");
})();
