import React, { useState, useEffect } from 'react';
import './index.css';
import { soundManager } from './sounds';
import { DistributionChart, LuckyHeatmap, StatsOverview } from './charts';

interface SimulationResult {
  attempts: number;
  timeInSeconds: number;
}

interface Statistics {
  average: number;
  median: number;
  min: number;
  max: number;
  averageTime: string;
  minTime: string;
  maxTime: string;
}

interface Pokemon {
  id: number;
  name: string;
  types: string[];
  normalImage: string;
  shinyImage: string;
  color: string;
}

const POKEMONS: Pokemon[] = [
  {
    id: 1,
    name: 'Bulbasaur',
    types: ['Grass', 'Poison'],
    normalImage: '/imgs/bulbasaur.png',
    shinyImage: '/imgs/bulbasaur-shiny.png',
    color: '#78C850'
  },
  {
    id: 2,
    name: 'Charmander',
    types: ['Fire'],
    normalImage: '/imgs/charmander.png',
    shinyImage: '/imgs/charmander-shiny.png',
    color: '#F08030'
  },
  {
    id: 3,
    name: 'Squirtle',
    types: ['Water'],
    normalImage: '/imgs/squirtle.png',
    shinyImage: '/imgs/squirtle-shiny.png',
    color: '#6890F0'
  }
];

