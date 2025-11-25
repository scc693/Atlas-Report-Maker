(function () {
  const locationInput = document.getElementById('location');
  const dateInput = document.getElementById('report-date');
  const foremanInput = document.getElementById('foreman');
  const projectLeadInput = document.getElementById('project-lead');
  const timeInInput = document.getElementById('time-in');
  const timeOutInput = document.getElementById('time-out');
  const photosCheckbox = document.getElementById('photos-sent');
  const addWorkerBtn = document.getElementById('add-worker');
  const crewBody = document.getElementById('crew-body');
  const workPerformedInput = document.getElementById('work-performed');
  const equipmentInput = document.getElementById('equipment');
  const delaysInput = document.getElementById('delays');
  const haulingInput = document.getElementById('hauling');
  const generateBtn = document.getElementById('generate');
  const copyBtn = document.getElementById('copy');
  const printBtn = document.getElementById('print');
  const downloadBtn = document.getElementById('download');
  const markdownOutput = document.getElementById('markdown-output');
  const reportHtmlContainer = document.getElementById('report-html');

  const storageKeys = {
    location: 'atlas_location',
    foreman: 'atlas_foreman',
    projectLead: 'atlas_project_lead',
  };

  function loadStoredDefaults() {
    try {
      const storedLocation = localStorage.getItem(storageKeys.location);
      if (storedLocation) locationInput.value = storedLocation;
      const storedForeman = localStorage.getItem(storageKeys.foreman);
      if (storedForeman) foremanInput.value = storedForeman;
      const storedLead = localStorage.getItem(storageKeys.projectLead);
      if (storedLead) projectLeadInput.value = storedLead;
    } catch (e) {
      console.warn('Unable to read localStorage', e);
    }
  }

  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Unable to write localStorage', e);
    }
  }

  function setDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    if (!dateInput.value) {
      dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
  }

  function formatDateHuman(dateString) {
    if (!dateString) return 'Unknown date';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const [year, month, day] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function addCrewRow() {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" placeholder="Name" class="crew-name" /></td>
      <td><input type="text" placeholder="Time in" class="crew-time-in" /></td>
      <td><input type="text" placeholder="Time out" class="crew-time-out" /></td>
      <td><input type="text" placeholder="Notes" class="crew-notes" /></td>
      <td><button type="button" class="delete-row">Delete</button></td>
    `;
    row.querySelector('.delete-row').addEventListener('click', () => {
      row.remove();
    });
    crewBody.appendChild(row);
  }

  function getCrewData() {
    const rows = Array.from(crewBody.querySelectorAll('tr'));
    return rows
      .map((row) => {
        const name = row.querySelector('.crew-name').value.trim();
        const timeIn = row.querySelector('.crew-time-in').value.trim();
        const timeOut = row.querySelector('.crew-time-out').value.trim();
        const notes = row.querySelector('.crew-notes').value.trim();
        return { name, timeIn, timeOut, notes };
      })
      .filter((member) => member.name);
  }

  function collectReportData() {
    const dateValue = dateInput.value;
    const crew = getCrewData();
    return {
      location: locationInput.value.trim(),
      dateRaw: dateValue,
      dateFormatted: formatDateHuman(dateValue),
      foreman: foremanInput.value.trim(),
      projectLead: projectLeadInput.value.trim(),
      timeIn: timeInInput.value.trim(),
      timeOut: timeOutInput.value.trim(),
      photosSent: photosCheckbox.checked,
      crew,
      workPerformed: workPerformedInput.value,
      equipment: equipmentInput.value,
      delays: delaysInput.value,
      hauling: haulingInput.value.trim(),
    };
  }

  function renderMarkdown(data) {
    let markdown = '# ATLAS Daily Report\n\n';
    markdown += `**Location:** ${data.location || ''}  \n`;
    markdown += `**Date:** ${data.dateFormatted}  \n`;
    markdown += `**Foreman:** ${data.foreman || ''}  \n`;
    markdown += `**Project Lead:** ${data.projectLead || ''}  \n\n`;

    if (data.crew.length) {
      const names = data.crew.map((c) => c.name).join(', ');
      markdown += `**Workers for today:** ${names}  \n\n`;
    }

    markdown += `**Time in:** ${data.timeIn || ''}  \n`;
    markdown += `**Time out:** ${data.timeOut || ''}  \n\n`;
    markdown += `**Photos sent:** ${data.photosSent ? 'Yes' : 'No'}  \n\n`;

    if (data.crew.length) {
      markdown += '## Crew Members & Hours\n\n';
      markdown += '| Name | Time In | Time Out | Notes |\n';
      markdown += '|------|---------|----------|-------|\n';
      data.crew.forEach((member) => {
        const notes = member.notes || '';
        markdown += `| ${member.name} | ${member.timeIn || ''} | ${member.timeOut || ''} | ${notes} |\n`;
      });
      markdown += '\n';
    }

    markdown += '## Work Performed\n';
    markdown += `${data.workPerformed}\n\n`;
    markdown += '## Equipment Used / Issues\n';
    markdown += `${data.equipment}\n\n`;
    markdown += '## Delays / Problems / Needs\n';
    markdown += `${data.delays}\n\n`;
    markdown += '## Hauling\n';
    markdown += `${data.hauling}\n`;

    return markdown;
  }

  function renderHtmlReport(data) {
    const crewList = data.crew.length ? `<p class="report-meta"><strong>Workers for today:</strong> ${data.crew.map((c) => c.name).join(', ')}</p>` : '';
    const crewTable = data.crew.length
      ? `<table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${data.crew
              .map(
                (member) => `<tr>
                  <td>${member.name}</td>
                  <td>${member.timeIn || ''}</td>
                  <td>${member.timeOut || ''}</td>
                  <td>${member.notes || ''}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>`
      : '';

    const photosValue = data.photosSent ? 'Yes' : 'No';

    reportHtmlContainer.innerHTML = `
      <h1>ATLAS Daily Report</h1>
      <p class="report-meta"><strong>Location:</strong> ${data.location || ''}</p>
      <p class="report-meta"><strong>Date:</strong> ${data.dateFormatted}</p>
      <p class="report-meta"><strong>Foreman:</strong> ${data.foreman || ''}</p>
      <p class="report-meta"><strong>Project Lead:</strong> ${data.projectLead || ''}</p>
      ${crewList}
      <p class="report-meta"><strong>Time in:</strong> ${data.timeIn || ''}</p>
      <p class="report-meta"><strong>Time out:</strong> ${data.timeOut || ''}</p>
      <p class="report-meta"><strong>Photos sent:</strong> ${photosValue}</p>
      ${crewTable}
      <h2>Work Performed</h2>
      <p>${escapeNewlines(data.workPerformed)}</p>
      <h2>Equipment Used / Issues</h2>
      <p>${escapeNewlines(data.equipment)}</p>
      <h2>Delays / Problems / Needs</h2>
      <p>${escapeNewlines(data.delays)}</p>
      <h2>Hauling</h2>
      <p>${escapeNewlines(data.hauling)}</p>
    `;
  }

  function escapeNewlines(text) {
    if (!text) return '';
    return text
      .split('\n')
      .map((line) => line || '&nbsp;')
      .join('<br />');
  }

  function generate() {
    const data = collectReportData();
    const markdown = renderMarkdown(data);
    markdownOutput.value = markdown;
    renderHtmlReport(data);
    copyBtn.disabled = false;
    printBtn.disabled = false;
    downloadBtn.disabled = false;
  }

  function copyMarkdown() {
    const text = markdownOutput.value;
    if (!text.trim()) {
      alert('Please generate the report first.');
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => alert('Markdown copied to clipboard.'),
        () => fallbackCopy(text)
      );
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand('copy');
      alert('Markdown copied to clipboard.');
    } catch (err) {
      alert('Unable to copy markdown.');
    }
    document.body.removeChild(temp);
  }

  function printReport() {
    if (!markdownOutput.value.trim()) {
      alert('Please generate the report first.');
      return;
    }
    window.print();
  }

  function downloadPdf() {
    if (!markdownOutput.value.trim()) {
      alert('Please generate the report first.');
      return;
    }
    const dateValue = dateInput.value || 'unknown-date';
    const filename = `atlas-daily-report-${dateValue || 'unknown-date'}.pdf`;
    const element = document.getElementById('report-html');
    const options = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(options).from(element).save();
  }

  function attachStorageListeners() {
    locationInput.addEventListener('input', (e) => saveToStorage(storageKeys.location, e.target.value));
    foremanInput.addEventListener('input', (e) => saveToStorage(storageKeys.foreman, e.target.value));
    projectLeadInput.addEventListener('input', (e) => saveToStorage(storageKeys.projectLead, e.target.value));
  }

  function init() {
    loadStoredDefaults();
    setDefaultDate();
    addWorkerBtn.addEventListener('click', addCrewRow);
    generateBtn.addEventListener('click', generate);
    copyBtn.addEventListener('click', copyMarkdown);
    printBtn.addEventListener('click', printReport);
    downloadBtn.addEventListener('click', downloadPdf);
    attachStorageListeners();
    addCrewRow();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
