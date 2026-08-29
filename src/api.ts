import { InstanceStatus } from '@companion-module/base'
import { fetch } from 'undici'
import { ModuleInstance } from './main.js'

interface ProclaimAuthResponse {
	proclaimAuthToken: string
}

// Handle the interaction with Proclaim
export class ProclaimAPI {
	#instance: ModuleInstance
	#ip: string
	#password?: string

	#on_air: boolean
	#on_air_session_id?: string
	#on_air_successful: boolean

	#onair_poll_interval?: ReturnType<typeof setInterval>

	#proclaim_auth_required: boolean
	#proclaim_auth_successful: boolean
	#proclaim_auth_token?: string

	#lastFetchError?: string

	// Create a new ProclaimAPI object, storing a reference back to our module instance, and setting
	// up our state variables
	constructor(instance: ModuleInstance) {
		this.#instance = instance

		this.#ip = ''
		this.#password = ''

		this.#on_air = false // Is Proclaim "On Air"?
		this.#on_air_session_id = '' // Proclaim On Air Session ID
		this.#on_air_successful = false // Were we able to connect to check Proclaim's On Air status?
		this.#onair_poll_interval = undefined // The interval ID for polling On Air status
		this.#proclaim_auth_required = false // Does Proclaim require authentication for App Commands?
		this.#proclaim_auth_successful = false // Were we able to authenticate to Proclaim?
		this.#proclaim_auth_token = '' // Proclaim authentication token
	}

	get on_air(): boolean {
		return this.#on_air
	}

	get on_air_session_id(): string | undefined {
		return this.#on_air_session_id
	}

	// Called when a new module configuration is supplied. Stash the ip and password, and
	// initialise on-air polling
	async configure(): Promise<void> {
		this.#ip = this.#instance.config.ip
		this.#password = this.#instance.secrets.password

		// Initialise on-air polling
		if (this.#onair_poll_interval !== undefined) {
			clearInterval(this.#onair_poll_interval)
		}
		await this.init_onair_poll()

		// Does Proclaim require authentication?
		this.#proclaim_auth_required = this.#ip !== '127.0.0.1'
		if (this.#proclaim_auth_required) {
			// Ask for an auth token
			await this.getAuthToken()
		}

		this.setModuleStatus()
	}

	// When destroying, clear the interval for polling
	destroy(): void {
		if (this.#onair_poll_interval !== undefined) {
			clearInterval(this.#onair_poll_interval)
		}
	}

	// Look at the various status flags and determine the overall module connection status
	private setModuleStatus(): void {
		if (!this.#ip) {
			this.#instance.updateStatus(InstanceStatus.BadConfig, 'IP not specified')
			return
		}

		if (!this.#on_air_successful) {
			this.#instance.updateStatus(InstanceStatus.Disconnected, 'Could not connect to Proclaim')
			return
		}

		if (this.#proclaim_auth_required && !this.#proclaim_auth_successful) {
			this.#instance.updateStatus(InstanceStatus.AuthenticationFailure, 'Proclaim authentication unsuccessful')
			return
		}

		this.#instance.updateStatus(InstanceStatus.Ok, 'Connected to Proclaim')
	}

	// Set up the regular polling of on-air status
	private async init_onair_poll(): Promise<void> {
		this.#onair_poll_interval = setInterval(() => {
			void this.onair_poll()
		}, 1000)
		void this.onair_poll()
	}

	// Poll for on-air status
	private async onair_poll(): Promise<void> {
		if (!this.#ip) {
			this.setModuleStatus()
			return
		}

		const url = `http://${this.#ip}:52195/onair/session`
		const previous_on_air_successful = this.#on_air_successful
		const previous_on_air = this.#on_air
		const previous_on_air_session_id = this.#on_air_session_id

		try {
			const data = await fetch(url, {
				method: 'GET',
				headers: {
					Accept: 'text/plain',
				},
			}).then(async (response) => response.text())
			this.#on_air_successful = true
			if (!previous_on_air_successful) {
				this.#instance.log('info', 'Retrieved On Air status successfully')
			}

			// If we got a session ID back, we're on air! If we got blank, we're off air
			if (data.length > 0) {
				this.#on_air = true
				this.#on_air_session_id = data
			} else {
				this.#on_air = false
				this.#on_air_session_id = ''
			}
		} catch (error: any) {
			// Something went wrong obtaining on-air status - can't connect to Proclaim
			this.#on_air_successful = false
			this.#on_air = false
			this.#on_air_session_id = ''
			if (error.message !== this.#lastFetchError) {
				this.#instance.log('warn', `Unable to retrieve On Air status: ${error.message}`)
			}
			this.#lastFetchError = error.message
		}

		if (this.#on_air !== previous_on_air) {
			this.#instance.log('info', 'on air status changed')
			// On air status changed
			this.#instance.setVariableValues({
				on_air: this.#on_air,
			})
			this.#instance.checkFeedbacks('on_air')
			this.setModuleStatus()
		}

		if (this.#on_air_session_id !== previous_on_air_session_id) {
			// On air session ID changed
			if (this.#on_air_session_id === '') {
				this.#instance.log('info', 'Gone off air, erase previously cached presentation data')
			} else {
				this.#instance.log('info', 'Gone on air, retrieve and cache presentation data')
			}
		}

		// If Proclaim is now responding and wasn't previously, try to authenticate
		if (this.#on_air_successful && !previous_on_air_successful && this.#proclaim_auth_required) {
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
				if (this.#proclaim_auth_required) {
					this.#proclaim_auth_successful = false
					this.setModuleStatus()
				}
				return
			}

			const data = (await response.json()) as ProclaimAuthResponse
			this.#proclaim_auth_successful = true
			this.#proclaim_auth_token = data?.proclaimAuthToken
			this.setModuleStatus()
		} catch (error: any) {
			this.#instance.log('warn', `Authentication error in getAuthToken(): ${error.message}`)
			if (this.#proclaim_auth_required) {
				this.#proclaim_auth_successful = false
				this.setModuleStatus()
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
			const data = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					...(this.#proclaim_auth_required && this.#proclaim_auth_successful
						? { ProclaimAuthToken: this.#proclaim_auth_token }
						: {}),
				},
			}).then(async (response) => response.text())
			if (data !== 'success') {
				this.#instance.log('debug', `Unexpected response from Proclaim: ${data}`)
			}
		} catch (error: any) {
			this.#instance.log('warn', `Command failed in sendAppCommand(): ${error.message}`)
			if ((error.response?.statusCode == 401 || error.response?.statusCode == 403) && this.#proclaim_auth_required) {
				this.#proclaim_auth_successful = false
				this.#proclaim_auth_token = ''
				this.setModuleStatus()
			}
		}
	}
}
