var priorityColors = {
  "0" : "#1A1919",
  "1" : "#00A4D8",
  "2" : "#d39c12",
  "3" : "#DF5E33",
  "4" : "#902E7C",
  "5" : "#f39c12",
  "6" : "#f39c12",
  "7" : "#f39c12",
  "8" : "#f39c12",
  "9" : "#f39c12",
  "10" : "#f39c12",
  "11" : "#95a5a6",
  "12" : "#bdc3c7"
};

var prioritySizes = {
  "0" : "10",
  "1" : "10",
  "2" : "10",
  "3" : "10",
  "4" : "10",
  "5" : "10",
  "6" : "10",
  "7" : "10",
  "8" : "10",
  "9" : "10",
  "10" : "10",
  "11" : "5",
  "12" : "5"
};


var prioritySymbols = {
  "0" : "circle",
  "1" : "circle",
  "2" : "circle",
  "3" : "circle",
  "4" : "circle",
  "5" : "circle",
  "6" : "circle",
  "7" : "circle",
  "8" : "circle",
  "9" : "circle",
  "10" : "circle",
  "11" : "diamond", //institute triangle-up
  "12" : "square" //publication
};

var depthDistances = {
  // "1" : 95,
  // "2" : 120,
  // "3" : 170,
  // "4" : 210, //normal
  // "5" : 275,
  // "6" : 300
  "1" : 85,
  "2" : 100,
  "3" : 150,
  "4" : 190,
  "5" : 255,
  "6" : 280
};


function priorityColor(key){
  return priorityColors[key];
}

function prioritySize(key){
  return prioritySizes[key];
}

function prioritySymbol(key){
  return prioritySymbols[key];
}

function depthDistance(key){

  // return Math.floor(Math.random() * (depthDistances[key] +31)) + depthDistances[key];
  // return depthDistances[key] * 1.5; //Normal
  return depthDistances[key]; //ClickRandom
}
