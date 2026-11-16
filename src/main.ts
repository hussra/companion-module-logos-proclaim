import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, type ModuleSecrets } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { InitializeVariables, UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpdatePresets } from './presets/index.js'
import { ProclaimAPI } from '@hussra/logos-proclaim'
import { AddEventListeners } from './events.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: ModuleSecrets
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
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

		// Our connection to Proclaim
		this.proclaimAPI = new ProclaimAPI()

		// Register UpdateActions, feedbacks, variables and presets
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()

		// Initialise variables
		this.initializeVariables()

		// Listen for Proclaim events and update module status, feedbacks and variables
		this.addEventListeners()

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
		await this.proclaimAPI.configure(config.ip, secrets.password)
		this.updatePresets()
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

	initializeVariables(): void {
		InitializeVariables(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	addEventListeners(): void {
		AddEventListeners(this)
	}
}
