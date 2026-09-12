import { EventEmitter } from 'node:events'

interface ProclaimEvents {
	'configIsValid:changed': [configIsValid: boolean]
	'onAir:changed': [onAir: boolean]
	'connected:changed': [connected: boolean]
	'authenticated:changed': [authenticated: boolean]
	'sessionId:changed': [sessionId: string]
	'authToken:changed': [authToken: string]
}

export class ProclaimStatus extends EventEmitter<ProclaimEvents> {
	#configIsValid: boolean
	#onAir: boolean
	#connected: boolean
	#authenticated: boolean

	#sessionId: string
	#authToken: string

	constructor() {
		super()
		this.#configIsValid = false
		this.#onAir = false
		this.#connected = false
		this.#authenticated = false
		this.#sessionId = ''
		this.#authToken = ''
	}

	get configIsValid(): boolean {
		return this.#configIsValid
	}

	set configIsValid(value: boolean) {
		if (this.#configIsValid !== value) {
			this.#configIsValid = value
			this.emit('configIsValid:changed', value)
		}
	}

	get onAir(): boolean {
		return this.#onAir
	}

	set onAir(value: boolean) {
		if (this.#onAir !== value) {
			this.#onAir = value
			this.emit('onAir:changed', value)
		}
	}

	get connected(): boolean {
		return this.#connected
	}

	set connected(value: boolean) {
		if (this.#connected !== value) {
			this.#connected = value
			this.emit('connected:changed', value)
		}
	}

	get authenticated(): boolean {
		return this.#authenticated
	}

	set authenticated(value: boolean) {
		if (this.#authenticated !== value) {
			this.#authenticated = value
			this.emit('authenticated:changed', value)
		}
	}

	get sessionId(): string {
		return this.#sessionId
	}

	set sessionId(value: string) {
		if (this.#sessionId !== value) {
			this.#sessionId = value
			this.emit('sessionId:changed', value)
		}
	}

	get authToken(): string {
		return this.#authToken
	}

	set authToken(value: string) {
		if (this.#authToken !== value) {
			this.#authToken = value
			this.emit('authToken:changed', value)
		}
	}
}
