class Neuroevolution {

  constructor(options) {
    this.network = options.network || [1, [1], 1];
    this.population = options.population || 50;
    this.elitism = options.elitism || 0.2;
    this.randomBehaviour = options.randomBehaviour || 0.2;
    this.mutationRate = options.mutationRange || 0.1;
    this.mutationRange = options.mutationRange || 0.5;
    this.historic = options.historic || 0;
    this.lowHistoric = options.lowHistoric || 0;
    this.scoreSort = options.scoreSort || -1;                    // Sort order (-1 = desc, 1 = asc)
    this.nbChild = options.nbChild || 1;
    this.activation = inputValue => {
      ap = (-inputValue) / 1;
      return (1 / (1 + Math.exp(ap)))
    };
    this.randomClamped = () => {
      return Math.random() * 2 - 1;
    };
    this.generations = new Generations(this);
  }

  /**
	 * Reset and create a new Generations object.
	 *
	 * @return void.
	 */
  restart = () => {
    this.generations = new Generations();
  }

  /**
	 * Create the next generation.
	 *
	 * @return Neural Network array for next Generation.
	 */
  nextGeneration = () => {
    let networks = [];

    if (this.generations.generations.length == 0) {
      // If no Generations, create first.
      networks = this.generations.firstGeneration();
    } else {
      // Otherwise, create next one.
      networks = this.generations.nextGeneration();
    }

    // Create Networks from the current Generation.
    const nns = [];
    for (let i in networks) {
      const nn = new Network();
      nn.setSave(networks[i]);
      nns.push(nn);
    }

    if (this.lowHistoric) {
      // Remove old Networks.
      if (this.generations.generations.length >= 2) {
        const genomes =
          this.generations
            .generations[this.generations.generations.length - 2]
            .genomes;
        for (let i in genomes) {
          delete genomes[i].network;
        }
      }
    }

    if (this.historic != -1) {
      // Remove older generations.
      if (this.generations.generations.length > this.historic + 1) {
        this.generations.generations.splice(0,
          this.generations.generations.length - (this.historic + 1));
      }
    }

    return nns;
  }

  /**
	 * Adds a new Genome with specified Neural Network and score.
	 *
	 * @param {network} Neural Network.
	 * @param {score} Score value.
	 * @return void.
	 */
	networkScore = (network, score) => {
		this.generations.addGenome(new Genome(score, network.getSave()));
	}
}

class Neuron {
  constructor() {
    this.value = 0;
    this.weights = [];
  }

  /**
	 * Initialize number of neuron weights to random clamped values.
	 *
	 * @param {inputs} Number of neuron weights (number of inputs).
	 * @return void
	 */
  populate = inputs => {
    this.weights = [];
    for (let i = 0; i < inputs; i++) {
      const random = Math.random() * 2 - 1;
      this.weights.push(random);
    }
  }
}

class Layer {
  constructor(index) {
    this.id = index || 0;
    this.neurons = [];
  }

  /**
	 * Populate the Layer with a set of randomly weighted Neurons.
	 *
	 * Each Neuron be initialied with nbInputs inputs with a random clamped
	 * value.
	 *
	 * @param {nbNeurons} Number of neurons.
	 * @param {nbInputs} Number of inputs.
	 * @return void
	 */
  populate = (nbNeurons, nbInputs) => {
    this.neurons = [];
    for (var i = 0; i < nbNeurons; i++) {
      const neuron = new Neuron();
      neuron.populate(nbInputs);
      this.neurons.push(neuron);
    }
  }
}

class Network {
  constructor() {
    this.layers = [];
  }

