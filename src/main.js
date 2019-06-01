// const Player = require('./Player');
const Neat = neataptic.Neat
const Config = neataptic.Config
Config.warnings = false;

const neat = new Neat(6, 2, null, {
    popsize: 100,
    elitism: Math.round(0.2 * 100),
    mutationRate: 0.5,
    mutationAmount: 3
  }
);

// const chartData = {
//   labels: [],
//   datasets: [
//     {
//       name: 'Max',
//       values: []
//     },
//     {
//       name: 'Average',
//       values: []
//     },
//     {
//       name: 'Min',
//       values: []
//     }
//   ]
// }

// const chart = new Chart('#chart', {
//   title: 'generation score history',
//   type: 'line',
//   height: 200,
//   data: chartData
// })

let highestScore = 0;

const population = new Player({
  neat,
  games: 1,
  onEndGeneration: ({generation, max, avg, min}) => {
    console.log('data from generation:', generation, max, avg, min);
    if (max > highestScore) {
      highestScore = max;
    }
    console.log('highest score', highestScore);
  }
});

population.startGeneration();


// render(<Reacteroids />, document.getElementById('root'));
