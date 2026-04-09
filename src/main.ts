import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpdatePresets } from './presets.js'
import { ProclaimAPI } from './api.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	
	config!: ModuleConfig // Setup in init()
	proclaimAPI!: ProclaimAPI // Setup in init()

	constructor(internal: unknown) {
		super(internal)
	}

	// When module initialised
	async init(config: ModuleConfig): Promise<void> {
		this.config = config

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
		await this.configUpdated(config)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.proclaimAPI.destroy()
	}

	// When module config updated
	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		this.proclaimAPI.configure()
	}

	// Return config fields for web config
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
