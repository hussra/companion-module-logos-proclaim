import { InstanceStatus } from '@companion-module/base'
import { got } from 'got'

// Handle the interaction with Proclaim
export class ProclaimAPI {
	// Create a new ProclaimAPI object, storing a reference back to our module instance, and setting
	// up our state variables
	constructor(instance) {
		this.instance = instance

		this.ip = ''
		this.password = ''

		this.on_air = false // Is Proclaim "On Air"?
		this.on_air_session_id = '' // Proclaim On Air Session ID
		this.on_air_successful = false // Were we able to connect to check Proclaim's On Air status?
		this.onair_poll_interval = undefined // The interval ID for polling On Air status
		this.proclaim_auth_required = false // Does Proclaim require authentication for App Commands?
		this.proclaim_auth_successful = false // Were we able to authenticate to Proclaim?
		this.proclaim_auth_token = '' // Proclaim authentication token

		this.experimental_api = false // Is the experimental API enabled?
		this.experimental_api_presentation_data = {} // Data on the currently on-air presentation
		this.experimental_api_presentation_local_revision = -1
		this.experimental_api_connection_id = ''
		this.experimental_api_authentication_token = ''

		this.experimental_api_current_currentItem_id = ''
		this.experimental_api_current_currentItem_title = ''
		this.experimental_api_current_item_type = ''
		this.experimental_api_current_item_slide_index = ''
		this.experimental_api_current_item_slide_count = ''
		this.experimental_api_current_quick_screen = ''
		this.experimental_api_current_current_media_state = ''
	}

	// Called when a new module configuration is supplied. Stash the ip and password, and
	// initialise on-air polling
	configure() {
		this.ip = this.instance.config.ip
		this.password = this.instance.config.password
		this.experimental_api = this.instance.config.experimental_api

		// Initialise on-air polling
		if (this.onair_poll_interval !== undefined) {
			clearInterval(this.onair_poll_interval)
		}
		this.init_onair_poll()

		// Does Proclaim require authentication?
		this.proclaim_auth_required = this.ip != '127.0.0.1'
		if (this.proclaim_auth_required) {
			// Ask for an auth token
			this.getAuthToken()
		}

		this.experimentalApiClearPresentationData()
	}

	// When destroying, clear the interval for polling
	destroy() {
		if (this.onair_poll_interval !== undefined) {
			clearInterval(this.onair_poll_interval)
		}
	}

	// Look at the various status flags and determine the overall module connection status
	setModuleStatus() {
		if (!this.ip) {
			this.instance.updateStatus(InstanceStatus.BadConfig, 'IP not specified')
			return
		}

		if (!this.on_air_successful) {
			this.instance.updateStatus(InstanceStatus.Disconnected, 'Could not connect to Proclaim')
			return
		}

		if (this.proclaim_auth_required && !this.proclaim_auth_successful) {
			this.instance.updateStatus(InstanceStatus.ConnectionFailure, 'Proclaim authentication unsuccessful')
			return
		}

		this.instance.updateStatus(InstanceStatus.Ok)
	}

	// Set up the regular polling of on-air status
	init_onair_poll() {
		this.onair_poll_interval = setInterval(() => {
			this.onair_poll()
		}, 1000)
		this.onair_poll()
	}

