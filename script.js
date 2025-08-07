const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwOREHec6c3BtpR41q1c5ClIHmqdiHXHnrYjRmeS8Kq8oIx3vpi5wNSKAAqrPdUgSQN/exec';

let currentStudentId = '';

function fetchJSON(action) {
  return fetch(`${BACKEND_URL}?action=${action}`)
    .then(r => r.json());
}

function postForm(action, data) {
  const form = new URLSearchParams({ action, ...data });
  return fetch(BACKEND_URL, { method: 'POST', body: form }).then(r => r.text());
}

function loadCandidates() {
  const id = document.getElementById('student-id').value.trim();
  if (!id) return alert("กรุณากรอกรหัสนักเรียน");
  currentStudentId = id;

  fetchJSON('getCandidates').then(candidates => {
    const div = document.getElementById('candidates');
    div.innerHTML = '';
    candidates.forEach(c => {
      const btn = document.createElement('button');
      btn.textContent = `${c.number} - ${c.name}`;
      btn.onclick = () => vote(c.id);
      div.appendChild(btn);
    });

    const abstain = document.createElement('button');
    abstain.textContent = 'ไม่ลงคะแนน (งดออกเสียง)';
    abstain.onclick = () => vote('abstain');
    div.appendChild(abstain);
  });
}

function vote(candidateId) {
  postForm('vote', { studentId: currentStudentId, candidateId })
    .then(res => {
      if (res === 'already') alert('คุณได้โหวตไปแล้ว');
      else if (res === 'success') {
        alert('โหวตสำเร็จ');
        showResults();
      }
    });
}

function showResults() {
  fetchJSON('getResults').then(cands => {
    const div = document.getElementById('results');
    div.innerHTML = '';
    cands.sort((a, b) => b.votes - a.votes).forEach(c => {
      div.innerHTML += `<p>${c.name}: ${c.votes} คะแนน</p>`;
    });
    document.getElementById('result-section').style.display = 'block';
  });
}

function resetAll() {
  const pass = prompt("ใส่รหัส admin เพื่อยืนยัน:");
  if (pass !== "admin123") return alert("รหัสไม่ถูกต้อง");

  postForm('resetVotes', {}).then(res => {
    if (res === 'reset') {
      alert('ลบคะแนนสำเร็จ');
      document.getElementById('result-section').style.display = 'none';
    }
  });
}