  /**
	 * Generate the Network layers.
	 *
	 * @param {input} Number of Neurons in Input layer.
	 * @param {hidden} Number of Neurons per Hidden layer.
	 * @param {output} Number of Neurons in Output layer.
	 * @return void
	 */
  perceptronGeneration = (input, hiddens, output) => {
    let index = 0;
    let previousNeurons = 0;
    const inputLayer = new Layer(index);
    inputLayer.populate(input, previousNeurons); // Number of Inputs will be set to
    // 0 since it is an input layer.
    previousNeurons = input; // number of input is size of previous layer.
    this.layers.push(inputLayer);
    index++;
    for (let i in hiddens) {
      // Repeat same process as first layer for each hidden layer.
      const hiddenLayer = new Layer(index);
      hiddenLayer.populate(hiddens[i], previousNeurons);
      previousNeurons = hiddens[i];
      this.layers.push(hiddenLayer);
      index++;
    }
    const outputLayer = new Layer(index);
    outputLayer.populate(output, previousNeurons); // Number of input is equal to
    // the size of the last hidden
    // layer.
    this.layers.push(outputLayer);
  }

  /**
	 * Create a copy of the Network (neurons and weights).
	 *
	 * Returns number of neurons per layer and a flat array of all weights.
	 *
	 * @return Network data.
	 */
  getSave = () => {
    const datas = {
      neurons: [], // Number of Neurons per layer.
      weights: [] // Weights of each Neuron's inputs.
    };

    for (let i in this.layers) {
      datas.neurons.push(this.layers[i].neurons.length);
      for (let j in this.layers[i].neurons) {
        for (let k in this.layers[i].neurons[j].weights) {
          // push all input weights of each Neuron of each Layer into a flat
          // array.
          datas.weights.push(this.layers[i].neurons[j].weights[k]);
        }
      }
    }
    return datas;
  }

  /**
	 * Apply network data (neurons and weights).
	 *
	 * @param {network} Copy of network data (neurons and weights).
	 * @return void
	 */
  setSave = network => {
    let previousNeurons = 0;
    let index = 0;
    let indexWeights = 0;
    this.layers = [];
    for (let i in network.neurons) {
      // Create and populate layers.
      const layer = new Layer(index);
      layer.populate(network.neurons[i], previousNeurons);
      for (let j in layer.neurons) {
        for (let k in layer.neurons[j].weights) {
          // Apply neurons weights to each Neuron.
          layer.neurons[j].weights[k] = network.weights[indexWeights];

          indexWeights++; // Increment index of flat array.
        }
      }
      previousNeurons = network.neurons[i];
      index++;
      this.layers.push(layer);
    }
  }

  /**
	 * Compute the output of an input.
	 *
	 * @param {inputs} Set of inputs.
	 * @return Network output.
	 */
  compute = inputs => {
    // Set the value of each Neuron in the input layer.
    for (let i in inputs) {
      if (this.layers[0] && this.layers[0].neurons[i]) {
        this.layers[0].neurons[i].value = inputs[i];
      }
    }

    let prevLayer = this.layers[0]; // Previous layer is input layer.
    for (let i = 1; i < this.layers.length; i++) {
      for (let j in this.layers[i].neurons) {
        // For each Neuron in each layer.
        let sum = 0;
        for (let k in prevLayer.neurons) {
          // Every Neuron in the previous layer is an input to each Neuron in
          // the next layer.
          sum += prevLayer.neurons[k].value *
            this.layers[i].neurons[j].weights[k];
        }

        // Compute the activation of the Neuron.
        this.layers[i].neurons[j].value = this.options.activation(sum);
      }
      prevLayer = this.layers[i];
    }

    // All outputs of the Network.
    const out = [];
    const lastLayer = this.layers[this.layers.length - 1];
    for (let i in lastLayer.neurons) {
      out.push(lastLayer.neurons[i].value);
    }
    return out;
  }
}

class Genome {
  constructor(score, network) {
    this.score = score || 0;
    this.network = network || null;
  }
}

class Generation {
  constructor(context) {
    this.genomes = [];
    this.context = context;
  }

  /**
	 * Add a genome to the generation.
	 *
	 * @param {genome} Genome to add.
	 * @return void.
	 */
  addGenome = genome => {
    // Locate position to insert Genome into.
    // The gnomes should remain sorted.
    for (let i = 0; i < this.genomes.length; i++) {
      // Sort in descending order.
      if (this.context.scoreSort < 0) {
        if (genome.score > this.genomes[i].score) {
          break;
        }
        // Sort in ascending order.
      } else {
        if (genome.score < this.genomes[i].score) {
          break;
        }
      }

    }

    // Insert genome into correct position.
    this.genomes.splice(i, 0, genome);
  }

