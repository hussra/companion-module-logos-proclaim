import { InstanceBase, runEntrypoint, InstanceStatus, Regex } from '@companion-module/base'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpdatePresets } from './presets.js'
import got from 'got'

class ProclaimInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	// When module initialised
	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		// Reference data
		this.song_parts = [
			{ id: 0, label: 'Verse', path: 'verse' },
			{ id: 1, label: 'Chorus', path: 'chorus' },
			{ id: 2, label: 'Bridge', path: 'bridge' },
			{ id: 3, label: 'Prechorus', displayLabel: 'Pre\nchorus', path: 'prechorus' },
			{ id: 4, label: 'Interlude', displayLabel: 'Inter-lude', path: 'interlude' },
			{ id: 5, label: 'Tag', path: 'tag' },
			{ id: 6, label: 'Ending', path: 'ending' },
		]

		this.updateActions() // Export actions
		this.updateFeedbacks() // Export feedbacks
		this.updateVariableDefinitions() // Export variable definitions
		this.updatePresets() // Export presets

		// Initialise state
		this.setVariableValues({
			on_air: false,
		})
		this.on_air = false // Is Proclaim "On Air"?
		this.on_air_session_id = '' // Proclaim On Air Session ID
		this.on_air_successful = false // Were we able to connect to check Proclaim's On Air status?
		this.onair_poll_interval = undefined // The interval ID for polling On Air status
		this.proclaim_auth_required = false // Does Proclaim require authentication for App Commands?
		this.proclaim_auth_successful = false // Were we able to authenticate to Proclaim?
		this.proclaim_auth_token = '' // Proclaim authentication token

		// Process module config
		await this.configUpdated(config)
	}

	// When module gets deleted
	async destroy() {
		if (this.onair_poll_interval !== undefined) {
			clearInterval(this.onair_poll_interval)
		}
	}

	// When module config updated
	async configUpdated(config) {
		this.config = config

		// Initialise on-air polling
		if (this.onair_poll_interval !== undefined) {
			clearInterval(this.onair_poll_interval)
		}
		this.init_onair_poll()

		// Does Proclaim require authentication?
		this.proclaim_auth_required = config.ip != '127.0.0.1'
		if (this.proclaim_auth_required) {
			// Ask for an auth token
			this.getAuthToken()
		}
	}

	// Look at the various status flags and determine the overall module connection status
	setModuleStatus() {
		if (!this.config.ip) {
			this.updateStatus(InstanceStatus.BadConfig, 'IP not specified')
			return
		}

		if (!this.on_air_successful) {
			this.updateStatus(InstanceStatus.Disconnected, 'Could not connect to Proclaim')
			return
		}

		if (this.proclaim_auth_required && !this.proclaim_auth_successful) {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Proclaim authentication unsuccessful')
			return
		}

		this.updateStatus(InstanceStatus.Ok)
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
		if (!this.config.ip) {
			this.setModuleStatus()
			return
		}

		const url = `http://${this.config.ip}:52195/onair/session`
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
				this.on_air_session_id = data
				this.setVariableValues({
					on_air: true,
				})
			} else {
				this.on_air = false
				this.on_air_session_id = ''
				this.setVariableValues({
					on_air: false,
				})
			}
			this.checkFeedbacks('on_air')
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
			this.setVariableValues({
				on_air: 0,
			})
			this.checkFeedbacks('on_air')
			this.setModuleStatus()
		}
	}

	// Send any app command to Proclaim
	async sendAppCommand(command, index) {
		let url = `http://${this.config.ip}:52195/appCommand/perform?appCommandName=${command}`
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

	// Get an authentication token from Proclaim
	async getAuthToken() {
		const url = `http://${this.config.ip}:52195/appCommand/authenticate`
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
						Password: this.config.password,
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

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'intro',
				label: 'Configuration Help',
				value: `<p>First ensure that Proclaim's "Local Server" is enabled (see <b>Settings > Remote</b>).</p>
				<p>If you are running Proclaim and Companion on different computers, you must also note the Proclaim
				computer's IP address, and set a Network Control Password in <b>Settings > Remote</b>.</p>
				<p>Then enter the IP address and password below.</p>
				<p>See the Help for this module for further details.</p>`,
				width: 12,
			},
			{
				type: 'textinput',
				id: 'ip',
				label: 'Proclaim computer IP address',
				width: 6,
				regex: Regex.IP,
				default: '127.0.0.1',
				required: true,
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 6,
				isVisible: (configValues) => configValues.ip !== '127.0.0.1',
				required: true,
			},
			{
				type: 'static-text',
				id: 'experimental-intro',
				label: '',
				value: `<p>Tick the box below to enable additional experimental features which rely on unpublished Proclaim APIs.
				These features enhance the functionality of the module, but may stop working if these APIs are changed within
				Proclaim. Use at your own risk.</p>`,
				width: 12,
			},
			{
				type: 'checkbox',
				id: 'experimental-api',
				label: 'Enable experimental features?',
				default: false,
				width: 6,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	updatePresets() {
		UpdatePresets(this)
	}
}

runEntrypoint(ProclaimInstance, UpgradeScripts)
