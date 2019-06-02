for (let i = 0; i < POPULATION_GAMES; i++) {
  const parent = document.getElementById("container");
  const newCanvas = document.createElement("CANVAS");
  newCanvas.setAttribute('id', `canvas-${i + 1}`);
  parent.appendChild(newCanvas);
}

const Neat = neataptic.Neat;
const Config = neataptic.Config;
Config.warnings = false;

const options = {
  popsize: POPULATION_GAMES,
  elitism: ELITISM,
  mutationRate: 0.5,
  mutationAmount: 3,
}
const fitnessFunc = (something) => {
  console.log('fitness function is not doin', something);
}
const neat = new Neat(5, 5, fitnessFunc, options);

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
    console.log('asdasdasda', max, avg, min)
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


// render(<Reacteroids />, document.getElementById('root'));
