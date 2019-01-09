
const Requester = require('./test.js');
var fs = require('fs');

async function startProcesses() {
    const r = new Requester();
    let names = [];

    let data = await fs.readFileSync('names.csv', 'utf8');
    names = data.split(',');

    //get the data
    for(let i = 0; i < names.length; i++) {
        await r.request(names[i], 'Po');
    };
    
    //concat the files
    for(let i = 0; i < names.length; i++) {
        try {
            
            data = await fs.readFileSync(`${names[i]}.csv`, 'utf8');
            data = data + '\n'
            await fs.writeFile(`AllData.csv`, data, options = {flag: 'a'});    
            
        } catch (error) {
            console.log(`no data for ${names[i]}.csv`)
        }
    };
}

startProcesses();
