const fs = require("fs");
let c = fs.readFileSync(
  "d:/code/java/OJ/oj-ai/oj-frontend/src/views/question/ViewQuestionView.vue",
  "utf8"
);
c = c.replace(
  ':loading="loadTable"="{ x: 650 }"@page-change="onPageChange"',
  ':loading="loadTable"\n                      :scroll="{ x: 650 }"\n                      @page-change="onPageChange"'
);
fs.writeFileSync(
  "d:/code/java/OJ/oj-ai/oj-frontend/src/views/question/ViewQuestionView.vue",
  c
);
