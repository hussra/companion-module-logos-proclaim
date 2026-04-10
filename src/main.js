import { InstanceBase, runEntrypoint, InstanceStatus, Regex } from '@companion-module/base'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpdatePresets } from './presets.js'
import { ProclaimAPI } from './api.js'

class ProclaimInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	// When module initialised
	async init(config, secrets) {
		this.config = config
		this.secrets = secrets

		this.updateStatus(InstanceStatus.Connecting)

		this.updateActions() // Export actions
		this.updateFeedbacks() // Export feedbacks
		this.updateVariableDefinitions() // Export variable definitions
		this.updatePresets() // Export presets

		this.proclaimAPI = new ProclaimAPI(this)

		// Initialise variables
		this.setVariableValues({
			on_air: false,
		})

		// Process module config
		await this.configUpdated(config, secrets)
	}

	// When module gets deleted
	async destroy() {
		this.proclaimAPI.destroy()
	}

	// When module config updated
	async configUpdated(config, secrets) {
		this.config = config
		this.secrets = secrets
		this.proclaimAPI.configure()
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
				type: 'secret-text',
				id: 'password',
				label: 'Password',
				width: 6,
				isVisibleExpression: "$(options:ip) !== '127.0.0.1'",
				required: true,
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
