import { InstanceStatus } from '@companion-module/base'
import { fetch } from 'undici'
import { ModuleInstance } from './main.js'
import { ProclaimStatus } from './status.js'
import { Presentation, PresentationStatus, ProclaimAuthResponse } from './apiTypes.js'

// Handle the interaction with Proclaim
export class ProclaimAPI {
	#instance: ModuleInstance
	#ip: string
	#password?: string
	#status: ProclaimStatus = new ProclaimStatus()
	#pollInterval?: ReturnType<typeof setInterval>

	// Create a new ProclaimAPI object, storing a reference back to our module instance, and setting
	// up our state variables
	constructor(instance: ModuleInstance) {
		this.#instance = instance

		this.#ip = ''
		this.#password = ''

		this.#pollInterval = undefined // The interval ID for polling On Air status

		this.addEventListeners()
	}

	get status(): ProclaimStatus {
		return this.#status
	}

	get authRequired(): boolean {
		return this.#ip !== '127.0.0.1'
	}

	// Called when a new module configuration is supplied. Stash the ip and password, and
	// initialise on-air polling
	async configure(): Promise<void> {
		this.#ip = this.#instance.config.ip
		this.#password = this.#instance.secrets.password

		if (!this.configIsValid()) {
			this.#status.configIsValid = false
		}

		// Initialise on-air polling
		if (this.#pollInterval !== undefined) {
			clearInterval(this.#pollInterval)
		}
		await this.init_onair_poll()
	}

	private configIsValid(): boolean {
		return (
			this.#ip.length > 0 &&
			(!this.authRequired || (this.authRequired && this.#password !== undefined && this.#password?.length > 0))
		)
	}

	// When destroying, clear the interval for polling
	destroy(): void {
		if (this.#pollInterval !== undefined) {
			clearInterval(this.#pollInterval)
		}
	}

	// Event listeners to handle status changes
	private addEventListeners(): void {
		this.#status.on('configIsValid:changed', (_configIsValid) => {
			this.updateInstanceStatus()
		})

		this.#status.on('connected:changed', (_connected) => {
			this.updateInstanceStatus()
		})

		this.#status.on('authenticated:changed', (_authenticated) => {
			this.updateInstanceStatus()
		})

		this.#status.on('onAir:changed', (onAir) => {
			// Clear the presentation and presentation status when we go off air
			if (!onAir) {
				this.#status.presentation = null
				this.#status.presentationId = ''
				this.#status.presentationLocalRevision = 0
				this.#status.revision = 0
				this.#status.itemId = ''
				this.#status.slideIndex = -1
				this.#status.quickScreenKind = ''
				this.#status.mediaState = ''
				this.#status.currentItemIndex = -1
			}
		})

		this.#status.on('sessionId:changed', (_sessionId) => {
			void this.getPresentation().then((presentation) => {
				this.#status.presentation = presentation
			})
		})

		this.#status.on('itemId:changed', (itemId) => {
			const currentItemIndex = this.#status.presentation?.serviceItems.findIndex((item) => item.id === itemId)
			if (currentItemIndex !== undefined && currentItemIndex !== -1) {
				this.#status.currentItemIndex = currentItemIndex
			} else {
				this.#status.currentItemIndex = -1
			}
		})

		// TODO: Watch for presentionId changing, clear session ID and presentation to force reload
		// TODO: Watch for presentationLocalRevision changing and reload presentation
	}

	// Look at the various status flags and determine the overall module connection status
	private updateInstanceStatus(): void {
		if (!this.#ip) {
			this.#instance.updateStatus(InstanceStatus.BadConfig, 'IP not specified')
			return
		}

		if (!this.#status.connected) {
			this.#instance.updateStatus(InstanceStatus.Disconnected, 'Could not connect to Proclaim')
			return
		}

		if (this.authRequired && !this.#status.authenticated) {
			this.#instance.updateStatus(InstanceStatus.AuthenticationFailure, 'Proclaim authentication unsuccessful')
			return
		}

		this.#instance.updateStatus(InstanceStatus.Ok, 'Connected to Proclaim')
	}

	// Set up the regular polling of on-air status
	private async init_onair_poll(): Promise<void> {
		this.#pollInterval = setInterval(() => {
			void this.onair_poll()
		}, 1000)
		void this.onair_poll()
	}

	// Poll for on-air status
	private async onair_poll(): Promise<void> {
		const url = `http://${this.#ip}:52195/onair/session`
		const previouslyConnected = this.#status.connected

		try {
			const data = await fetch(url, {
				method: 'GET',
				headers: {
					Accept: 'text/plain',
				},
			}).then(async (response) => response.text())
			this.#status.connected = true

			// If we got a session ID back, we're on air! If we got blank, we're off air
			if (data.length > 0) {
				this.#status.onAir = true
				this.#status.sessionId = data
			} else {
				this.#status.onAir = false
				this.#status.sessionId = ''
			}

			// If Proclaim is now responding and wasn't previously, try to authenticate
			if (this.#status.connected && !previouslyConnected && this.authRequired) {
				await this.getAuthToken()
			}

			// If we are on air and have already got the presentation data, get presentation status
			if (this.#status.onAir && this.#status.presentation !== null) {
				const presentationStatus = await this.getPresentationStatus()

				if (presentationStatus !== null) {
					this.#instance.log('debug', `Proclaim status: ${JSON.stringify(presentationStatus, null, 2)}`)
					this.#status.presentationId = presentationStatus.presentationId
					this.#status.presentationLocalRevision = presentationStatus.presentationLocalRevision
					this.#status.revision = presentationStatus.status.revision
					this.#status.itemId = presentationStatus.status.itemId
					this.#status.slideIndex = presentationStatus.status.slideIndex
					this.#status.quickScreenKind = presentationStatus.status.quickScreenKind
					this.#status.mediaState = presentationStatus.status.mediaState
				} else {
					this.#instance.log('debug', 'Proclaim status: null')
					this.#status.presentationId = ''
					this.#status.presentationLocalRevision = 0
					this.#status.revision = 0
					this.#status.itemId = ''
					this.#status.slideIndex = -1
					this.#status.quickScreenKind = ''
					this.#status.mediaState = ''
				}
			}
		} catch (error: any) {
			// Something went wrong obtaining on-air status - can't connect to Proclaim
			this.#instance.log('warn', `On Air status error: ${error.message}`)
			this.#status.connected = false
			this.#status.onAir = false
			this.#status.sessionId = ''
		}
	}

	async reconnect(): Promise<void> {
		if (this.authRequired) {
			await this.getAuthToken()
		}
	}

	// Get an authentication token from Proclaim
	private async getAuthToken(): Promise<void> {
		const url = `http://${this.#ip}:52195/appCommand/authenticate`
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					Password: this.#password,
				}),
			})

			if (!response.ok) {
				this.#instance.log('warn', 'Authentication error in getAuthToken()')
				if (this.authRequired) {
					this.#status.authenticated = false
				}
				return
			}

			const data = (await response.json()) as ProclaimAuthResponse
			this.#status.authToken = data?.proclaimAuthToken
			this.#status.authenticated = true
		} catch (error: any) {
			this.#instance.log('warn', `Authentication error in getAuthToken(): ${error.message}`)
			if (this.authRequired) {
				this.#status.authenticated = false
			}
		}
	}

	// Send any app command to Proclaim
	async sendAppCommand(command: string, index?: number): Promise<void> {
		let url = `http://${this.#ip}:52195/appCommand/perform?appCommandName=${command}`
		if (index !== undefined) {
			url = `${url}&index=${index}`
		}

		try {
			const response = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					...(this.authRequired && this.#status.authenticated ? { ProclaimAuthToken: this.#status.authToken } : {}),
				},
			})

			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					this.#instance.log('warn', `Proclaim authentication failed: ${response.status} ${response.statusText}`)
					this.#status.authenticated = false
					this.#status.authToken = ''
				} else {
					this.#instance.log('warn', `Proclaim command failed: ${response.status} ${response.statusText}`)
				}
				return
			}
			const data = await response.text()
			if (data !== 'success') {
				this.#instance.log('debug', `Unexpected response from Proclaim: ${data}`)
			}
		} catch (error: any) {
			this.#instance.log('warn', `Proclaim command failed: ${error.message}`)
		}
	}

	async getPresentation(): Promise<Presentation | null> {
		if (this.#status.sessionId.length === 0) {
			this.#instance.log('debug', 'No sessionId available, cannot fetch presentation')
			return null
		}

		this.#instance.log(
			'debug',
			`Fetching presentation for sessionId: ${this.#status.sessionId} using authToken: ${this.#status.authToken}`,
		)

		const url = `http://${this.#ip}:52195/presentations/onair`

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Onairsessionid: this.#status.sessionId,
				...(this.authRequired && this.#status.authenticated ? { ProclaimAuthToken: this.#status.authToken } : {}),
			},
		})

		return response.ok ? ((await response.json()) as Presentation) : null
	}

	private async getPresentationStatus(): Promise<PresentationStatus | null> {
		const url = `http://${this.#ip}:52195/onair/statusChanged?localrevision=${this.#status.presentation?.localRevision}&step=0`
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Onairsessionid: this.#status.sessionId,
				...(this.authRequired && this.#status.authenticated ? { ProclaimAuthToken: this.#status.authToken } : {}),
			},
		})
		if (!response.ok) {
			this.#instance.log('warn', `Proclaim status request failed: ${response.status} ${response.statusText}`)
			return null
		}
		return (await response.json()) as PresentationStatus
	}
}