	// Poll for on-air status
	async onair_poll() {
		if (!this.ip) {
			this.setModuleStatus()
			return
		}

		const url = `http://${this.ip}:52195/onair/session`
		const on_air_previously_successful = this.on_air_successful

		try {
			const data = await got(url, {
				timeout: {
					request: 1000,
				},
				retry: {
					limit: 0,
				},
			}).text()

			this.on_air_successful = true

			// If we got a session ID back, we're on air! If we got blank, we're off air
			if (data.length > 30) {
				this.on_air = true
				this.on_air_session_id = data.replace(/^\uFEFF/, '')
				this.instance.setVariableValues({
					on_air: true,
					on_air_session_id: this.on_air_session_id,
				})

				if (this.experimental_api) {
					// Get info about the on-air presentation
					await this.experimentalApiGetPresentationData()
					await this.experimentalApiGetStatus()
				}
			} else {
				this.on_air = false
				this.on_air_session_id = ''
				this.instance.setVariableValues({
					on_air: false,
					on_air_session_id: '',
				})

				if (this.experimental_api) {
					this.experimentalApiClearPresentationData()
				}
			}
			this.instance.checkFeedbacks('on_air')
			this.setModuleStatus()

			// If Proclaim is now responding and wasn't previously, try to authenticate
			if (this.on_air_successful && !on_air_previously_successful && this.proclaim_auth_required) {
				this.getAuthToken()
			}
		} catch (error) {
			// Something went wrong obtaining on-air status - can't connect to Proclaim
			this.on_air_successful = false
			this.on_air = false
			this.on_air_session_id = ''
			if (this.experimental_api) {
				this.experimentalApiClearPresentationData()
			}
			this.instance.setVariableValues({
				on_air: false,
				on_air_session_id: '',
			})
			this.instance.checkFeedbacks('on_air')
			this.setModuleStatus()
		}
	}

	// Get an authentication token from Proclaim
	async getAuthToken() {
		const url = `http://${this.ip}:52195/appCommand/authenticate`
		var data
		try {
			data = await got
				.post(url, {
					timeout: {
						request: 1000,
					},
					retry: {
						limit: 0,
					},
					json: {
						Password: this.password,
					},
				})
				.text()
			// }).json();
			// Calling json() returns a ERR_BODY_PARSE_FAILURE, I think because Proclaim is returning
			// content-type: text/html rather than application/json

			// Maybe because we're calling text() not json(), or maybe there's some issue in the encoding of
			// Proclaim's response, we need to strip the byte order marker before parsing. I don't like this.
			const parsed = JSON.parse(data.replace(/^\uFEFF/, ''))
			this.proclaim_auth_successful = true
			this.proclaim_auth_token = parsed.proclaimAuthToken

			this.setModuleStatus()
		} catch (error) {
			if (error.response && error.response.statusCode == 401 && this.proclaim_auth_required) {
				this.proclaim_auth_successful = false
				this.setModuleStatus()
			}
		}
	}

	experimentalApiClearPresentationData() {
		this.experimental_api_presentation_data = {}
		this.experimental_api_presentation_local_revision = -1
		this.instance.setVariableValues({
			presentation_name: '',
			presentation_local_revision: '',
			connection_id: '',
			authentication_token: '',
		})
	}

	// Obtain data on the current presentation
	async experimentalApiGetPresentationData() {
		const url = `http://${this.ip}:52195/presentations/onair`
		var data
		try {
			data = await got
				.get(url, {
					timeout: {
						request: 1000,
					},
					retry: {
						limit: 0,
					},
					headers: {
						OnAirSessionId: this.on_air_session_id,
					},
					hooks: {
						beforeRequest: [
							(options) => {
								options.headers['OnAirSessionId'] = options.headers['onairsessionid']
							},
						],
					},
				})
				.text()

			const parsed = JSON.parse(data.replace(/^\uFEFF/, ''))
			if (parsed.localRevision != this.experimental_api_presentation_local_revision) {
				this.experimental_api_presentation_data = parsed
				this.experimental_api_presentation_local_revision = parsed.localRevision
				this.instance.setVariableValues({
					presentation_name: this.experimental_api_presentation_data.title,
					localRevision: this.experimental_api_presentation_local_revision,
				})
				await this.experimentalApiGetRemoteAuthToken()
			}
		} catch (error) {
			console.log('Error retrieving presentation data: ' + JSON.stringify(error))
			this.proclaim_auth_successful = false
			this.setModuleStatus()
		}
	}

