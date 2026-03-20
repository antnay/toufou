
export class AudioManager {
    private context: AudioContext;
    private musicSource: AudioBufferSourceNode | null = null;
    private buffers: Map<string, AudioBuffer> = new Map();
    private masterGain: GainNode;
    private musicGain: GainNode;
    private sfxGain: GainNode;

    constructor() {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.musicGain = this.context.createGain();
        this.sfxGain = this.context.createGain();

        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.context.destination);

        // Resume AudioContext on first user interaction if it's suspended
        const resumeContext = () => {
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            window.removeEventListener('click', resumeContext);
            window.removeEventListener('keydown', resumeContext);
        };
        window.addEventListener('click', resumeContext);
        window.addEventListener('keydown', resumeContext);
    }

    async loadAudio(name: string, url: string): Promise<AudioBuffer> {
        if (this.buffers.has(name)) {
            return this.buffers.get(name)!;
        }

        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

        this.buffers.set(name, audioBuffer);
        return audioBuffer;
    }

    playMusic(name: string, loop: boolean = true) {
        this.stopMusic();

        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.warn(`AudioManager: Music buffer "${name}" not found.`);
            return;
        }

        this.musicSource = this.context.createBufferSource();
        this.musicSource.buffer = buffer;
        this.musicSource.loop = loop;
        this.musicSource.connect(this.musicGain);
        this.musicSource.start(0);
    }

    stopMusic() {
        if (this.musicSource) {
            try {
                this.musicSource.stop(0);
            } catch (e) {
                // Ignore error if already stopped
            }
            this.musicSource.disconnect();
            this.musicSource = null;
        }
    }

    playSFX(name: string) {
        const buffer = this.buffers.get(name);
        if (!buffer) {
            // Silently fail if SFX not found, or log warning
            // console.warn(`AudioManager: SFX buffer "${name}" not found.`);
            return;
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.sfxGain);
        source.start(0);
    }

    setMusicVolume(volume: number) {
        this.musicGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
    }

    setSFXVolume(volume: number) {
        this.sfxGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
    }

    setMasterVolume(volume: number) {
        this.masterGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
    }
}
