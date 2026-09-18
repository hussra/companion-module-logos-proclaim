import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, type ModuleSecrets } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpdatePresets } from './presets.js'
import { ProclaimAPI } from './api.js'

export class ModuleInstance extends InstanceBase<ModuleConfig, ModuleSecrets> {
	config!: ModuleConfig // Set up in init()
	secrets!: ModuleSecrets // Set up in init()
	proclaimAPI!: ProclaimAPI // Set up in init()

	constructor(internal: unknown) {
		super(internal)
	}

	// When module initialised
	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
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
			session_id: '',
			presentation_title: '',
			presentation_id: '',
			presentation_group_name: '',
			presentation_group_id: '',
			presentation_aspect_ratio: '',
			presentation_date: '',
			presentation_start_time: '',
		})

		// Process module config
		await this.configUpdated(config, secrets)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.proclaimAPI.destroy()
	}

	// When module config updated
	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		await this.proclaimAPI.configure()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
