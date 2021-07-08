const fs = require('fs');

const jsonObject = JSON.parse(fs.readFileSync('../backend/cfn_outputs.json', 'utf8'));
const result = {};

console.log(jsonObject )
const stackname = Object.keys(jsonObject)[0]
console.log(stackname)
const outputs = jsonObject[stackname]
console.log(outputs)

//// output sync.sh
console.log("create sync.sh")
const bucketname = outputs["Bucket"]
console.log(`bucket: ${bucketname}`)
outputString=""
outputString += `aws s3 sync demo/ s3://${bucketname}/demo/ \n`

fs.writeFileSync('./sync.sh', outputString);

//// output access url
console.log("generate access url")
const DemoEndpoint = outputs["DemoEndpoint"]
outputString=""
outputString += `${DemoEndpoint}/demo/ \n`

fs.writeFileSync('./demo_url.txt', outputString);


