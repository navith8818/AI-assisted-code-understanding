import { downloadResultsAsJson } from '../api.js';

export default function ResultsPanel({ projectName, result, onReset }) {
  const numFunctions = Object.keys(result.symbol_table?.functions || {}).length;
  const numClasses = Object.keys(result.symbol_table?.classes || {}).length;
  const numCfgs = Object.keys(result.cfgs || {}).length;

  return (
    <div className="results-panel">
      <p className="results-title">✅ {projectName}</p>
      <div className="results-stats">
        <div className="stat">
          <span className="stat-num">{numFunctions}</span>
          <span className="stat-label">functions</span>
        </div>
        <div className="stat">
          <span className="stat-num">{numClasses}</span>
          <span className="stat-label">classes</span>
        </div>
        <div className="stat">
          <span className="stat-num">{numCfgs}</span>
          <span className="stat-label">CFGs built</span>
        </div>
      </div>
      <div className="results-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadResultsAsJson(result);
          }}
        >
          Download JSON
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
        >
          Analyze another
        </button>
      </div>
    </div>
  );
}
