// Offline document layout only. Uses the bundled Viz.js runtime, not the site.
const fs = require('fs');
const path = require('path');
const os = require('os');

function loadViz() {
  try { return require('@viz-js/viz'); } catch (error) {
    const modules = process.env.LIBRARY_DFD_NODE_MODULES || path.join(os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules');
    return require(path.join(modules, '@viz-js', 'viz'));
  }
}

const quote = JSON.stringify;
async function main() {
  const jobs = JSON.parse(fs.readFileSync(0, 'utf8'));
  const viz = await loadViz().instance();
  const results = [];
  for (const job of jobs) {
    const dot = [
      'digraph ' + quote(job.id) + ' {',
      'graph [rankdir=' + job.direction + ', splines=' + (job.layer === 'control' ? 'polyline' : 'ortho') + ', pack=true, packmode="array_3", nodesep=0.48, ranksep=0.85, pad=0.2, bgcolor="white", outputorder=edgesfirst, forcelabels=true];',
      'node [fontname="Malgun Gothic", fontsize=15, margin="0.14,0.09", width=1.7, height=0.65, color="#335f95", penwidth=1.5, style=filled, fillcolor="#507fb8", fontcolor="white"];',
      'edge [fontname="Malgun Gothic", fontsize=12, color="#4f7eb7", fontcolor="#244e81", penwidth=1.35, arrowsize=0.65];'
    ];
    for (const node of job.nodes) {
      // Viz's fallback font metrics underestimate Korean glyphs. Reserve their width.
      const textWidth = Math.max(...node.label.split('\n').map(line => [...line].reduce((width, char) => width + (char.codePointAt(0) > 255 ? 15 : 8.4), 0)));
      const bubble = node.kind === 'process' || node.kind === 'control';
      const attrs = [
        'id=' + quote('node-' + job.id + '-' + node.id),
        'label=' + quote(node.label),
        'width=' + Math.max(1.7, (textWidth * (bubble ? 1.2 : 1) + 24) / 72).toFixed(3),
        'shape=' + (node.kind === 'terminator' || node.kind === 'store' ? 'box' : 'ellipse')
      ];
      if (node.kind === 'control') attrs.push('style="filled,dashed"');
      if (node.kind === 'store') attrs.push('color="white",fillcolor="white",fontcolor="#244e81"');
      dot.push(quote(node.id) + ' [' + attrs.join(',') + '];');
    }
    for (const edge of job.edges) {
      const attrs = [
        'id=' + quote('flow-' + job.id + '-' + edge.index),
        (job.layer === 'control' ? 'label=' : 'xlabel=') + quote(edge.key),
        'style=' + (edge.kind === 'control' ? 'dashed' : 'solid')
      ];
      // Backward responses should not push the request entry after its consumers.
      if (edge.response) attrs.push('constraint=false');
      dot.push(quote(edge.source) + ' -> ' + quote(edge.target) + ' [' + attrs.join(',') + '];');
    }
    dot.push('}');
    const result = viz.render(dot.join('\n'), {format:'svg',engine:'dot'});
    if (result.status !== 'success') throw new Error(job.id + ': ' + JSON.stringify(result.errors));
    results.push({id:job.id,svg:result.output,warnings:result.errors});
  }
  process.stdout.write(JSON.stringify(results));
}
main().catch(error => { process.stderr.write(error.stack); process.exit(1); });
