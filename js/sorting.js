/* ==========================================================
   VisuAlgo PTIK - sorting.js
   Logika visualisasi halaman Sorting
   ========================================================== */

(function() {
  // Pseudocode Database
  const pseudocodes = {
    bubble: [
      { text: "procedure bubbleSort(A : list of sortable items)", id: 0 },
      { text: "  n = length(A)", id: 1 },
      { text: "  repeat", id: 2 },
      { text: "    swapped = false", id: 3 },
      { text: "    for i = 1 to n-1 inclusive do", id: 4 },
      { text: "      if A[i-1] > A[i] then", id: 5 },
      { text: "        swap(A[i-1], A[i])", id: 6 },
      { text: "        swapped = true", id: 7 },
      { text: "      end if", id: 8 },
      { text: "    end for", id: 9 },
      { text: "    n = n - 1", id: 10 },
      { text: "  until not swapped", id: 11 },
      { text: "end procedure", id: 12 }
    ],
    selection: [
      { text: "procedure selectionSort(A : list of items)", id: 0 },
      { text: "  n = length(A)", id: 1 },
      { text: "  for i = 0 to n-2 do", id: 2 },
      { text: "    min_idx = i", id: 3 },
      { text: "    for j = i+1 to n-1 do", id: 4 },
      { text: "      if A[j] < A[min_idx] then min_idx = j", id: 5 },
      { text: "    end for", id: 6 },
      { text: "    if min_idx != i then swap(A[i], A[min_idx])", id: 7 },
      { text: "  end for", id: 8 },
      { text: "end procedure", id: 9 }
    ],
    insertion: [
      { text: "procedure insertionSort(A : list of items)", id: 0 },
      { text: "  for i = 1 to length(A)-1 do", id: 1 },
      { text: "    key = A[i]", id: 2 },
      { text: "    j = i - 1", id: 3 },
      { text: "    while j >= 0 and A[j] > key do", id: 4 },
      { text: "      A[j + 1] = A[j]", id: 5 },
      { text: "      j = j - 1", id: 6 },
      { text: "    end while", id: 7 },
      { text: "    A[j + 1] = key", id: 8 },
      { text: "  end for", id: 9 },
      { text: "end procedure", id: 10 }
    ],
    quick: [
      { text: "procedure quickSort(A, low, high)", id: 0 },
      { text: "  if low < high then", id: 1 },
      { text: "    p = partition(A, low, high)", id: 2 },
      { text: "    quickSort(A, low, p - 1)", id: 3 },
      { text: "    quickSort(A, p + 1, high)", id: 4 },
      { text: "  end if", id: 5 },
      { text: "end procedure", id: 6 }
    ],
    merge: [
      { text: "procedure mergeSort(A, left, right)", id: 0 },
      { text: "  if left < right then", id: 1 },
      { text: "    mid = (left + right) / 2", id: 2 },
      { text: "    mergeSort(A, left, mid)", id: 3 },
      { text: "    mergeSort(A, mid + 1, right)", id: 4 },
      { text: "    merge(A, left, mid, right)", id: 5 },
      { text: "  end if", id: 6 },
      { text: "end procedure", id: 7 }
    ]
  };

  // State Variables
  let currentAlgo = 'bubble';
  let array = [80, 30, 55, 42, 19, 73, 95, 12, 64, 48];
  let isRunning = false;
  let isPaused = false;
  let executionSteps = [];
  let currentStepIdx = 0;
  let timerId = null;
  let comparisons = 0;
  let swaps = 0;
  let soundEnabled = true;

  // Audio Context for Educational Feedback Clicks
  let audioCtx = null;
  function playBeep(freq = 440) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch(e) {}
  }

  // DOM Elements
  const chartContainer = document.getElementById('chartContainer');
  const compareCountEl = document.getElementById('compareCount');
  const swapCountEl = document.getElementById('swapCount');
  const logHeadlineEl = document.getElementById('logHeadline');
  const logDetailEl = document.getElementById('logDetail');
  const pseudocodeContainer = document.getElementById('pseudocodeContainer');
  const activeAlgoBadge = document.getElementById('activeAlgoBadge');
  const currentPointersEl = document.getElementById('currentPointers');
  const activePassIndicator = document.getElementById('activePassIndicator');
  const speedSlider = document.getElementById('speedSlider');
  const sizeSlider = document.getElementById('sizeSlider');
  const sizeValueEl = document.getElementById('sizeValue');
  const customArrayInput = document.getElementById('customArrayInput');

  // Render Pseudocode
  function renderPseudocode(algo) {
    pseudocodeContainer.innerHTML = '';
    const lines = pseudocodes[algo] || [];
    lines.forEach((lineObj, idx) => {
      const lineDiv = document.createElement('div');
      lineDiv.id = `code-line-${idx}`;
      lineDiv.className = 'py-0.5 px-2 rounded font-code-block transition-colors flex items-center gap-3';
      lineDiv.innerHTML = `
        <span class="text-outline-variant font-label-mono text-[11px] w-5 text-right select-none">${idx + 1}</span>
        <span class="flex-1 whitespace-pre">${escapeHtml(lineObj.text)}</span>
      `;
      pseudocodeContainer.appendChild(lineDiv);
    });
  }

  function highlightLine(lineIdx) {
    document.querySelectorAll('#pseudocodeContainer > div').forEach(el => {
      el.className = 'py-0.5 px-2 rounded font-code-block transition-colors flex items-center gap-3 text-on-surface-variant';
    });
    if (lineIdx !== null && lineIdx !== undefined) {
      const target = document.getElementById(`code-line-${lineIdx}`);
      if (target) {
        target.className = 'py-0.5 px-2 rounded font-code-block transition-colors flex items-center gap-3 bg-primary/10 text-primary font-semibold border-l-2 border-primary';
      }
    }
  }

  function escapeHtml(string) {
    return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Render Bars
  function renderBars(highlightIndices = {}, stateColors = {}) {
    chartContainer.innerHTML = '';
    const maxVal = Math.max(...array, 100);

    array.forEach((val, idx) => {
      const barWrapper = document.createElement('div');
      barWrapper.className = 'flex flex-col items-center flex-1 h-full justify-end max-w-[48px] min-w-[14px] group';

      const barHeightPct = Math.max(12, Math.round((val / maxVal) * 92));
      
      // Determine bar color
      let colorClass = 'bg-primary text-on-primary-container shadow-[0_0_12px_rgba(76,215,246,0.35)]';
      if (stateColors[idx]) {
        if (stateColors[idx] === 'compare') {
          colorClass = 'bg-tertiary text-on-tertiary-container shadow-[0_0_14px_rgba(255,185,95,0.7)] scale-y-105';
        } else if (stateColors[idx] === 'swap' || stateColors[idx] === 'pivot') {
          colorClass = 'bg-error text-on-error shadow-[0_0_15px_rgba(255,180,171,0.8)] scale-y-105';
        } else if (stateColors[idx] === 'sorted') {
          colorClass = 'bg-secondary text-on-secondary shadow-[0_0_12px_rgba(78,222,163,0.5)]';
        }
      }

      barWrapper.innerHTML = `
        <span class="font-label-mono text-[11px] mb-1 font-bold text-on-surface opacity-90 transition-transform ${highlightIndices[idx] ? 'text-primary scale-110' : ''}">${val}</span>
        <div style="height: ${barHeightPct}%;" class="w-full rounded-t-md transition-all duration-150 flex items-start justify-center pt-1 ${colorClass}">
          <span class="text-[9px] font-label-mono opacity-60 hidden md:block"></span>
        </div>
        <span class="font-label-mono text-[10px] text-outline mt-1 hidden sm:block">${idx}</span>
      `;
      chartContainer.appendChild(barWrapper);
    });
  }

  // Step Generators
  function generateSteps() {
    executionSteps = [];
    const arrCopy = [...array];
    const n = arrCopy.length;

    if (currentAlgo === 'bubble') {
      let swapped;
      let totalPasses = 0;
      for (let i = 0; i < n - 1; i++) {
        swapped = false;
        totalPasses++;
        for (let j = 0; j < n - i - 1; j++) {
          // Compare step
          executionSteps.push({
            type: 'compare',
            indices: [j, j + 1],
            arr: [...arrCopy],
            codeLine: 5,
            pass: `${i + 1}/${n - 1}`,
            logTitle: `Komparasi Nilai: Indeks [${j}] & [${j+1}]`,
            logDesc: `Bandingkan ${arrCopy[j]} dengan ${arrCopy[j + 1]}. Apakah ${arrCopy[j]} > ${arrCopy[j + 1]}?`
          });

          if (arrCopy[j] > arrCopy[j + 1]) {
            const temp = arrCopy[j];
            arrCopy[j] = arrCopy[j + 1];
            arrCopy[j + 1] = temp;
            swapped = true;

            executionSteps.push({
              type: 'swap',
              indices: [j, j + 1],
              arr: [...arrCopy],
              codeLine: 6,
              pass: `${i + 1}/${n - 1}`,
              logTitle: `Tukar Elemen (Swap)!`,
              logDesc: `${arrCopy[j + 1]} > ${arrCopy[j]}, lakukan penukaran posisi memori.`
            });
          }
        }
        executionSteps.push({
          type: 'markSorted',
          sortedIndex: n - 1 - i,
          arr: [...arrCopy],
          codeLine: 10,
          pass: `${i + 1}/${n - 1}`,
          logTitle: `Elemen Posisi Akhir Terkunci`,
          logDesc: `Elemen terbesar di iterasi ini (${arrCopy[n - 1 - i]}) sudah menempati posisi terurut absolut.`
        });
        if (!swapped) break;
      }
    } else if (currentAlgo === 'selection') {
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        executionSteps.push({
          type: 'compare',
          indices: [i, minIdx],
          arr: [...arrCopy],
          codeLine: 3,
          pass: `${i + 1}/${n - 1}`,
          logTitle: `Inisialisasi Nilai Minimum Baru`,
          logDesc: `Asumsikan indeks awal ${i} bernilai (${arrCopy[i]}) sebagai minimum sementara.`
        });

        for (let j = i + 1; j < n; j++) {
          executionSteps.push({
            type: 'compare',
            indices: [j, minIdx],
            arr: [...arrCopy],
            codeLine: 5,
            pass: `${i + 1}/${n - 1}`,
            logTitle: `Pindai Minimum Sisa Array`,
            logDesc: `Cek apakah ${arrCopy[j]} < ${arrCopy[minIdx]} (nilai min sekarang).`
          });
          if (arrCopy[j] < arrCopy[minIdx]) {
            minIdx = j;
            executionSteps.push({
              type: 'highlight',
              indices: [minIdx],
              arr: [...arrCopy],
              codeLine: 5,
              pass: `${i + 1}/${n - 1}`,
              logTitle: `Ditemukan Kandidat Minimum Baru`,
              logDesc: `Nilai minimum sementara kini diperbarui ke ${arrCopy[minIdx]} pada indeks [${minIdx}].`
            });
          }
        }

        if (minIdx !== i) {
          const temp = arrCopy[i];
          arrCopy[i] = arrCopy[minIdx];
          arrCopy[minIdx] = temp;
          executionSteps.push({
            type: 'swap',
            indices: [i, minIdx],
            arr: [...arrCopy],
            codeLine: 7,
            pass: `${i + 1}/${n - 1}`,
            logTitle: `Tukar Minimum ke Indeks [${i}]`,
            logDesc: `Tukar posisi ${arrCopy[minIdx]} dan ${arrCopy[i]}.`
          });
        }
        executionSteps.push({
          type: 'markSorted',
          sortedIndex: i,
          arr: [...arrCopy],
          codeLine: 8,
          pass: `${i + 1}/${n - 1}`,
          logTitle: `Indeks [${i}] Selesai`,
          logDesc: `Posisi ${i} kini telah memegang nilai minimum pasti.`
        });
      }
    } else if (currentAlgo === 'insertion') {
      for (let i = 1; i < n; i++) {
        let key = arrCopy[i];
        let j = i - 1;
        executionSteps.push({
          type: 'compare',
          indices: [i],
          arr: [...arrCopy],
          codeLine: 2,
          pass: `${i}/${n - 1}`,
          logTitle: `Simpan Key: ${key}`,
          logDesc: `Ambil elemen indeks [${i}] = ${key} untuk disisipkan ke bagian array kiri yang sudah terurut.`
        });

        while (j >= 0 && arrCopy[j] > key) {
          executionSteps.push({
            type: 'compare',
            indices: [j, j + 1],
            arr: [...arrCopy],
            codeLine: 4,
            pass: `${i}/${n - 1}`,
            logTitle: `Bandingkan Key dengan ${arrCopy[j]}`,
            logDesc: `Karena ${arrCopy[j]} > ${key}, geser ${arrCopy[j]} satu posisi ke kanan.`
          });

          arrCopy[j + 1] = arrCopy[j];
          executionSteps.push({
            type: 'swap',
            indices: [j, j + 1],
            arr: [...arrCopy],
            codeLine: 5,
            pass: `${i}/${n - 1}`,
            logTitle: `Geser Nilai ke Kanan`,
            logDesc: `Indeks [${j + 1}] kini diisi oleh nilai ${arrCopy[j]}.`
          });
          j--;
        }
        arrCopy[j + 1] = key;
        executionSteps.push({
          type: 'highlight',
          indices: [j + 1],
          arr: [...arrCopy],
          codeLine: 8,
          pass: `${i}/${n - 1}`,
          logTitle: `Sisipkan Key ${key}`,
          logDesc: `Tempatkan key (${key}) pada celah slot indeks [${j + 1}].`
        });
      }
    } else if (currentAlgo === 'quick') {
      function partition(low, high) {
        let pivot = arrCopy[high];
        executionSteps.push({
          type: 'highlight',
          indices: [high],
          arr: [...arrCopy],
          codeLine: 2,
          pass: `Partisi [${low}-${high}]`,
          logTitle: `Pilih Pivot: ${pivot}`,
          logDesc: `Gunakan elemen terakhir indeks [${high}] bernilai ${pivot} sebagai pembagi partisi.`
        });

        let i = low - 1;
        for (let j = low; j < high; j++) {
          executionSteps.push({
            type: 'compare',
            indices: [j, high],
            arr: [...arrCopy],
            codeLine: 2,
            pass: `Partisi [${low}-${high}]`,
            logTitle: `Bandingkan ${arrCopy[j]} vs Pivot (${pivot})`,
            logDesc: `Periksa apakah elemen ${arrCopy[j]} lebih kecil atau sama dengan pivot.`
          });

          if (arrCopy[j] <= pivot) {
            i++;
            const temp = arrCopy[i];
            arrCopy[i] = arrCopy[j];
            arrCopy[j] = temp;
            executionSteps.push({
              type: 'swap',
              indices: [i, j],
              arr: [...arrCopy],
              codeLine: 2,
              pass: `Partisi [${low}-${high}]`,
              logTitle: `Tukar Elemen ke Zona Kiri`,
              logDesc: `Pindahkan ${arrCopy[i]} ke batas zona kiri pivot.`
            });
          }
        }
        const temp = arrCopy[i + 1];
        arrCopy[i + 1] = arrCopy[high];
        arrCopy[high] = temp;
        executionSteps.push({
          type: 'swap',
          indices: [i + 1, high],
          arr: [...arrCopy],
          codeLine: 2,
          pass: `Pivot Fix`,
          logTitle: `Tempatkan Pivot di Posisi Akhir`,
          logDesc: `Pivot ${pivot} ditaruh pada indeks [${i + 1}]. Elemen di kiri pasti <= pivot, di kanan >= pivot.`
        });
        return i + 1;
      }

      function qSort(low, high) {
        if (low < high) {
          let pi = partition(low, high);
          qSort(low, pi - 1);
          qSort(pi + 1, high);
        }
      }
      qSort(0, n - 1);
    } else if (currentAlgo === 'merge') {
      function merge(l, m, r) {
        let n1 = m - l + 1;
        let n2 = r - m;
        let L = [];
        let R = [];
        for (let i = 0; i < n1; i++) L.push(arrCopy[l + i]);
        for (let j = 0; j < n2; j++) R.push(arrCopy[m + 1 + j]);

        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
          executionSteps.push({
            type: 'compare',
            indices: [k, m + 1 + j],
            arr: [...arrCopy],
            codeLine: 5,
            pass: `Merge [${l}-${r}]`,
            logTitle: `Gabungkan Dua Bagian Sub-Array`,
            logDesc: `Bandingkan ${L[i]} (kiri) dengan ${R[j]} (kanan).`
          });
          if (L[i] <= R[j]) {
            arrCopy[k] = L[i];
            i++;
          } else {
            arrCopy[k] = R[j];
            j++;
          }
          executionSteps.push({
            type: 'swap',
            indices: [k],
            arr: [...arrCopy],
            codeLine: 5,
            pass: `Merge [${l}-${r}]`,
            logTitle: `Salin Elemen Terkecil ke Indeks [${k}]`,
            logDesc: `Nilai ${arrCopy[k]} ditulis ke array utama.`
          });
          k++;
        }
        while (i < n1) {
          arrCopy[k] = L[i];
          executionSteps.push({
            type: 'swap',
            indices: [k],
            arr: [...arrCopy],
            codeLine: 5,
            pass: `Sisa Kiri`,
            logTitle: `Salin Sisa Kiri ke [${k}]`,
            logDesc: `Salin ${L[i]} ke posisi ${k}.`
          });
          i++; k++;
        }
        while (j < n2) {
          arrCopy[k] = R[j];
          executionSteps.push({
            type: 'swap',
            indices: [k],
            arr: [...arrCopy],
            codeLine: 5,
            pass: `Sisa Kanan`,
            logTitle: `Salin Sisa Kanan ke [${k}]`,
            logDesc: `Salin ${R[j]} ke posisi ${k}.`
          });
          j++; k++;
        }
      }

      function mSort(l, r) {
        if (l < r) {
          let m = Math.floor((l + r) / 2);
          mSort(l, m);
          mSort(m + 1, r);
          merge(l, m, r);
        }
      }
      mSort(0, n - 1);
    }

    // Step finish: mark all sorted
    executionSteps.push({
      type: 'complete',
      indices: [],
      arr: [...arrCopy],
      codeLine: null,
      pass: 'Selesai 100%',
      logTitle: `Pengurutan Berhasil Selesai!`,
      logDesc: `Seluruh elemen berhasil diurutkan secara ascending (dari terkecil ke terbesar).`
    });
  }

  // Execute Step by Step
  let sortedStateIndices = new Set();

  function applyStep(step) {
    if (!step) return;
    array = [...step.arr];

    const stateColors = {};
    const highlights = {};

    sortedStateIndices.forEach(idx => stateColors[idx] = 'sorted');

    if (step.type === 'compare') {
      comparisons++;
      compareCountEl.textContent = comparisons;
      if (step.indices) {
        step.indices.forEach(idx => {
          stateColors[idx] = 'compare';
          highlights[idx] = true;
        });
        currentPointersEl.textContent = `i: ${step.indices[0]} | j: ${step.indices[1] !== undefined ? step.indices[1] : '-'}`;
      }
      playBeep(320);
    } else if (step.type === 'swap') {
      swaps++;
      swapCountEl.textContent = swaps;
      if (step.indices) {
        step.indices.forEach(idx => {
          stateColors[idx] = 'swap';
          highlights[idx] = true;
        });
      }
      playBeep(640);
    } else if (step.type === 'markSorted') {
      if (step.sortedIndex !== undefined) {
        sortedStateIndices.add(step.sortedIndex);
        stateColors[step.sortedIndex] = 'sorted';
      }
      playBeep(880);
    } else if (step.type === 'highlight') {
      if (step.indices) {
        step.indices.forEach(idx => {
          stateColors[idx] = 'pivot';
          highlights[idx] = true;
        });
      }
      playBeep(520);
    } else if (step.type === 'complete') {
      for (let i = 0; i < array.length; i++) stateColors[i] = 'sorted';
      currentPointersEl.textContent = 'Status: Terminated (Clean)';
      playBeep(980);
    }

    renderBars(highlights, stateColors);
    highlightLine(step.codeLine);

    logHeadlineEl.textContent = step.logTitle || 'Iterasi Algoritma';
    logDetailEl.textContent = step.logDesc || '-';
    activePassIndicator.textContent = `Status: ${step.pass || '-'}`;
  }

  function play() {
    if (isRunning) return;
    if (executionSteps.length === 0 || currentStepIdx >= executionSteps.length) {
      resetState(false);
      generateSteps();
      currentStepIdx = 0;
    }
    isRunning = true;
    isPaused = false;
    document.getElementById('startSortBtn').classList.add('opacity-75');

    function runLoop() {
      if (!isRunning) return;
      if (currentStepIdx < executionSteps.length) {
        applyStep(executionSteps[currentStepIdx]);
        currentStepIdx++;
        const delay = 620 - parseInt(speedSlider.value, 10);
        timerId = setTimeout(runLoop, Math.max(30, delay));
      } else {
        stopSort();
      }
    }
    runLoop();
  }

  function pause() {
    isRunning = false;
    isPaused = true;
    clearTimeout(timerId);
    document.getElementById('startSortBtn').classList.remove('opacity-75');
    logHeadlineEl.textContent = "Eksekusi Dijeda (Paused)";
    logDetailEl.textContent = "Gunakan tombol 'Langkah' untuk step debugging manual atau 'Mulai' untuk melanjutkan.";
  }

  function stepForward() {
    pause();
    if (executionSteps.length === 0 || currentStepIdx >= executionSteps.length) {
      resetState(false);
      generateSteps();
      currentStepIdx = 0;
    }
    if (currentStepIdx < executionSteps.length) {
      applyStep(executionSteps[currentStepIdx]);
      currentStepIdx++;
    }
  }

  function stopSort() {
    isRunning = false;
    isPaused = false;
    clearTimeout(timerId);
    document.getElementById('startSortBtn').classList.remove('opacity-75');
  }

  function resetState(regenerateArray = false) {
    stopSort();
    comparisons = 0;
    swaps = 0;
    currentStepIdx = 0;
    executionSteps = [];
    sortedStateIndices.clear();
    compareCountEl.textContent = '0';
    swapCountEl.textContent = '0';
    currentPointersEl.textContent = 'i: null | j: null';
    activePassIndicator.textContent = 'Pass: 0/0';
    highlightLine(null);

    if (regenerateArray) {
      const n = parseInt(sizeSlider.value, 10);
      array = Array.from({ length: n }, () => Math.floor(Math.random() * 85) + 12);
      customArrayInput.value = array.join(', ');
    }
    renderBars();
    logHeadlineEl.textContent = "State Di-Reset";
    logDetailEl.textContent = `Algoritma: ${currentAlgo.toUpperCase()} siap dieksekusi dengan dataset ${array.length} elemen.`;
  }

  // Algorithm Switching
  function setAlgorithm(algoKey) {
    currentAlgo = algoKey;
    activeAlgoBadge.textContent = `${algoKey.toUpperCase()} SORT`;

    // Highlight card
    document.querySelectorAll('.algo-card').forEach(card => {
      const isSelected = card.dataset.algo === algoKey;
      card.classList.toggle('bg-surface-container-high', isSelected);
      card.classList.toggle('bg-surface-container-low', !isSelected);
      card.classList.toggle('shadow-md', isSelected);
      const icon = card.querySelector('.check-icon');
      if (icon) icon.style.opacity = isSelected ? '1' : '0';
    });

    renderPseudocode(algoKey);
    resetState(false);
  }

  // Event Listeners
  document.querySelectorAll('.algo-card').forEach(card => {
    card.addEventListener('click', () => {
      setAlgorithm(card.dataset.algo);
    });
  });

  document.getElementById('startSortBtn').addEventListener('click', play);
  document.getElementById('pauseSortBtn').addEventListener('click', pause);
  document.getElementById('stepSortBtn').addEventListener('click', stepForward);
  document.getElementById('resetSortBtn').addEventListener('click', () => resetState(false));

  document.getElementById('shuffleBtn').addEventListener('click', () => {
    resetState(true);
  });

  document.getElementById('reverseBtn').addEventListener('click', () => {
    array.sort((a, b) => b - a);
    customArrayInput.value = array.join(', ');
    resetState(false);
    logHeadlineEl.textContent = "Data Dibalik (Worst-Case)";
    logDetailEl.textContent = "Array sekarang dalam urutan terbalik sempurna (Descending), kondisi paling menguras komparasi.";
  });

  // Size slider
  sizeSlider.addEventListener('input', (e) => {
    sizeValueEl.textContent = e.target.value;
    resetState(true);
  });

  // Speed slider
  speedSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    let label = 'Normal';
    if (val < 150) label = 'Lambat (Edukasi)';
    else if (val > 450) label = 'Turbo';
    else label = 'Sedang';
    document.getElementById('speedValue').textContent = label;
  });

  // Custom Array Input
  document.getElementById('applyCustomBtn').addEventListener('click', () => {
    const raw = customArrayInput.value;
    const parts = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (parts.length >= 3) {
      array = parts.slice(0, 30);
      sizeSlider.value = array.length;
      sizeValueEl.textContent = array.length;
      document.getElementById('inputValidationMsg').textContent = "Array Diterapkan!";
      document.getElementById('inputValidationMsg').className = "font-label-mono text-label-mono text-secondary";
      resetState(false);
    } else {
      document.getElementById('inputValidationMsg').textContent = "Minimal 3 angka valid!";
      document.getElementById('inputValidationMsg').className = "font-label-mono text-label-mono text-error";
    }
  });

  // Toggle Audio
  const toggleAudioBtn = document.getElementById('toggleAudioBtn');
  toggleAudioBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    toggleAudioBtn.classList.toggle('text-primary', soundEnabled);
    toggleAudioBtn.classList.toggle('text-on-surface-variant', !soundEnabled);
  });

  // Initial Boot
  renderPseudocode(currentAlgo);
  renderBars();
})();
