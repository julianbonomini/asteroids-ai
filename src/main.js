for (let i = 0; i < POPULATION_GAMES; i++) {
  const parent = document.getElementById("container");
  const newCanvas = document.createElement("CANVAS");
  newCanvas.setAttribute('id', `canvas-${i + 1}`);
  parent.appendChild(newCanvas);
}

onValueChange = () => {
    d = document.getElementById("select_id").value;
    FOR_HUMAN_EYE = d != "false";
}

const Neat = neataptic.Neat;
const Config = neataptic.Config;
const Methods = neataptic.Methods;
Config.warnings = false;

const options = {
  mutation: [
    Methods.Mutation.ADD_NODE,
    Methods.Mutation.SUB_NODE,
    Methods.Mutation.ADD_CONN,
    Methods.Mutation.SUB_CONN,
    Methods.Mutation.MOD_WEIGHT,
    // Methods.Mutation.MOD_BIAS,
    // Methods.Mutation.MOD_ACTIVATION,
    // Methods.Mutation.ADD_GATE,
    // Methods.Mutation.SUB_GATE,
    // Methods.Mutation.ADD_SELF_CONN,
    // Methods.Mutation.SUB_SELF_CONN,
    // Methods.Mutation.ADD_BACK_CONN,
    // Methods.Mutation.SUB_BACK_CONN
  ],
  popsize: POPULATION_GAMES,
  elitism: ELITISM,
  mutationRate: MUTATION_RATE,
  // mutationAmount: MUTATION_AMOUNT,
}
const fitnessFunc = (something) => {
  console.log('fitness function is not doin', something);
}
const neat = new Neat(((MINIMUN_ASTEROIDS_COUNT / 2) * 5), 4, fitnessFunc, options);

//Default options values
// const options2 = {
//   network: [((MINIMUN_ASTEROIDS_COUNT / 2) * 5), [1], 4],    // Perceptron structure
//   population: POPULATION_GAMES,
//   elitism: ELITISM,
//   randomBehaviour: 0.2,    // New random networks for the next generation (rate)
//   mutationRate: 0.1,       // Mutation rate on the weights of synapses
//   mutationRange: 0.5,      // Interval of the mutation changes on the synapse weight
//   historic: 0,             // Latest generations saved
//   lowHistoric: false,      // Only save score (not the network)
//   scoreSort: -1,           // Sort order (-1 = desc, 1 = asc)
//   nbChild: 1               // number of child by breeding
// }
// const neat2 = new Neuroevolution(options2);
// let firstGen = neat2.nextGeneration();
// firstGen = neat2.nextGeneration();
// firstGen = neat2.nextGeneration();
// firstGen = neat2.nextGeneration();
// firstGen = neat2.nextGeneration();
// firstGen = neat2.nextGeneration();
// console.log('wtf?', firstGen)
//When an network is over -> save this score
// ne.networkScore(generation[x], <score = 0>);

const chartData = {
  labels: [],
  datasets: [
    {
      name: 'Max',
      values: []
    },
    {
      name: 'Average',
      values: []
    },
    {
      name: 'Min',
      values: []
    }
  ]
}

const chart = new Chart('#chart', {
  title: 'generation score history',
  type: 'line',
  height: 200,
  data: chartData
})

let highestScore = 0;

const population = new Player({
  neat,
  games: POPULATION_GAMES,
  onEndGeneration: ({ generation, max, avg, min }) => {
    chartData.labels.push(generation.toString());
    chartData.datasets[0].values.push(max);
    chartData.datasets[1].values.push(avg);
    chartData.datasets[2].values.push(min);
    if (chartData.labels.length > 15) {
      chartData.labels.shift();
      chartData.datasets.forEach(d => d.values.shift());
    }

    chart.update(chartData);

    if (max > highestScore) {
      highestScore = max;
    }
    document.getElementById('generation').innerHTML = generation;
    document.getElementById('highest-score').innerHTML = highestScore;
  }
});

population.startGeneration();
