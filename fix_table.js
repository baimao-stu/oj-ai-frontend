const fs = require("fs");
let c = fs.readFileSync(
  "d:/code/java/OJ/oj-ai/oj-frontend/src/views/question/ViewQuestionView.vue",
  "utf8"
);
c = c.replace("overflow-x: hidden;", "overflow-x: auto;");
c = c.replace(
  ':loading="loadTable"',
  ':loading="loadTable"\n                      :scroll="{ x: 600 }"'
);
fs.writeFileSync(
  "d:/code/java/OJ/oj-ai/oj-frontend/src/views/question/ViewQuestionView.vue",
  c
);
