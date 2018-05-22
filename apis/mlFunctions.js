var Users = require('../models/users.js');
// allows us to spawn background child processes



const mlFunctions = {
    calculateKClusters
    //jangus
}

function calculateKClusters() {
    console.log("heyyaaaa");
    var spawn = require("child_process").spawn;
    var process = spawn('python', ["./test2.py"]);
    process.stdout.on("data", function(data) {
        let buffer = Buffer.from(data);
      console.log("data received: ", data.toString());
    });
}

// function calculateKClusters() {
//     console.log("hey");
//      var spawn = require("child_process").spawn;
//   // var process = spawn("python", ["./test.py",
//   //   // req.query.funds, // starting funds
//   //   // req.query.size, // (initial) wager size
//   //   // req.query.count, // wager count — number of wagers per sim
//   //   // req.query.sims // number of simulations
//   //   100,10,4,3
//   // ]);
//   // process.stdout.on("data", function (data) {
//   //   console.log("data: ", data.toString());
//   // });
//   var process = spawn('python', ["./test.py"]);
//   process.stdout.on("data", function(data) {
//       console.log("data received: ", data);
//   });
// }



// function calculateKClusters() {
//     // console.log("calculating");
//     // // py is the python child process
//     // py = spawn('python', ['./whatever_steve_wrote.py']);
//     // // the data passed into the python script
//     // data = [123,456];
//     // // string that will be added onto by python script
//     // dataString = '';
//     //
//     // // when the python script returns data, add it to dataString
//     // py.stdout.on('data', function(data) {
//     //     dataString += data.toString();
//     // })
//     //
//     // // when python is done, log the received data
//     // py.stdout.on('end', function() {
//     //     console.log('Final dataString: ', dataString);
//     // })
//     //
//     // // give the python script our data
//     // py.stdin.write(JSON.stringify(data));
//     // // let python know we're done giving it data
//     // py.stdin.end();
//
//     //start.js
// // var spawn = require('child_process').spawn,
// //     py    = spawn('python', ['./whatever_steve_wrote.py']),
// //     data = [1,2,3,4,5,6,7,8,9],
// //     dataString = '';
// //
// // py.stdout.on('data', function(data){
// //   dataString += data.toString();
// // });
// // py.stdout.on('end', function(){
// //   console.log('Sum of numbers=',dataString);
// // });
// // py.stdin.write(JSON.stringify(data));
// // py.stdin.end();
//
//
//
// // using spawn instead of exec, prefer a stream over a buffer
//   // to avoid maxBuffer issue
//   var spawn = require(“child_process”).spawn;
//   var process = spawn(‘python’, [“./d_alembert.py”,
//     req.query.funds, // starting funds
//     req.query.size, // (initial) wager size
//     req.query.count, // wager count — number of wagers per sim
//     req.query.sims // number of simulations
//   ]);
//   process.stdout.on(‘data’, function (data) {
//     res.send(data.toString());
//   });
// }



module.exports = mlFunctions;
