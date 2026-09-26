import { EventEmitter } from 'node:events'
import { Presentation, QuickScreenKind } from './apiTypes.js'

interface ProclaimEvents {
	'configIsValid:changed': [configIsValid: boolean]
	'onAir:changed': [onAir: boolean]
	'connected:changed': [connected: boolean]
	'authenticated:changed': [authenticated: boolean]
	'sessionId:changed': [sessionId: string]
	'authToken:changed': [authToken: string]
	'presentation:changed': [presentation: Presentation | null]
	'presentationId:changed': [presentationId: string]
	'presentationLocalRevision:changed': [presentationLocalRevision: number]
	'revision:changed': [revision: number]
	'itemId:changed': [itemId: string]
	'currentItemIndex:changed': [currentItemIndex: number]
	'slideIndex:changed': [slideIndex: number]
	'quickScreenKind:changed': [quickScreenKind: string]
	'mediaState:changed': [mediaState: string]
}

export class ProclaimStatus extends EventEmitter<ProclaimEvents> {
	#configIsValid: boolean
	#onAir: boolean
	#connected: boolean
	#authenticated: boolean

	#sessionId: string
	#authToken: string

	#presentation: Presentation | null

	#presentationId: string
	#presentationLocalRevision: number

	#revision: number
	#itemId: string
	#currentItemIndex: number
	#slideIndex: number
	#quickScreenKind: QuickScreenKind
	#mediaState: string

	constructor() {
		super()
		this.#configIsValid = false
		this.#onAir = false
		this.#connected = false
		this.#authenticated = false
		this.#sessionId = ''
		this.#authToken = ''
		this.#presentation = null
		this.#presentationId = ''
		this.#presentationLocalRevision = 0
		this.#revision = 0
		this.#itemId = ''
		this.#currentItemIndex = -1
		this.#slideIndex = 0
		this.#quickScreenKind = QuickScreenKind.NONE
		this.#mediaState = ''
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

	get presentation(): Presentation | null {
		return this.#presentation
	}

	set presentation(value: Presentation | null) {
		if (this.#presentation !== value) {
			this.#presentation = value
			this.emit('presentation:changed', value)
		}
	}

	get presentationId(): string {
		return this.#presentationId
	}

	set presentationId(value: string) {
		if (this.#presentationId !== value) {
			this.#presentationId = value
			this.emit('presentationId:changed', value)
		}
	}

	get presentationLocalRevision(): number {
		return this.#presentationLocalRevision
	}

	set presentationLocalRevision(value: number) {
		if (this.#presentationLocalRevision !== value) {
			this.#presentationLocalRevision = value
			this.emit('presentationLocalRevision:changed', value)
		}
	}

	get revision(): number {
		return this.#revision
	}

	set revision(value: number) {
		if (this.#revision !== value) {
			this.#revision = value
			this.emit('revision:changed', value)
		}
	}

	get itemId(): string {
		return this.#itemId
	}

	set itemId(value: string) {
		if (this.#itemId !== value) {
			this.#itemId = value
			this.emit('itemId:changed', value)
		}
	}

	get currentItemIndex(): number {
		return this.#currentItemIndex
	}

	set currentItemIndex(value: number) {
		if (this.#currentItemIndex !== value) {
			this.#currentItemIndex = value
			this.emit('currentItemIndex:changed', value)
		}
	}

	get slideIndex(): number {
		return this.#slideIndex
	}

	set slideIndex(value: number) {
		if (this.#slideIndex !== value) {
			this.#slideIndex = value
			this.emit('slideIndex:changed', value)
		}
	}

	get quickScreenKind(): QuickScreenKind {
		return this.#quickScreenKind
	}

	set quickScreenKind(value: QuickScreenKind) {
		if (this.#quickScreenKind !== value) {
			this.#quickScreenKind = value
			this.emit('quickScreenKind:changed', value)
		}
	}

	get mediaState(): string {
		return this.#mediaState
	}

	set mediaState(value: string) {
		if (this.#mediaState !== value) {
			this.#mediaState = value
			this.emit('mediaState:changed', value)
		}
	}
}
