const fs = require('fs');

const jsonObject = JSON.parse(fs.readFileSync('../backend/cfn_outputs.json', 'utf8'));
const result = {};

console.log(jsonObject )
//console.log(jsonObject["BackendStack"] )
const stackname = Object.keys(jsonObject)[0]
console.log(stackname)
const outputs = jsonObject[stackname]
console.log(outputs)

let outputString=""
Object.keys(outputs).forEach(key =>{
    const value = outputs[key]
    outputString += `export const ${key} = "${value}" \r\n`
})

// jsonObject.list.forEach((obj) => {
//     result[obj.id] = obj;
// });

// console.log(result)
fs.writeFileSync('./src/BackendConfig.ts', outputString);