	async experimentalApiGetRemoteAuthToken() {
		const url = `http://${this.ip}:52195/auth/control`

		var data
		try {
			data = await got
				.post(url, {
					timeout: {
						request: 1000,
					},
					retry: {
						limit: 0,
					},
					headers: {
						OnAirSessionId: this.on_air_session_id,
					},
					json: {
						Password: 'Proclaim',
					},
					hooks: {
						beforeRequest: [
							(options) => {
								options.headers['OnAirSessionId'] = options.headers['onairsessionid']
							},
						],
					},
				})
				.text()

			const parsed = JSON.parse(data.replace(/^\uFEFF/, ''))

			this.experimental_api_connection_id = parsed.connectionId
			this.experimental_api_authentication_token = parsed.authenticationToken

			// Temporary for debugging
			this.instance.setVariableValues({
				connection_id: this.experimental_api_connection_id,
				authentication_token: this.experimental_api_authentication_token,
			})

			console.log('Remote auth response: ' + JSON.stringify(parsed))
		} catch (error) {
			console.log('Error getting remote auth: ' + JSON.stringify(error))
			this.experimental_api_connection_id = ''
			this.experimental_api_authentication_token = ''

			// Temporary for debugging
			this.instance.setVariableValues({
				connection_id: this.experimental_api_connection_id,
				authentication_token: this.experimental_api_authentication_token,
			})
		}
	}

	async experimentalApiGetStatus() {
		const url = `http://${this.ip}:52195/onair/statusChanged?localrevision=-9223372036854775808&step=-2147483648`

		var data
		try {
			data = await got
				.get(url, {
					timeout: {
						request: 1000,
					},
					retry: {
						limit: 0,
					},
					headers: {
						OnAirSessionId: this.on_air_session_id,
						ConnectionId: this.experimental_api_connection_id,
					},
					hooks: {
						beforeRequest: [
							(options) => {
								options.headers['OnAirSessionId'] = options.headers['onairsessionid']
								options.headers['ConnectionId'] = options.headers['connectionid']
							},
						],
					},
				})
				.text()

			const parsed = JSON.parse(data.replace(/^\uFEFF/, ''))

			this.experimental_api_current_item_id = parsed.status.itemId
			this.experimental_api_current_item_slide_index = parsed.status.slideIndex
			this.experimental_api_current_quick_screen = parsed.status.quickScreenKind
			this.experimental_api_current_current_media_state = parsed.status.mediaState

			const currentItem = this.experimental_api_presentation_data.serviceItems.find(function (item) {
				return item.id === parsed.status.itemId
			})

			//this.experimental_api_current_item_title = JSON.stringify(currentItem)
			this.experimental_api_current_item_title = currentItem.title
			this.experimental_api_current_item_type = currentItem.kind
			this.experimental_api_current_item_slide_count = currentItem.slides.length

			this.instance.setVariableValues({
				current_item_id: this.experimental_api_current_item_id,
				current_item_title: this.experimental_api_current_item_title,
				current_item_type: this.experimental_api_current_item_type,
				current_item_slide_index: this.experimental_api_current_item_slide_index + 1,
				current_item_slide_count: this.experimental_api_current_item_slide_count,
				current_quick_screen: this.experimental_api_current_quick_screen,
				current_media_state: this.experimental_api_current_media_state,
			})
		} catch (error) {
			console.log('Error getting status: ' + JSON.stringify(error))
		}
	}

	// Send any app command to Proclaim
	async sendAppCommand(command, index) {
		let url = `http://${this.ip}:52195/appCommand/perform?appCommandName=${command}`
		if (index !== undefined) {
			url = `${url}&index=${index}`
		}

		const options = {
			timeout: {
				request: 1000,
			},
			retry: {
				limit: 0,
			},
		}

		if (this.proclaim_auth_required) {
			if (!this.proclaim_auth_successful) {
				return
			}

			options.headers = {
				ProclaimAuthToken: this.proclaim_auth_token,
			}

			// This shouldn't be necessary... but it is, for now.
			// Proclaim requires the ProclaimAuthToken header name to be CamelCase, though
			// the HTTP spec says header names are case-insensitive.
			options.hooks = {
				beforeRequest: [
					(options) => {
						options.headers['ProclaimAuthToken'] = options.headers['proclaimauthtoken']
					},
				],
			}
		}

		try {
			const data = (await got(url, options).text()).replace(/^\uFEFF/, '')
			if (data != 'success') {
				this.log('debug', `Unexpected response from Proclaim: ${data}`)
			}
		} catch (error) {
			if (error.response.statusCode == 401 && this.proclaim_auth_required) {
				this.proclaim_auth_successful = false
				this.proclaim_auth_token = ''
				this.setModuleStatus()
			}
		}
	}
}
