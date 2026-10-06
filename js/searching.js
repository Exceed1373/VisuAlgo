/* ==========================================================
   VisuAlgo PTIK - searching.js
   Logika visualisasi halaman Searching
   ========================================================== */

    let currentAlgorithm = 'binary';
    let dataArray = [12, 19, 25, 33, 42, 57, 68, 74, 88, 95];
    let targetValue = 42;
    let stepCount = 0;
    let comparisonCount = 0;
    let isPlaying = false;
    let playInterval = null;
    let animSpeed = 900;

    let binaryLow = 0;
    let binaryHigh = dataArray.length - 1;
    let binaryMid = -1;
    let binaryFound = false;
    let binaryPhase = 'CALC_MID';

    let linearIndex = 0;
    let linearFound = false;

    const pseudoLinear = [
      { line: 0, text: 'procedure linearSearch(arr, target):' },
      { line: 1, text: '  for i = 0 to length(arr) - 1 do' },
      { line: 2, text: '    if arr[i] == target then' },
      { line: 3, text: '      return i  // Ditemukan' },
      { line: 4, text: '  return -1    // Tidak Ditemukan' }
    ];

    const pseudoBinary = [
      { line: 0, text: 'procedure binarySearch(arr, target):' },
      { line: 1, text: '  low = 0, high = length(arr) - 1' },
      { line: 2, text: '  while low <= high do' },
      { line: 3, text: '    mid = floor((low + high) / 2)' },
      { line: 4, text: '    if arr[mid] == target then return mid' },
      { line: 5, text: '    else if arr[mid] < target then low = mid + 1' },
      { line: 6, text: '    else high = mid - 1' },
      { line: 7, text: '  return -1 // Tidak Ditemukan' }
    ];

    function initVisualizer() {
      updatePseudocodeView();
      renderArray();
      updateMetrics();
      updateTheoreticalStats();
    }

    function setAlgorithm(algo) {
      if (isPlaying) pauseSimulation();
      currentAlgorithm = algo;

      const btnLinear = document.getElementById('btn-algo-linear');
      const btnBinary = document.getElementById('btn-algo-binary');
      const bannerDesc = document.getElementById('smart-banner-desc');
      const legendMid = document.getElementById('legend-mid-tag');
      const compBadge = document.getElementById('complexity-badge-dynamic');

      if (algo === 'linear') {
        btnLinear.className = 'px-space-md py-2 rounded-lg font-headline-sm text-headline-sm transition-all duration-200 flex items-center gap-space-xs bg-primary text-on-primary font-bold shadow-[0_0_15px_rgba(76,215,246,0.35)]';
        btnBinary.className = 'px-space-md py-2 rounded-lg font-headline-sm text-headline-sm transition-all duration-200 flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface';
        bannerDesc.innerText = 'Linear Search menelusuri array satu demi satu dari indeks awal [0] tanpa memerlukan data terurut terlebih dahulu.';
        legendMid.classList.add('hidden');
        compBadge.innerText = 'O(N)';
        compBadge.className = 'font-label-badge text-label-badge uppercase px-space-xs py-0.5 rounded bg-tertiary-container/20 text-tertiary';
      } else {
        btnBinary.className = 'px-space-md py-2 rounded-lg font-headline-sm text-headline-sm transition-all duration-200 flex items-center gap-space-xs bg-primary text-on-primary font-bold shadow-[0_0_15px_rgba(76,215,246,0.35)]';
        btnLinear.className = 'px-space-md py-2 rounded-lg font-headline-sm text-headline-sm transition-all duration-200 flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface';
        bannerDesc.innerText = 'Binary Search memerlukan data terurut secara otomatis sebelum pencarian dijalankan. Setiap langkah mengeliminasi separuh ruang pencarian.';
        legendMid.classList.remove('hidden');
        compBadge.innerText = 'O(log N)';
        compBadge.className = 'font-label-badge text-label-badge uppercase px-space-xs py-0.5 rounded bg-secondary-container/20 text-secondary';
        
        dataArray.sort((a, b) => a - b);
      }

      resetSearchEngine();
      updatePseudocodeView();
      updateTheoreticalStats();
    }

    function updatePseudocodeView(activeLine = -1) {
      const container = document.getElementById('pseudocode-container');
      const lines = currentAlgorithm === 'binary' ? pseudoBinary : pseudoLinear;

      container.innerHTML = lines.map(item => {
        const isActive = item.line === activeLine;
        const lineClass = isActive 
          ? 'bg-primary/20 text-primary font-bold px-2 py-1 rounded shadow-sm' 
          : 'px-2 py-0.5 hover:bg-surface-container-high/40 transition-colors';
        return `<div class="${lineClass}">${item.text}</div>`;
      }).join('');
    }

    function renderArray() {
      const container = document.getElementById('array-container');
      container.innerHTML = '';

      dataArray.forEach((val, idx) => {
        let stateBg = 'bg-surface-container-high text-on-surface';
        let statusTag = '';
        let extraClasses = '';

        if (currentAlgorithm === 'linear') {
          if (linearFound && idx === linearIndex) {
            stateBg = 'bg-secondary text-on-secondary font-bold shadow-[0_0_16px_rgba(78,222,163,0.7)] scale-105';
            statusTag = '<span class="font-label-badge text-label-badge px-1 py-0.5 rounded bg-secondary-container text-on-secondary-container">Ditemukan</span>';
          } else if (idx === linearIndex && stepCount > 0 && !linearFound) {
            stateBg = 'bg-tertiary text-on-tertiary font-bold shadow-[0_0_14px_rgba(255,185,95,0.7)] scale-105';
            statusTag = '<span class="font-label-badge text-label-badge px-1 py-0.5 rounded bg-tertiary-container text-on-tertiary-container">Diperiksa</span>';
          } else if (idx < linearIndex) {
            stateBg = 'bg-surface-container-low text-on-surface-variant opacity-45';
            statusTag = '<span class="font-label-badge text-label-badge text-outline">&ne; Target</span>';
          } else {
            stateBg = 'bg-surface-container text-on-surface';
          }
        } else {
          // Binary Search
          const isOutRange = idx < binaryLow || idx > binaryHigh;
          if (binaryFound && idx === binaryMid) {
            stateBg = 'bg-secondary text-on-secondary font-bold shadow-[0_0_18px_rgba(78,222,163,0.8)] scale-105';
            statusTag = '<span class="font-label-badge text-label-badge px-1 py-0.5 rounded bg-secondary-container text-on-secondary-container">Ditemukan</span>';
          } else if (idx === binaryMid) {
            stateBg = 'bg-tertiary-container text-on-tertiary font-bold shadow-[0_0_15px_rgba(231,148,0,0.8)] scale-105';
            statusTag = '<span class="font-label-badge text-label-badge px-1 py-0.5 rounded bg-tertiary text-on-tertiary">Mid (Tengah)</span>';
          } else if (idx === binaryLow && idx === binaryHigh) {
            statusTag = '<span class="font-label-badge text-label-badge px-1 py-0.5 rounded bg-primary-container text-on-primary-container">Low & High</span>';
            stateBg = 'bg-surface-container-high text-primary';
          } else if (idx === binaryLow) {
            statusTag = '<span class="font-label-badge text-label-badge px-1 py-0.5 rounded bg-primary-container text-on-primary-container">Low [' + idx + ']</span>';
          } else if (idx === binaryHigh) {
            statusTag = '<span class="font-label-badge text-label-badge px-1 py-0.5 rounded bg-primary-container text-on-primary-container">High [' + idx + ']</span>';
          }

          if (isOutRange && !binaryFound) {
            stateBg = 'bg-surface-container-lowest text-on-surface-variant opacity-35';
            extraClasses = 'grayscale';
          }
        }

        const cell = document.createElement('div');
        cell.className = `flex flex-col items-center gap-1.5 transition-all duration-300 min-w-[54px] md:min-w-[64px] ${extraClasses}`;
        cell.innerHTML = `
          <div class="h-6 flex items-center justify-center">${statusTag}</div>
          <div class="w-full h-16 md:h-20 rounded-xl flex items-center justify-center font-headline-md text-headline-md tracking-tight ${stateBg} transition-all duration-300">
            ${val}
          </div>
          <div class="font-label-mono text-label-mono text-outline-variant">[${idx}]</div>
        `;
        container.appendChild(cell);
      });

      document.getElementById('label-dataset-size').innerText = `N = ${dataArray.length} Elemen`;
      document.getElementById('trace-val-target').innerText = targetValue;
    }

    function stepSearch() {
      if (currentAlgorithm === 'linear') {
        stepLinear();
      } else {
        stepBinary();
      }
      renderArray();
      updateMetrics();
    }

    function stepLinear() {
      if (linearFound || linearIndex >= dataArray.length) {
        pauseSimulation();
        return;
      }

      stepCount++;
      comparisonCount++;
      const currentVal = dataArray[linearIndex];

      document.getElementById('trace-step-title').innerHTML = `<span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span><span>LANGKAH ${stepCount}: EVALUASI INDEKS [${linearIndex}]</span>`;
      document.getElementById('trace-badge-idx').innerText = `Indeks [${linearIndex}]: Nilai = ${currentVal}`;
      updatePseudocodeView(2);

      if (currentVal === targetValue) {
        linearFound = true;
        updatePseudocodeView(3);
        document.getElementById('trace-step-narrative').innerHTML = `<strong class="text-secondary">PENCARIAN BERHASIL!</strong> Elemen target <strong>${targetValue}</strong> ditemukan tepat pada indeks <strong>[${linearIndex}]</strong> setelah <strong>${comparisonCount}</strong> komparasi.`;
        document.getElementById('metric-status-pill').innerText = `Ditemukan di [${linearIndex}]`;
        document.getElementById('metric-status-pill').className = 'font-label-badge text-label-badge uppercase px-space-sm py-1 rounded-full bg-secondary-container/30 text-secondary font-bold';
        pauseSimulation();
      } else {
        document.getElementById('trace-step-narrative').innerHTML = `Membandingkan <code>arr[${linearIndex}] = ${currentVal}</code> dengan target <code>${targetValue}</code>. Tidak cocok (&ne;). Geser pointer indeks maju ke kanan (i++).`;
        linearIndex++;
        if (linearIndex >= dataArray.length) {
          updatePseudocodeView(4);
          document.getElementById('trace-step-narrative').innerHTML = `<strong class="text-error">TIDAK DITEMUKAN!</strong> Seluruh elemen hingga akhir array telah diperiksa dan target <strong>${targetValue}</strong> tidak ada dalam dataset.`;
          document.getElementById('metric-status-pill').innerText = 'Tidak Ditemukan';
          document.getElementById('metric-status-pill').className = 'font-label-badge text-label-badge uppercase px-space-sm py-1 rounded-full bg-error-container/30 text-error font-bold';
          pauseSimulation();
        }
      }
    }

    function stepBinary() {
      if (binaryFound || binaryLow > binaryHigh) {
        pauseSimulation();
        return;
      }

      if (binaryPhase === 'CALC_MID') {
        stepCount++;
        binaryMid = Math.floor((binaryLow + binaryHigh) / 2);
        updatePseudocodeView(3);
        document.getElementById('trace-step-title').innerHTML = `<span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span><span>LANGKAH ${stepCount}: KALKULASI POROS TENGAH</span>`;
        document.getElementById('trace-step-narrative').innerHTML = `Rentang aktif indeks saat ini: <code>[${binaryLow} .. ${binaryHigh}]</code>. Poros tengah: <code>mid = floor((${binaryLow} + ${binaryHigh}) / 2) = ${binaryMid}</code> (Nilai: <strong>${dataArray[binaryMid]}</strong>).`;
        document.getElementById('trace-badge-idx').innerText = `Rentang: [${binaryLow}..${binaryHigh}] &bull; Mid: [${binaryMid}]`;
        binaryPhase = 'COMPARE';
      } else if (binaryPhase === 'COMPARE') {
        comparisonCount++;
        const midVal = dataArray[binaryMid];

        if (midVal === targetValue) {
          binaryFound = true;
          updatePseudocodeView(4);
          document.getElementById('trace-step-title').innerHTML = `<span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span><span>LANGKAH ${stepCount}: KECOCOKAN DITEMUKAN</span>`;
          document.getElementById('trace-step-narrative').innerHTML = `<strong class="text-secondary">TARGET COCOK!</strong> Nilai poros <code>arr[${binaryMid}] = ${midVal}</code> sama persis dengan target <code>${targetValue}</code>. Pencarian selesai secara optimal.`;
          document.getElementById('metric-status-pill').innerText = `Ditemukan di [${binaryMid}]`;
          document.getElementById('metric-status-pill').className = 'font-label-badge text-label-badge uppercase px-space-sm py-1 rounded-full bg-secondary-container/30 text-secondary font-bold';
          pauseSimulation();
        } else if (midVal < targetValue) {
          updatePseudocodeView(5);
          document.getElementById('trace-step-title').innerHTML = `<span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span><span>LANGKAH ${stepCount}: PERGESERAN INTERVAL KANAN</span>`;
          document.getElementById('trace-step-narrative').innerHTML = `<code>arr[${binaryMid}] = ${midVal} < ${targetValue}</code>. Karena data terurut naik, target pasti berada di separuh kanan. Eliminasi sub-array kiri, perbarui <code>low = mid + 1 = ${binaryMid + 1}</code>.`;
          binaryLow = binaryMid + 1;
          binaryPhase = 'CALC_MID';
        } else {
          updatePseudocodeView(6);
          document.getElementById('trace-step-title').innerHTML = `<span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span><span>LANGKAH ${stepCount}: PERGESERAN INTERVAL KIRI</span>`;
          document.getElementById('trace-step-narrative').innerHTML = `<code>arr[${binaryMid}] = ${midVal} > ${targetValue}</code>. Target lebih kecil daripada poros tengah. Eliminasi sub-array kanan, perbarui <code>high = mid - 1 = ${binaryMid - 1}</code>.`;
          binaryHigh = binaryMid - 1;
          binaryPhase = 'CALC_MID';
        }

        if (binaryLow > binaryHigh && !binaryFound) {
          updatePseudocodeView(7);
          document.getElementById('trace-step-narrative').innerHTML = `<strong class="text-error">TIDAK DITEMUKAN!</strong> Interval menyusut sepenuhnya (<code>low > high</code>). Target <strong>${targetValue}</strong> tidak ada dalam struktur data.`;
          document.getElementById('metric-status-pill').innerText = 'Tidak Ditemukan';
          document.getElementById('metric-status-pill').className = 'font-label-badge text-label-badge uppercase px-space-sm py-1 rounded-full bg-error-container/30 text-error font-bold';
          pauseSimulation();
        }
      }
    }

    function handlePlayToggle() {
      if (isPlaying) {
        pauseSimulation();
      } else {
        startSimulation();
      }
    }

    function startSimulation() {
      if ((currentAlgorithm === 'linear' && (linearFound || linearIndex >= dataArray.length)) ||
          (currentAlgorithm === 'binary' && (binaryFound || binaryLow > binaryHigh))) {
        resetSearchEngine();
      }

      isPlaying = true;
      document.getElementById('btn-play-text').innerText = 'Jeda';
      document.getElementById('btn-play-icon').innerText = 'pause';
      document.getElementById('btn-play').className = 'px-space-lg py-2.5 rounded-lg bg-tertiary hover:bg-tertiary-container text-on-tertiary font-headline-sm text-headline-sm font-bold flex items-center gap-space-xs shadow-[0_0_20px_rgba(255,185,95,0.4)] transition-all';
      document.getElementById('metric-status-pill').innerText = 'Sedang Menelusuri...';
      document.getElementById('metric-status-pill').className = 'font-label-badge text-label-badge uppercase px-space-sm py-1 rounded-full bg-primary-container/20 text-primary font-bold';

      playInterval = setInterval(() => {
        stepSearch();
      }, animSpeed);
    }

    function pauseSimulation() {
      isPlaying = false;
      clearInterval(playInterval);
      playInterval = null;
      document.getElementById('btn-play-text').innerText = 'Mulai Cari';
      document.getElementById('btn-play-icon').innerText = 'play_arrow';
      document.getElementById('btn-play').className = 'px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold flex items-center gap-space-xs shadow-[0_0_20px_rgba(76,215,246,0.35)] transition-all';
    }

    function resetSearchEngine() {
      pauseSimulation();
      stepCount = 0;
      comparisonCount = 0;
      linearIndex = 0;
      linearFound = false;

      binaryLow = 0;
      binaryHigh = dataArray.length - 1;
      binaryMid = -1;
      binaryFound = false;
      binaryPhase = 'CALC_MID';

      document.getElementById('metric-steps').innerText = '0';
      document.getElementById('metric-comps').innerText = '0';
      document.getElementById('metric-status-pill').innerText = 'Siap Dijalankan';
      document.getElementById('metric-status-pill').className = 'font-label-badge text-label-badge uppercase px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface';

      document.getElementById('trace-step-title').innerHTML = '<span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span><span>LANGKAH 0: INITIALIZATION</span>';
      document.getElementById('trace-step-narrative').innerText = 'Simulator telah direset. Silakan tentukan target pencarian lalu jalankan penelusuran.';
      document.getElementById('trace-badge-idx').innerText = 'Indeks: -';

      updatePseudocodeView();
      renderArray();
    }

    function applyTargetFromInput() {
      const val = parseInt(document.getElementById('input-target').value, 10);
      if (!isNaN(val)) {
        targetValue = val;
        resetSearchEngine();
      }
    }

    function generateRandomData() {
      const size = 10;
      const set = new Set();
      while (set.size < size) {
        set.add(Math.floor(Math.random() * 95) + 5);
      }
      dataArray = Array.from(set);
      if (currentAlgorithm === 'binary') {
        dataArray.sort((a, b) => a - b);
      }
      // Set target to an existing element or nearby
      targetValue = dataArray[Math.floor(Math.random() * dataArray.length)];
      document.getElementById('input-target').value = targetValue;
      resetSearchEngine();
      updateTheoreticalStats();
    }

    function shuffleTarget() {
      targetValue = dataArray[Math.floor(Math.random() * dataArray.length)];
      document.getElementById('input-target').value = targetValue;
      resetSearchEngine();
    }

    function promptManualData() {
      const currentStr = dataArray.join(', ');
      const input = prompt('Masukkan daftar angka dipisahkan koma (maks 14 angka):', currentStr);
      if (input !== null) {
        const parsed = input.split(',')
          .map(x => parseInt(x.trim(), 10))
          .filter(x => !isNaN(x));
        
        if (parsed.length >= 3) {
          dataArray = parsed.slice(0, 14);
          if (currentAlgorithm === 'binary') {
            dataArray.sort((a, b) => a - b);
          }
          if (!dataArray.includes(targetValue)) {
            targetValue = dataArray[0];
            document.getElementById('input-target').value = targetValue;
          }
          resetSearchEngine();
          updateTheoreticalStats();
        } else {
          alert('Mohon masukkan minimal 3 angka valid.');
        }
      }
    }

    function updateSpeed(val) {
      animSpeed = 2100 - parseInt(val, 10);
      document.getElementById('speed-label').innerText = (animSpeed / 1000).toFixed(1) + 's';
      if (isPlaying) {
        pauseSimulation();
        startSimulation();
      }
    }

    function updateMetrics() {
      document.getElementById('metric-steps').innerText = stepCount;
      document.getElementById('metric-comps').innerText = comparisonCount;
    }

    function updateTheoreticalStats() {
      const n = dataArray.length;
      document.getElementById('metric-n-elements').innerText = n;
      if (currentAlgorithm === 'binary') {
        const maxSteps = Math.ceil(Math.log2(n + 1));
        document.getElementById('metric-max-steps').innerText = maxSteps;
        document.getElementById('metric-max-steps-formula').innerText = `⌈log2(${n})⌉ komparasi maksimal`;
      } else {
        document.getElementById('metric-max-steps').innerText = n;
        document.getElementById('metric-max-steps-formula').innerText = `${n} komparasi sekuensial (N)`;
      }
    }

    // Init on execution
    initVisualizer();
  
