import { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

// ── Node type colours (matching Dashboard.jsx) ────────────
const TYPE_COLOR = {
  function: '#00e5ff',
  class:    '#00ffa3',
  method:   '#ffb800',
  file:     '#7c3aed',
};

// ── Cytoscape stylesheet ──────────────────────────────────
const CY_STYLE = [
  {
    selector: 'node',
    style: {
      shape:                'roundrectangle',
      'background-color':   'data(color)',
      'border-width':       2,
      'border-color':       'data(borderColor)',
      label:                'data(id)',
      color:                '#000000',
      'font-size':          '13px',
      'font-family':        'JetBrains Mono, monospace',
      'font-weight':        '600',
      'text-valign':        'center',
      'text-halign':        'center',
      'text-wrap':          'wrap',
      'text-max-width':     '160px',
      'text-overflow-wrap': 'anywhere',
      width:                180,
      height:               44,
      'transition-property': 'border-color, border-width, opacity',
      'transition-duration': '0.2s',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#ffffff',
      'border-width': 3,
      'font-weight':  '800',
    },
  },
  {
    selector: 'node.highlighted',
    style: {
      'border-color': '#ffffff',
      'border-width': 3,
      opacity:         1,
    },
  },
  {
    selector: 'node.faded',
    style: { opacity: 0.12 },
  },
  {
    selector: 'edge',
    style: {
      width:                2,
      'line-color':          '#2a2a40',
      'target-arrow-color':  '#2a2a40',
      'target-arrow-shape':  'triangle',
      'curve-style':         'taxi',
      'taxi-direction':      'downward',
      'taxi-turn':           '50%',
      opacity:               0.8,
    },
  },
  {
    selector: 'edge.highlighted',
    style: {
      'line-color':         '#00e5ff',
      'target-arrow-color': '#00e5ff',
      width:                 3,
      opacity:               1,
    },
  },
  {
    selector: 'edge.faded',
    style: { opacity: 0.04 },
  },
];

export default function GraphPanel({
  result,
  graphType,
  searchTerm,
  onNodeClick,
  selectedNode,
  cyRef,
}) {
  if (!result) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⬡</div>
        <h2 className="empty-title">No project loaded</h2>
        <p className="empty-sub">Upload a .zip or paste a git URL to begin</p>
      </div>
    );
  }

  const graph = result[graphType];
  if (!graph) {
    return (
      <div className="empty-state">
        <div className="empty-icon">∅</div>
        <h2 className="empty-title">Graph unavailable</h2>
        <p className="empty-sub">This graph type has no data</p>
      </div>
    );
  }

  // Build Cytoscape elements
  const hasIncoming = new Set((graph.edges || []).map(e => e.data.target));
  const nodes = (graph.nodes || [])
    .filter(n => !searchTerm ||
      n.data.id.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(n => {
      const isEntry = !hasIncoming.has(n.data.id);
      return {
        data: {
          ...n.data,
          color:       TYPE_COLOR[n.data.type] || '#5a5a7a',
          borderColor: isEntry ? '#ffffff' : (TYPE_COLOR[n.data.type] || '#5a5a7a'),
        },
      };
    });

  const nodeIds = new Set(nodes.map(n => n.data.id));
  const edges = (graph.edges || [])
    .filter(e => nodeIds.has(e.data.source) && nodeIds.has(e.data.target))
    .map(e => ({ data: e.data }));

  const elements = [...nodes, ...edges];

  if (elements.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">∅</div>
        <h2 className="empty-title">No symbols found</h2>
        <p className="empty-sub">
          {searchTerm ? `No nodes match "${searchTerm}"` : 'No functions, classes or methods detected'}
        </p>
      </div>
    );
  }

  return (
    <CytoscapeComponent
      key={`${graphType}-${searchTerm}`}
      elements={elements}
      style={{ width: '100%', height: '100%' }}
      layout={{
        name:              'dagre',
        rankDir:           'TB',
        ranker:            'longest-path',
        nodeSep:           50,
        rankSep:           70,
        edgeSep:           15,
        padding:           40,
        animate:           true,
        animationDuration: 450,
        fit:               true,
      }}
      stylesheet={CY_STYLE}
      cy={(cy) => {
        cyRef.current = cy;
        cy.on('tap', 'node', (evt) => {
          onNodeClick(evt.target.id());
        });
        cy.on('tap', (evt) => {
          if (evt.target === cy) onNodeClick(null);
        });
      }}
    />
  );
}