  /**
	 * Breed to genomes to produce offspring(s).
	 *
	 * @param {g1} Genome 1.
	 * @param {g2} Genome 2.
	 * @param {nbChilds} Number of offspring (children).
	 */
  breed = (g1, g2, nbChilds) => {
    const datas = [];
    for (let nb = 0; nb < nbChilds; nb++) {
      // Deep clone of genome 1.
      const data = JSON.parse(JSON.stringify(g1));
      for (let i in g2.network.weights) {
        // Genetic crossover
        // 0.5 is the crossover factor.
        // FIXME Really should be a predefined constant.
        if (Math.random() <= 0.5) {
          data.network.weights[i] = g2.network.weights[i];
        }
      }

      // Perform mutation on some weights.
      for (let i in data.network.weights) {
        if (Math.random() <= this.context.mutationRate) {
          data.network.weights[i] += Math.random() *
            this.context.mutationRange *
            2 -
            this.context.mutationRange;
        }
      }
      datas.push(data);
    }

    return datas;
  }

  /**
	 * Generate the next generation.
	 *
	 * @return Next generation data array.
	 */
  generateNextGeneration = () => {
    const nexts = [];

    for (let i = 0; i < Math.round(this.context.elitism *
      this.context.population); i++) {
      if (nexts.length < this.context.population) {
        // Push a deep copy of ith Genome's Nethwork.
        nexts.push(JSON.parse(JSON.stringify(this.genomes[i].network)));
      }
    }

    for (let i = 0; i < Math.round(this.context.randomBehaviour *
      this.context.population); i++) {
      let n = JSON.parse(JSON.stringify(this.genomes[0].network));
      for (var k in n.weights) {
        n.weights[k] = Math.random() * 2 - 1;;
      }
      if (nexts.length < this.context.population) {
        nexts.push(n);
      }
    }

    let max = 0;
    while (true) {
      for (let i = 0; i < max; i++) {
        // Create the children and push them to the nexts array.
        const childs = this.breed(this.genomes[i], this.genomes[max],
          (this.context.nbChild > 0 ? this.context.nbChild : 1));
        for (let c in childs) {
          nexts.push(childs[c].network);
          if (nexts.length >= this.context.population) {
            // Return once number of children is equal to the
            // population by generatino value.
            return nexts;
          }
        }
      }
      max++;
      if (max >= this.genomes.length - 1) {
        max = 0;
      }
    }
  }
}

class Generations {
  constructor(context) {
    this.context = context
    this.generations = [];
    this.currentGeneration = new Generation(context);
  }

  /**
	 * Create the first generation.
	 *
	 * @param {input} Input layer.
	 * @param {input} Hidden layer(s).
	 * @param {output} Output layer.
	 * @return First Generation.
	 */
  firstGeneration = () => {
    const out = [];
    for (let i = 0; i < this.context.population; i++) {
      // Generate the Network and save it.
      const nn = new Network();
      nn.perceptronGeneration(this.context.network[0],
        this.context.network[1],
        this.context.network[2]);
      out.push(nn.getSave());
    }

    this.generations.push(new Generation(this.context));
    return out;
  }

  /**
	 * Create the next Generation.
	 *
	 * @return Next Generation.
	 */
  nextGeneration = () => {
    if (this.generations.length == 0) {
      // Need to create first generation.
      return false;
    }

    const gen = this.generations[this.generations.length - 1]
      .generateNextGeneration();
    this.generations.push(new Generation(this.context));
    return gen;
  }

  /**
	 * Add a genome to the Generations.
	 *
	 * @param {genome}
	 * @return False if no Generations to add to.
	 */
  addGenome = genome => {
    // Can't add to a Generation if there are no Generations.
    if (this.generations.length == 0) return false;

    // FIXME addGenome returns void.
    return this.generations[this.generations.length - 1].addGenome(genome);
  }
}