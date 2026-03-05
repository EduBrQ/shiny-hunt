export class SoundManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.initAudioFiles();
  }

  // Inicializar arquivos de áudio reais
  private initAudioFiles() {
    // Charmander - usa arquivo MP3 real
    const charmanderAudio = new Audio('/sounds/pokemon-charmander-cry.mp3');
    charmanderAudio.volume = 0.2;
    this.audioElements.set('charmander', charmanderAudio);

    // Bulbasaur - usa arquivo MP3 real
    const bulbasaurAudio = new Audio('/sounds/pokemon-bulbasaur-cry.mp3');
    bulbasaurAudio.volume = 0.2;
    this.audioElements.set('bulbasaur', bulbasaurAudio);

    // Squirtle - usa arquivo MP3 real
    const squirtleAudio = new Audio('/sounds/pokemon-squirtle-cry.mp3');
    squirtleAudio.volume = 0.2;
    this.audioElements.set('squirtle', squirtleAudio);

    // Som de SHINY encontrado
    const shinyAudio = new Audio('/sounds/shiny.mp3');
    shinyAudio.volume = 0.4;
    this.audioElements.set('shiny', shinyAudio);

    // Cries dos Pokémon + som de SHINY!
  }

  // Tocar som específico do Pokémon
  playPokemonSound(pokemonName: string) {
    const soundKey = pokemonName.toLowerCase();
    
    const audioElement = this.audioElements.get(soundKey);
    if (audioElement) {
      // Usa arquivo MP3 real
      audioElement.currentTime = 0;
      audioElement.play().catch(error => {
        console.warn('Erro ao tocar áudio do Pokémon:', error);
      });
    }
  }

  // Tocar som de SHINY encontrado
  playShinySound() {
    const audioElement = this.audioElements.get('shiny');
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(error => {
        console.warn('Erro ao tocar som de SHINY:', error);
      });
    }
  }

  // Iniciar sons (deve ser chamado após interação do usuário)
  async start() {
    // Nada a inicializar, apenas arquivos MP3
    console.log('Sistema de áudio pronto - cries dos Pokémon + som de SHINY');
  }
}

export const soundManager = new SoundManager();
