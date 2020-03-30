/*Monitor the graph rendering process*/
export default class Progress {
  constructor() {
    this.message = '';
    this.phase = 'none';
    this.download = {
      errors: [],
      remaining: 0,
      currentWord: '',
    };
    this.layout = {
      iteration: 0
    };
    this.working = true
  }

  startDownload() {
    this.phase = 'download';
  }

  startLayout() {
    this.message = 'Completed downloading data. Building the results ';
    this.phase = 'layout';
  }

  setLayoutCompletion(layoutCompletion) {
    if (this.phase === 'layout') {
      this.message = `Results are ${layoutCompletion}% completed`;
    }
  }

  updateLayout(remaining, nextWord) {
    this.download.currentWord = nextWord;
    this.download.remaining = remaining;
    this.message = `Remaining: ${remaining}. Downloading ${nextWord}`;
  }

  done() {
    this.working = false;
  }

  downloadError(message) {
    this.download.errors.push(message);
  }

  reset() {
    this.phase = 'none',
    this.download.errors = [];
    this.download.remaining = 0;
    this.download.currentWord = '';
    this.layout.iteration = 0;
    this.message = '';
    this.working = true;
  }
}
