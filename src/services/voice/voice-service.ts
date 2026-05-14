export class VoiceService {
  private static instance: VoiceService
  private recognition: any = null
  private synthesis: SpeechSynthesis | null = null

  private constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis
    }
  }

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService()
    }
    return VoiceService.instance
  }

  async speechToText(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) {
        reject(new Error("Speech recognition not supported"))
        return
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      this.recognition = new SpeechRecognition()
      
      this.recognition.lang = "vi-VN"
      this.recognition.continuous = false
      this.recognition.interimResults = false

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }

      this.recognition.onerror = (event: any) => {
        reject(new Error(event.error))
      }

      this.recognition.onend = () => {
        this.recognition = null
      }

      this.recognition.start()
    })
  }

  textToSpeech(text: string, lang: string = "vi-VN"): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1
      utterance.pitch = 1

      utterance.onend = () => {
        resolve()
      }

      utterance.onerror = (event: any) => {
        reject(new Error(event.error))
      }

      this.synthesis.speak(utterance)
    })
  }

  stopSpeech(): void {
    if (this.recognition) {
      this.recognition.stop()
      this.recognition = null
    }
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return []
    return this.synthesis.getVoices()
  }

  isSpeechRecognitionSupported(): boolean {
    return typeof window !== "undefined" && 
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  }

  isSpeechSynthesisSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window
  }
}

export const voiceService = VoiceService.getInstance()