const PokemonShinySimulator: React.FC = () => {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon>(POKEMONS[1]); // Charmander padrão
  const [numSimulations, setNumSimulations] = useState<string>('100');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [showShinyAnimation, setShowShinyAnimation] = useState<boolean>(false);
  const [lastShinyAttempts, setLastShinyAttempts] = useState<number>(0);

  // Update body theme when pokemon changes
  React.useEffect(() => {
    document.body.setAttribute('data-pokemon', selectedPokemon.name.toLowerCase());
  }, [selectedPokemon]);

  // Initialize sounds on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      await soundManager.start();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const SHINY_CHANCE = 8192;
  const ENCOUNTER_TIME_SECONDS = 30;

  const findShiny = (): number => {
    let attempts = 0;
    while (true) {
      attempts++;
      if (Math.random() * SHINY_CHANCE < 1) {
        return attempts;
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days === 1) parts.push(`${days} day`);
    else if (days > 0) parts.push(`${days} days`);
    if (hours > 0) parts.push(`${hours} hours`);
    if (minutes > 0) parts.push(`${minutes} minutes`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} seconds`);

    return parts.join(', ');
  };

  const calculateStatistics = (simulationResults: SimulationResult[]): Statistics => {
    const attempts = simulationResults.map(r => r.attempts);
    const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    const sortedAttempts = [...attempts].sort((a, b) => a - b);
    const median = sortedAttempts[Math.floor(sortedAttempts.length / 2)];
    const min = Math.min(...attempts);
    const max = Math.max(...attempts);

    return {
      average,
      median,
      min,
      max,
      averageTime: formatTime(Math.round(average * ENCOUNTER_TIME_SECONDS)),
      minTime: formatTime(min * ENCOUNTER_TIME_SECONDS),
      maxTime: formatTime(max * ENCOUNTER_TIME_SECONDS)
    };
  };

  const runSimulation = async () => {
    const numSims = parseInt(numSimulations);
    if (isNaN(numSims) || numSims <= 0) {
      alert('Por favor, digite um número válido de simulações!');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setStatistics(null);

    const simulationResults: SimulationResult[] = [];

    for (let i = 0; i < numSims; i++) {
      const attempts = findShiny();
      const timeInSeconds = attempts * ENCOUNTER_TIME_SECONDS;
      
      simulationResults.push({ attempts, timeInSeconds });
      
      // Update progress
      const currentProgress = Math.round(((i + 1) / numSims) * 100);
      setProgress(currentProgress);

      // Allow UI to update
      if (i % Math.max(1, Math.floor(numSims / 100)) === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    setResults(simulationResults);
    setStatistics(calculateStatistics(simulationResults));
    
    // Show shiny animation with the last found shiny
    const lastResult = simulationResults[simulationResults.length - 1];
    setLastShinyAttempts(lastResult.attempts);
    setShowShinyAnimation(true);
    
    // Tocar apenas o som de SHINY encontrado
    soundManager.playShinySound();
    
    // Hide animation after 5 seconds
    setTimeout(() => {
      setShowShinyAnimation(false);
    }, 5000);
    
    setIsRunning(false);
  };

  const runSingleShiny = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setStatistics(null);

    // Simulate progress for single shiny hunt
    let currentAttempts = 0;
    const progressInterval = setInterval(() => {
      currentAttempts += Math.floor(Math.random() * 100) + 50;
      setProgress(Math.min(currentAttempts / 10, 95)); // Cap at 95% until found
    }, 100);

    // Find the shiny
    const attempts = findShiny();
    const timeInSeconds = attempts * ENCOUNTER_TIME_SECONDS;
    
    clearInterval(progressInterval);
    setProgress(100);

    // Create single result
    const singleResult: SimulationResult = { attempts, timeInSeconds };
    setResults([singleResult]);
    setStatistics(calculateStatistics([singleResult]));
    
    // Show shiny animation
    setLastShinyAttempts(attempts);
    setShowShinyAnimation(true);
    
    // Tocar apenas o som de SHINY encontrado
    soundManager.playShinySound();
    
    // Hide animation after 5 seconds
    setTimeout(() => {
      setShowShinyAnimation(false);
    }, 5000);
    
    setIsRunning(false);
  };

  return (
    <>
      {showShinyAnimation && (
        <div className="shiny-animation-overlay">
          <div className="shiny-animation-content">
            <div className="shiny-stars">⭐</div>
            <h2 className="shiny-title">SHINY FOUND!</h2>
            <div className="shiny-pokemon-container">
              <img 
                src={selectedPokemon.shinyImage} 
                alt={`${selectedPokemon.name} SHINY`}
                className="shiny-pokemon-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div className="shiny-pokemon-fallback" style={{ display: 'none' }}>
                {selectedPokemon.name === 'Bulbasaur' && '🌱✨'}
                {selectedPokemon.name === 'Charmander' && '🔥✨'}
                {selectedPokemon.name === 'Squirtle' && '💧✨'}
              </div>
            </div>
            <p className="shiny-pokemon-name">{selectedPokemon.name}</p>
            <p className="shiny-attempts">After {lastShinyAttempts} attempts!</p>
            <div className="shiny-sparkles"></div>
          </div>
        </div>
      )}

      <div className="container" style={{ '--pokemon-color': selectedPokemon.color } as React.CSSProperties}>
      <div className="header">
        <h1>
          <span className="pokemon-emoji">🎮</span>
          <br />
          <span>✨ Shiny Hunting ✨</span>
          <br />
          {/* <span className="shiny-emoji">✨</span> */}
        </h1>
        <p>Discover how many encounters you need to find a SHINY Pokémon!</p>
      </div>

      <div className="card">
        <h2>🎯 Choose your Starter Pokémon</h2>
        <div className="pokemon-selector">
          {POKEMONS.map((pokemon) => (
            <div
              key={pokemon.id}
              className={`pokemon-card ${selectedPokemon.id === pokemon.id ? 'selected' : ''}`}
              onClick={() => {
                soundManager.playPokemonSound(pokemon.name);
                setSelectedPokemon(pokemon);
              }}
              style={{ borderColor: selectedPokemon.id === pokemon.id ? pokemon.color : '#ddd' }}
            >
              <div className="pokemon-image">
                <img 
                  src={pokemon.normalImage} 
                  alt={pokemon.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="pokemon-fallback" style={{ display: 'none' }}>
                  {pokemon.name === 'Bulbasaur' && '🌱'}
                  {pokemon.name === 'Charmander' && '🔥'}
                  {pokemon.name === 'Squirtle' && '💧'}
                </div>
              </div>
              <h3>{pokemon.name}</h3>
              <div className="pokemon-types">
                {pokemon.types.map((type, index) => (
                  <span key={index} className="type-badge" style={{ backgroundColor: pokemon.color }}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="single-shiny-section">
          <button 
            className="btn btn-shiny-single" 
            onClick={runSingleShiny} 
            disabled={isRunning}
            style={{ backgroundColor: selectedPokemon.color }}
          >
            {isRunning ? 'Searching...' : `Hunt ${selectedPokemon.name} Shiny`}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="input-group">
          <label htmlFor="simulations">
            Number of simulations:
          </label>
          <input
            id="simulations"
            type="number"
            value={numSimulations}
            onChange={(e) => setNumSimulations(e.target.value)}
            placeholder="Enter number of simulations"
            disabled={isRunning}
            min="1"
            max="100000"
          />
        </div>

        <div className="button-group">
          <button 
            className="btn btn-primary" 
            onClick={runSimulation} 
            disabled={isRunning}
            style={{ backgroundColor: selectedPokemon.color }}
          >
            {isRunning ? 'Simulating...' : `Simulate ${numSimulations} times`}
          </button>
        </div>

        {isRunning && (
          <div className="loading">
            <div className="spinner" style={{ borderColor: selectedPokemon.color, borderTopColor: '#fff' }}></div>
            <p>
              {progress < 100 ? 
                `Searching for ${selectedPokemon.name} SHINY... ${progress}%` : 
                `Processing result...`
              }
            </p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%`, backgroundColor: selectedPokemon.color }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {statistics && (
        <div className="card results">
          <h2>📊 Simulation Results</h2>
          <p><strong>Total simulations:</strong> {results.length}</p>
          <p><strong>SHINY chance:</strong> 1/{SHINY_CHANCE}</p>
          <p><strong>Pokémon:</strong> {selectedPokemon.name}</p>
          
          <div className="stats-grid">
            <div className="stat-card" style={{ background: `linear-gradient(135deg, ${selectedPokemon.color}, ${selectedPokemon.color}dd)` }}>
              <div className="stat-value">{statistics.average.toFixed(1)}</div>
              <div className="stat-label">Average Attempts</div>
            </div>
            <div className="stat-card" style={{ background: `linear-gradient(135deg, ${selectedPokemon.color}, ${selectedPokemon.color}dd)` }}>
              <div className="stat-value">{statistics.median}</div>
              <div className="stat-label">Median</div>
            </div>
            <div className="stat-card" style={{ background: `linear-gradient(135deg, ${selectedPokemon.color}, ${selectedPokemon.color}dd)` }}>
              <div className="stat-value">{statistics.min}</div>
              <div className="stat-label">Minimum</div>
            </div>
            <div className="stat-card" style={{ background: `linear-gradient(135deg, ${selectedPokemon.color}, ${selectedPokemon.color}dd)` }}>
              <div className="stat-value">{statistics.max}</div>
              <div className="stat-label">Maximum</div>
            </div>
          </div>

          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>⏱️ Estimated Real Time</h3>
          <div className="stats-grid">
            <div className="stat-card" style={{ background: `linear-gradient(135deg, ${selectedPokemon.color}, ${selectedPokemon.color}dd)` }}>
              <div className="stat-value">{statistics.averageTime}</div>
              <div className="stat-label">Average Time</div>
            </div>
            <div className="stat-card" style={{ background: `linear-gradient(135deg, ${selectedPokemon.color}, ${selectedPokemon.color}dd)` }}>
              <div className="stat-value">{statistics.minTime}</div>
              <div className="stat-label">Minimum Time</div>
            </div>
            <div className="stat-card" style={{ background: `linear-gradient(135deg, ${selectedPokemon.color}, ${selectedPokemon.color}dd)` }}>
              <div className="stat-value">{statistics.maxTime}</div>
              <div className="stat-label">Maximum Time</div>
            </div>
          </div>

          <div className="result-item" style={{ marginTop: '30px', borderLeftColor: selectedPokemon.color }}>
            <h3>🎯 Analysis</h3>
            <p>• On average, you would need <strong>{statistics.average.toFixed(1)} encounters</strong></p>
            <p>• This equals <strong>{statistics.averageTime}</strong> of gameplay</p>
            <p>• The theoretical chance is 1/{SHINY_CHANCE} ({SHINY_CHANCE} attempts)</p>
            <p>• In practice, the average was <strong>{((statistics.average / SHINY_CHANCE) * 100).toFixed(1)}%</strong> of expected</p>
          </div>

          {/* Visualizações Avançadas */}
          {results.length > 1 && (
            <>
              <DistributionChart 
                data={results.map(r => r.attempts)} 
                pokemonColor={selectedPokemon.color} 
              />
              <LuckyHeatmap 
                data={results.map(r => r.attempts)} 
                pokemonColor={selectedPokemon.color} 
              />
              <StatsOverview 
                data={results.map(r => r.attempts)} 
                pokemonColor={selectedPokemon.color} 
              />
            </>
          )}
        </div>
      )}

      <div className="card">
        <h3>🌟 About SHINY Pokémon</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Base chance: 1/8192 (0.0122%)</li>
          <li>This means approximately 1 SHINY every 8192 encounters</li>
          <li>SHINY Pokémon have different colors and special sparkle</li>
          <li>In generation 3 (Fire Red/Leaf Green) this was the standard chance</li>
          <li>Each encounter takes approximately 30 seconds</li>
          <li>Average time to find SHINY: ~68 hours of gameplay!</li>
        </ul>
      </div>
    </div>
    </>
  );
};

export default PokemonShinySimulator;
