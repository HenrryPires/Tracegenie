const fs = require('fs');
const webdriver = require('selenium-webdriver');

async function request(){
    let driver = new webdriver
        .Builder()
        .forBrowser('chrome')
        .build();
    driver.get('http://localhost/Tracegenie');

    let command = `var tables = document.getElementsByTagName('table');
    var data = [];

    for (var i = 0; i < tables.length; i++) { 
        var addressArray = tables[i].rows[1].cells[0].innerText;
        var address = addressArray.split('\\n').filter(value => value != '' && !value.startsWith('Years at address')).reduce((current, newValue) => current + ' ' + newValue)

        var entry = {name: tables[i].rows[0].cells[1].innerText.replace(/\\s\\s+/g, ' ').trim(), address: address};
        data.push(entry);
    }
    console.clear();
    console.table(data);
    return data;
    `

    var result = await driver.executeScript(command);
    driver.close();

    var json = result;
    var fields = Object.keys(json[0])
    var csv = json.map(row => {
        return fields.map(fieldName => {
            return JSON.stringify(row[fieldName]);
        }).join(',') + '\n';
    });

    csv.unshift(fields.join(',') + '\n') // add header column
    
    await fs.writeFile('data.csv', csv.reduce((a,b) => a = a + b));
}

request();