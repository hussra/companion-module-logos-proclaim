import type {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from './config.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets>[] = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	function (
		context: CompanionUpgradeContext<ModuleConfig>,
		_props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>,
	): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
		return {
			updatedConfig: {
				ip: context.currentConfig.ip,
				// Password will be removed - moving to secrets
				remote_api: false,
			},
			updatedSecrets: {
				password: context.currentConfig.password?.toString() || '',
			},
			updatedActions: [],
			updatedFeedbacks: [],
		}
	},
]
