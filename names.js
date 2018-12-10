const Requester = require('./test.js');

async function startProcesses() {

    const r = new Requester();
    r.request('Silva', 'Portsmouth');
}

startProcesses();