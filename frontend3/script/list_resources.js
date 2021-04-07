const fs = require('fs')
const path = require('path')
const { format } = require('util')

const resourceRoute = path.join('.', 'public', 'resources')
const outputifle = path.join('.', 'src', 'resources.ts')


const entries = fs.readdirSync(resourceRoute, { withFileTypes: true })
    .filter(f => f.isDirectory())
    .map(d => {
        const categoryName = d.name
        const categoryDir = path.join(resourceRoute, categoryName);
        return format("export const RS_%s = [%s]",
            categoryName.toUpperCase(),
            fs.readdirSync(categoryDir, { withFileTypes: true })
                .filter(f => !f.isDirectory())
                .map(r => { return "'" + path.join('resources', categoryName, r.name) + "'" })
                .join(',')
        )
    })


const code = entries.reduce((pre, cur) => { pre + "\n" + cur })

try {
    fs.writeFileSync(outputifle, code);
} catch (e) {
    console.log(e);
}
