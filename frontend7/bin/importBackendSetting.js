const fs = require("fs");

const jsonObject = JSON.parse(fs.readFileSync("../backend3/cfn_outputs.json", "utf8"));
const result = {};

console.log(jsonObject);
const stackname = Object.keys(jsonObject)[0];
console.log(stackname);
const outputs = jsonObject[stackname];
console.log(outputs);

//// Output backend config
let outputString = "";
Object.keys(outputs).forEach((key) => {
    const value = outputs[key];
    outputString += `export const ${key} = "${value}" \r\n`;
});
fs.writeFileSync("./src/BackendConfig.ts", outputString);

//// output sync.sh
console.log("create sync.sh");
const bucketname = outputs["Bucket"];
console.log(`bucket: ${bucketname}`);
outputString = "";
outputString += `aws s3 sync dist/ s3://${bucketname}/default/ \n`;

fs.writeFileSync("./sync.sh", outputString);

//// output access url
console.log("generate access url");
const DemoEndpoint = outputs["DemoEndpoint"];
outputString = "";
outputString += `${DemoEndpoint}/default/index.html \n`;

fs.writeFileSync("./demo_url.txt", outputString);

//// output invalidation script
console.log("generate invalidation script");
const DistributionId = outputs["DistributionId"];
outputString = "";
outputString += `aws cloudfront create-invalidation --distribution-id ${DistributionId} --paths '/*' \n`;

fs.writeFileSync("./createInvalidation.sh", outputString);
