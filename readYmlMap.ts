import fs = require('fs');
import YAML = require('yaml');

const file = fs.readFileSync('./fieldMaps/kansas.yml', 'utf8');
const objects = YAML.parse(file);
console.log(objects);
