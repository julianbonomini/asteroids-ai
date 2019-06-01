const Neat = neataptic.Neat;
const Config = neataptic.Config;
Config.warnings = false;

const options = {
  popsize: POPULATION_GAMES,
  elitism: ELITISM,
  mutationRate: 0.5,
  mutationAmount: 3,
}
const fitnessFunc = () => {
  console.log('wtf?', this);
}
const neat = new Neat(5, 5, fitnessFunc, options);

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
  games: POPULATION_GAMES,
  onEndGeneration: ({ generation, score }) => {
    if (score > highestScore) {
      highestScore = score;
    }
    document.getElementById('generation').innerHTML = generation
    document.getElementById('highest-score').innerHTML = highestScore
  }
});

population.startGeneration();


// render(<Reacteroids />, document.getElementById('root'));
