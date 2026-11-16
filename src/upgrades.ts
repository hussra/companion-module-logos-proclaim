import type {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
} from '@companion-module/base'
import { type ModuleConfig, type ModuleSecrets } from './config.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets>[] = [
	/**
	 * Move password from config to secrets
	 */
	function (
		context: CompanionUpgradeContext<ModuleConfig>,
		_props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>,
	): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
		return {
			updatedConfig: {
				ip: context.currentConfig.ip,
				// Password will be removed - moving to secrets
				layeredPresets: false,
			},
			updatedSecrets: {
				password: context.currentConfig.password?.toString() || '',
			},
			updatedActions: [],
			updatedFeedbacks: [],
		}
	},

	/**
	 * Add preset style
	 */
	function (
		context: CompanionUpgradeContext<ModuleConfig>,
		_props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>,
	): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
		return {
			updatedConfig: {
				ip: context.currentConfig.ip,
				layeredPresets: false,
			},
			updatedSecrets: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
	},
]
