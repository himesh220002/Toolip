// Browser-safe stub for the Node-only `canvas` package.
// pdfjs-dist lazily requires `canvas` inside its Node canvas factory,
// which never executes in the browser — this keeps the bundler happy.
module.exports = {};
