import React from 'react';

const App = () => {
  const [files, setFiles] = React.useState([]);
  const [parameters, setParameters] = React.useState({ skills: [], experience: '' });
  const [report, setReport] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [queryResult, setQueryResult] = React.useState('');
  const [loadingQuery, setLoadingQuery] = React.useState(false);
  const [skillInput, setSkillInput] = React.useState('');
  const [dragActive, setDragActive] = React.useState(false);

  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      const selected = Array.from(e.target.selectedOptions, option => option.value);
      setParameters({ ...parameters, skills: selected });
    } else {
      setParameters({ ...parameters, [name]: value });
    }
  };

  const handleAnalyze = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('parameters', JSON.stringify(parameters));

    const response = await fetch('http://localhost:3200/api/analyze', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log('Analysis result:', result);
    setReport(result);
  };

  const handleQuery = async () => {
    setLoadingQuery(true);
    setQueryResult('');
    const response = await fetch('http://localhost:3200/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, text: report?.results?.[0]?.extractedText }),
    });
    const result = await response.json();
    setQueryResult(result.answer);
    console.log('Query result:', result);
    setLoadingQuery(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center tracking-tight">Resume Analyzer</h1>
        <div className="mb-8">
          <label className="block text-base font-semibold text-blue-700 mb-2">Upload Resumes (PDF)</label>
          <div
            className={`relative w-full border-2 border-dashed rounded-lg p-3 transition bg-blue-50 ${dragActive ? 'border-blue-500 bg-blue-100' : 'border-blue-200'}`}
            onDragOver={e => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={e => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={e => {
              e.preventDefault();
              setDragActive(false);
              const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
              setFiles(prevFiles => {
                const fileMap = new Map();
                prevFiles.forEach(f => fileMap.set(f.name, f));
                newFiles.forEach(f => fileMap.set(f.name, f));
                return Array.from(fileMap.values());
              });
            }}
          >
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={e => {
                const newFiles = Array.from(e.target.files);
                setFiles(prevFiles => {
                  const fileMap = new Map();
                  prevFiles.forEach(f => fileMap.set(f.name, f));
                  newFiles.forEach(f => fileMap.set(f.name, f));
                  return Array.from(fileMap.values());
                });
                e.target.value = '';
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              style={{ minHeight: '56px' }}
            />
            <div className="flex flex-col items-center justify-center pointer-events-none select-none py-4">
              <svg className="w-8 h-8 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16v-4a4 4 0 014-4h2a4 4 0 014 4v4m-6 4h6a2 2 0 002-2v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2z" /></svg>
              <span className="text-blue-500 font-medium">Drag & Drop PDF files here or click to select</span>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mt-3 text-sm text-gray-700 bg-blue-50 rounded-lg p-3">
              <span className="font-semibold">Selected files:</span>
              <ul className="list-disc ml-5 mt-1">
                {files.slice(0, 4).map((file) => (
                  <li key={file.name} className="flex items-center gap-2">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700 focus:outline-none text-lg font-bold"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setFiles(files.filter(f => f.name !== file.name))}
                    >
                      &times;
                    </button>
                  </li>
                ))}
                {files.length > 4 && (
                  <li className="italic text-gray-500">...and {files.length - 4} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="mb-8">
          <label className="block text-base font-semibold text-blue-700 mb-2">Skills</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Type or select a skill..."
              className="block w-full border-2 border-blue-200 rounded-lg p-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              list="skills-list"
              value={skillInput || ''}
              onChange={e => setSkillInput(e.target.value)}
              onFocus={e => e.target.setAttribute('list', 'skills-list')}
              onInput={e => e.target.setAttribute('list', 'skills-list')}
              onKeyDown={e => {
                if (e.key === 'Enter' && skillInput.trim()) {
                  if (!parameters.skills.includes(skillInput.trim())) {
                    setParameters({ ...parameters, skills: [...parameters.skills, skillInput.trim()] });
                  }
                  setSkillInput('');
                }
              }}
              autoComplete="off"
            />
            <datalist id="skills-list">
              <option value="Python" />
              <option value="Java" />
              <option value="JavaScript" />
            </datalist>
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition"
              onClick={() => {
                if (skillInput && !parameters.skills.includes(skillInput.trim())) {
                  setParameters({ ...parameters, skills: [...parameters.skills, skillInput.trim()] });
                  setSkillInput('');
                }
              }}
            >
              Add
            </button>
          </div>
          {parameters.skills.length > 0 && (
            <div className="mt-3 text-sm text-gray-700 bg-blue-50 rounded-lg p-3">
              <span className="font-semibold">Selected skills:</span>
              <ul className="list-disc ml-5 mt-1">
                {parameters.skills.map(skill => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mb-8">
          <label className="block text-base font-semibold text-blue-700 mb-2">Experience (Years)</label>
          <input
            type="text"
            name="experience"
            value={parameters.experience}
            onChange={handleParameterChange}
            className="block w-full border-2 border-blue-200 rounded-lg p-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="e.g., 5"
          />
        </div>
        <button
          onClick={() => {
            if (files.length === 0) return; // Prevent analyze if no files
            handleAnalyze();
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transition mb-8"
          disabled={files.length === 0}
        >
          Analyze Resumes
        </button>
        {files.length === 0 && (
          <div className="text-red-500 text-sm mb-4 text-center font-semibold">Please upload at least one PDF document to analyze.</div>
        )}
        {report && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Analysis Report</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm text-gray-800">{JSON.stringify(report, null, 2)}</pre>
          </div>
        )}
        <div className="mt-8">
          <label className="block text-base font-semibold text-blue-700 mb-2">Ask a Question</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="block w-full border-2 border-blue-200 rounded-lg p-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Type or select a question..."
              list="sample-questions"
            />
            <datalist id="sample-questions">
              <option value="What are the candidate's top skills?" />
              <option value="Does the candidate have Python experience?" />
              <option value="Summarize the candidate's work history." />
              <option value="List all programming languages mentioned." />
            </datalist>
            <button
              onClick={handleQuery}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-600 transition"
            >
              Submit Query
            </button>
          </div>
        </div>
        {loadingQuery && (
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium shadow animate-pulse">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" strokeWidth="4" className="opacity-75" /></svg>
              Fetching query result...
            </span>
          </div>
        )}
        {queryResult && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold text-green-700 mb-2">Query Result</h2>
            <p className="bg-white p-4 rounded-lg text-gray-800 whitespace-pre-line">{queryResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;