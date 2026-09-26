import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, type ModuleSecrets } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { InitializeVariables, UpdateVariableDefinitions } from './variables.js'
import { UpdatePresets } from './presets.js'
import { ProclaimAPI } from './api.js'
import { ServiceItem } from './apiTypes.js'

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

		this.initializeVariables()

		// Set up API connection and add event listeners for feedbacks and variables
		this.proclaimAPI = new ProclaimAPI(this)
		this.addEventListeners(this.proclaimAPI)

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

	initializeVariables(): void {
		InitializeVariables(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	// Event listeners to handle variables and feedbacks on status changes
	private addEventListeners(proclaimAPI: ProclaimAPI) {
		proclaimAPI.status.on('onAir:changed', (onAir) => {
			this.setVariableValues({
				on_air: onAir,
			})
			this.checkFeedbacks('on_air')
			this.checkFeedbacks('in_service_part')
		})

		proclaimAPI.status.on('sessionId:changed', (sessionId) => {
			this.setVariableValues({
				session_id: sessionId,
			})
		})

		proclaimAPI.status.on('presentation:changed', (presentation) => {
			this.setVariableValues({
				presentation_title: presentation ? presentation.title : '',
				presentation_id: presentation ? presentation.id : '',
				presentation_group_name: presentation ? presentation.groupName : '',
				presentation_group_id: presentation ? presentation.groupId : '',
				presentation_aspect_ratio: presentation ? presentation.aspectRatio : '',
				presentation_date: presentation ? this.ticksToUnixTime(presentation.dateGiven) : '',
				presentation_start_time: presentation ? this.ticksToUnixTime(presentation.startTime) : '',
				item_count: presentation ? presentation.serviceItems.length : 0,
			})
		})

		proclaimAPI.status.on('currentItemIndex:changed', (currentItemIndex) => {
			if (currentItemIndex !== -1) {
				const currentItem = this.proclaimAPI.status.presentation?.serviceItems[currentItemIndex] as ServiceItem
				this.setVariableValues({
					item_id: currentItem.id,
					item_title: currentItem.title,
					item_index: currentItemIndex + 1, // Convert from 0-based to 1-based for user display
					slide_count: currentItem.slides.length,
				})
			} else {
				this.setVariableValues({
					item_id: '',
					item_title: '',
					item_index: 0,
					slide_count: 0,
				})
			}
			this.checkFeedbacks('in_service_part')
		})

		proclaimAPI.status.on('slideIndex:changed', (slideIndex) => {
			this.setVariableValues({
				slide_index: slideIndex + 1, // Convert from 0-based to 1-based for user display
			})
		})
	}

	// Proclaim timestamps are .NET ticks - convert them to a Unix timestamp
	private ticksToUnixTime(tick: number): number {
		return (tick - 621355968000000000) / 10000
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
